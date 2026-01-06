import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email: string, password: string, name: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                    },
                },
            });

            if (error) throw error;

            if (data.user) {
                toast({
                    title: "Account created successfully! 🌱",
                    description: "Welcome to Eco-Sync! Please check your email to verify your account.",
                    variant: "default",
                    duration: 4000,
                });
            }
        } catch (error) {
            const authError = error as AuthError;
            toast({
                title: "Sign up failed",
                description: authError.message || "An error occurred during sign up",
                variant: "destructive",
                duration: 5000,
            });
            throw error;
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.user) {
                toast({
                    title: "Welcome back! 🌿",
                    description: "You've successfully signed in.",
                    variant: "default",
                    duration: 4000,
                });
            }
        } catch (error) {
            const authError = error as AuthError;
            toast({
                title: "Sign in failed",
                description: authError.message || "An error occurred during sign in",
                variant: "destructive",
                duration: 5000,
            });
            throw error;
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            toast({
                title: "Signed out successfully",
                description: "See you soon! 🍃",
                variant: "default",
                duration: 4000,
            });
        } catch (error) {
            const authError = error as AuthError;
            toast({
                title: "Sign out failed",
                description: authError.message || "An error occurred during sign out",
                variant: "destructive",
                duration: 5000,
            });
            throw error;
        }
    };

    const value = {
        user,
        loading,
        signUp,
        signIn,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

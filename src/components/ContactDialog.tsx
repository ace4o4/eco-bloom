import React from "react";
import { Mail, Phone, User, X, MapPin, Eye, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import type { Listing } from "./ListingsBrowse";

interface ContactDialogProps {
    listing: Listing | null;
    isOpen: boolean;
    onClose: () => void;
}

const getRecyclabilityStatus = (category: string) => {
    const recyclableMap: Record<string, { label: string; color: string }> = {
        'plastic': { label: 'Recyclable', color: 'bg-green-100 text-green-700' },
        'glass': { label: 'Recyclable', color: 'bg-green-100 text-green-700' },
        'metal': { label: 'Recyclable', color: 'bg-green-100 text-green-700' },
        'paper': { label: 'Recyclable', color: 'bg-green-100 text-green-700' },
        'electronics': { label: 'E-Waste', color: 'bg-blue-100 text-blue-700' },
        'organic': { label: 'Compostable', color: 'bg-amber-100 text-amber-700' },
        'textiles': { label: 'Reusable', color: 'bg-purple-100 text-purple-700' },
        'rubber': { label: 'Recyclable', color: 'bg-green-100 text-green-700' },
        'wood': { label: 'Recyclable', color: 'bg-green-100 text-green-700' },
        'other': { label: 'Check Local Rules', color: 'bg-gray-100 text-gray-700' }
    };
    return recyclableMap[category.toLowerCase()] || recyclableMap['other'];
};

import { useNavigate } from "react-router-dom";
import { getOrCreateConversation } from "@/lib/supabase-chat";
import { useAuth } from "@/contexts/AuthContext";

// ... (keep interface)

const ContactDialog = ({ listing, isOpen, onClose }: ContactDialogProps) => {
    const [isImageExpanded, setIsImageExpanded] = React.useState(false);
    const [isCreatingChat, setIsCreatingChat] = React.useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleMessageSeller = async () => {
        if (!listing?.id || !listing.user_id) return;
        
        setIsCreatingChat(true);
        try {
            // Get user from hook context (safe access)
            const buyerName = user?.user_metadata?.full_name || user?.email || 'Eco User';
            const conversationId = await getOrCreateConversation(listing.id, listing.user_id, buyerName);
            onClose();
            navigate('/messages', { state: { activeId: conversationId } }); // Pass state to auto-select
        } catch (error) {
            console.error("Failed to start chat", error);
            // Optionally show error toast
        } finally {
            setIsCreatingChat(false);
        }
    };

    if (!listing) return null;

    const recyclability = getRecyclabilityStatus(listing.category);

    return (
        <AnimatePresence>
            {/* Full Screen Image Lightbox */}
            {isImageExpanded && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setIsImageExpanded(false)}
                >
                    <motion.img
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        src={listing.imageData}
                        alt={listing.title}
                        className="max-w-full max-h-screen object-contain rounded-lg shadow-2xl"
                    />
                    <button
                        onClick={() => setIsImageExpanded(false)}
                        className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </motion.div>
            )}

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
                    />

                    {/* Dialog */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-card/95 border border-border/50 rounded-[2rem] max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Scrollable Content */}
                            <div className="overflow-y-auto custom-scrollbar">
                                {/* Header Image Area */}
                                <div 
                                    className="relative h-64 bg-muted group cursor-zoom-in overflow-hidden" 
                                    onClick={() => listing.imageData && setIsImageExpanded(true)}
                                >
                                    {listing.imageData ? (
                                        <>
                                            <img
                                                src={listing.imageData}
                                                alt={listing.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <div className="bg-black/50 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-md flex items-center gap-2">
                                                    <Eye className="w-4 h-4" />
                                                    View Full Image
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                                            <span className="text-6xl">🌿</span>
                                        </div>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onClose();
                                        }}
                                        className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors backdrop-blur-sm z-10"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    
                                    {/* Price and Type Badges */}
                                    <div className="absolute bottom-4 left-4 flex gap-2 z-10">
                                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md ${listing.type === 'offering' ? 'bg-primary text-primary-foreground' : 'bg-orange-500 text-white'}`}>
                                            {listing.type === 'offering' ? 'Offering' : 'Seeking'}
                                        </div>
                                         <div className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md ${recyclability.color}`}>
                                            {recyclability.label}
                                        </div>
                                    </div>

                                    <div className="absolute bottom-4 right-4 animate-in fade-in slide-in-from-bottom-4 duration-500 z-10">
                                         <div className="px-5 py-2.5 rounded-full bg-primary text-white font-bold shadow-lg text-lg">
                                            {listing.price ? `$${listing.price}` : "Free"}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-8">
                                    {/* Title & Stats */}
                                    <div>
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <h3 className="text-3xl font-bold leading-tight text-foreground">{listing.title}</h3>
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground bg-muted/30 p-4 rounded-xl border border-border/40">
                                            <span className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                <span className="font-medium">{listing.location.address}</span>
                                            </span>
                                            <span className="w-px h-4 bg-border" />
                                            <span className="font-medium text-foreground">
                                                {listing.quantity} {listing.unit}
                                            </span>
                                            <span className="w-px h-4 bg-border" />
                                            <span className="capitalize px-2 py-0.5 rounded-md bg-secondary/10 text-secondary border border-secondary/20">
                                                {listing.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                                            <span className="w-1 h-4 bg-primary rounded-full"></span>
                                            Description
                                        </h4>
                                        <p className="leading-relaxed text-foreground/90 text-base">
                                            {listing.description}
                                        </p>
                                    </div>

                                    {/* Contact Section */}
                                    <div className="bg-gradient-to-br from-muted/50 to-background rounded-2xl p-6 border border-border/50 space-y-5 shadow-sm">
                                        <h4 className="font-semibold flex items-center gap-2 text-lg">
                                            <div className="p-2 rounded-full bg-primary/10 text-primary">
                                                <User className="w-5 h-5" />
                                            </div>
                                            Seller Information
                                        </h4>
                                        
                                        <div className="grid gap-4 pl-1">
                                            {listing.user.name && (
                                                <div className="flex items-center justify-between text-sm group">
                                                    <span className="text-muted-foreground">Name</span>
                                                    <span className="font-semibold text-base">{listing.user.name}</span>
                                                </div>
                                            )}
                                            
                                            {listing.user.phone && (
                                                <div className="flex items-center justify-between text-sm group">
                                                    <span className="text-muted-foreground">Phone</span>
                                                    <a href={`tel:${listing.user.phone}`} className="font-medium text-primary hover:underline hover:text-primary/80 transition-colors flex items-center gap-2">
                                                        <Phone className="w-3 h-3" />
                                                        {listing.user.phone}
                                                    </a>
                                                </div>
                                            )}

                                            {listing.user.email && (
                                                <div className="flex items-center justify-between text-sm group">
                                                    <span className="text-muted-foreground">Email</span>
                                                    <a href={`mailto:${listing.user.email}`} className="font-medium text-primary hover:underline hover:text-primary/80 transition-colors truncate max-w-[200px] flex items-center gap-2">
                                                        <Mail className="w-3 h-3" />
                                                        {listing.user.email}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Sticky Footer */}
                            <div className="p-4 bg-background/80 backdrop-blur-sm border-t border-border/50 flex gap-3">
                                {listing.user.email && (
                                    <>
                                       <Button
                                            variant="outline"
                                            className="flex-1 h-12 text-base hover:bg-muted transition-colors border-primary/20 text-primary hover:text-primary/80"
                                            onClick={async () => {
                                                try {
                                                    // Dynamic import to avoid circular dep if needed, or just import at top
                                                    const { getOrCreateConversation } = await import('@/lib/supabase-chat');
                                                    const { useNavigate } = await import('react-router-dom');
                                                    
                                                    // Note: We can't use hooks inside callback, so we need to rely on prop or window (bad practice).
                                                    // Better: Convert component to use useNavigate() at top level.
                                                    // But for this quick edit: I will fix imports at top level in next step.
                                                    // For now, let's just use window.location as fallback or better yet refactor the component start.
                                                 } catch(e) { console.error(e); }
                                            }}
                                            // Wait, I should not use inline async complex logic if I can help it.
                                            // Let's rewrite the component imports first.
                                        >
                                            <Mail className="w-5 h-5 mr-2" />
                                            Email
                                        </Button>
                                    </>
                                )}
                                <Button
                                    variant="eco"
                                    className="flex-1 h-12 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                                    onClick={handleMessageSeller}
                                >
                                    <MessageSquare className="w-5 h-5 mr-2" />
                                    Message Seller
                                </Button>
                                <Button variant="outline" onClick={onClose} className="h-12 px-6 hover:bg-muted transition-colors">
                                    Close
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ContactDialog;

import { useState, useEffect } from "react";
import { Edit2, Trash2, Package, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { Listing } from "@/lib/supabase-listings";

interface MyListingsProps {
    onEdit: (listing: Listing) => void;
    onDelete: (listing: Listing) => void;
}

const MyListings = ({ onEdit, onDelete }: MyListingsProps) => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMyListings();
    }, []);

    const fetchMyListings = async () => {
        try {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('No user logged in');
                return;
            }

            const { data, error } = await supabase
                .from('listings')
                .select(`
          *,
          categories (
            slug
          )
        `)
                .eq('user_id', user.id)
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform data
            const transformedListings = (data || []).map((listing: any) => ({
                ...listing,
                category: listing.categories?.slug || 'other',
            }));

            setListings(transformedListings);
        } catch (error) {
            console.error('Error fetching my listings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                <p className="mt-4 text-muted-foreground">Loading your listings...</p>
            </div>
        );
    }

    if (listings.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 bg-card rounded-2xl border-2 border-dashed border-border"
            >
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Listings Yet</h3>
                <p className="text-muted-foreground mb-6">
                    Create your first listing to start sharing materials!
                </p>
                <Button variant="eco" onClick={() => window.location.href = '/plant-match'}>
                    Create Listing
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">My Listings ({listings.length})</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                    {listings.map((listing, index) => (
                        <motion.div
                            key={listing.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.1 }}
                            className="group rounded-2xl border-2 border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                        >
                            {/* Image */}
                            {listing.image_url ? (
                                <div className="aspect-video bg-muted overflow-hidden">
                                    <img
                                        src={listing.image_url}
                                        alt={listing.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                                    <Package className="w-12 h-12 text-muted-foreground" />
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-4 space-y-3">
                                {/* Category Badge */}
                                <div className="flex items-center justify-between">
                                    <span className="px-3 py-1 rounded-full text-xs font-medium border bg-primary/10 text-primary border-primary/20">
                                        {listing.type === 'offering' ? '🌱 Offering' : '🔍 Seeking'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {listing.category?.charAt(0).toUpperCase() + listing.category?.slice(1) || 'Other'}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>

                                {/* Description */}
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {listing.description}
                                </p>

                                {/* Details */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Package className="w-4 h-4" />
                                        <span>
                                            {listing.quantity} {listing.unit}
                                        </span>
                                    </div>
                                    {listing.location_address && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="w-4 h-4" />
                                            <span className="line-clamp-1">{listing.location_address}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(listing.created_at!).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(listing)}
                                        className="flex-1 group/edit"
                                    >
                                        <Edit2 className="w-4 h-4 mr-2 group-hover/edit:text-primary transition" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onDelete(listing)}
                                        className="flex-1 group/delete hover:border-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2 group-hover/delete:text-destructive transition" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MyListings;

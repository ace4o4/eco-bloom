import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Package, Mail, Phone, User, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Listing {
    id: string;
    type: 'offering' | 'seeking';
    title: string;
    description: string;
    category: string;
    quantity: string;
    unit: string;
    price?: number | null;
    imageData?: string;
    location: {
        address: string;
        distance?: number;
    };
    user_id?: string; // Add user_id for chat
    user: {
        name?: string;
        email?: string;
        phone?: string;
    };
    createdAt: string;
}

interface ListingsBrowseProps {
    listings: Listing[];
    onContact: (listing: Listing) => void;
    isLoading?: boolean;
}

const categoryColors: Record<string, string> = {
    plastic: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    paper: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    metal: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    glass: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    electronics: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    textiles: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    organic: "bg-green-500/10 text-green-500 border-green-500/20",
    other: "bg-primary/10 text-primary border-primary/20",
};

const ListingsBrowse = ({ listings, onContact, isLoading }: ListingsBrowseProps) => {
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                    <p className="mt-4 text-muted-foreground">Searching for materials...</p>
                </div>
            </div>
        );
    }

    if (listings.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
            >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Materials Found</h3>
                <p className="text-muted-foreground mb-6">
                    Try adjusting your search filters or check back later.
                </p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                    {listings.length} {listings.length === 1 ? "Listing" : "Listings"} Found
                </h2>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing, index) => (
                    <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative flex flex-col rounded-3xl border border-border/50 bg-gradient-to-b from-card to-card/50 overflow-hidden hover:border-primary/50 hover:shadow-neon transition-all duration-300 transform hover:-translate-y-1"
                    >
                        {/* Image Container */}
                        <div className="relative aspect-[4/3] overflow-hidden">
                            {listing.imageData ? (
                                <img
                                    src={listing.imageData}
                                    alt={listing.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    <Package className="w-16 h-16 text-primary/20" />
                                </div>
                            )}

                            {/* Price Badge */}
                            <div className="absolute top-4 right-4">
                                <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-lg text-white font-semibold text-sm">
                                    {listing.price ? `$${listing.price}` : "Free"}
                                </div>
                            </div>

                            {/* Category Overlay */}
                            <div className="absolute top-4 left-4">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md ${categoryColors[listing.category]?.replace("text-", "text-black bg-white/80 border-transparent ") || "bg-white/80 text-black"}`}>
                                    {listing.category || 'Other'}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col flex-1 p-5 space-y-4">
                            <div>
                                <h3 className="font-bold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                    {listing.title}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                    <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                                        <Package className="w-3.5 h-3.5" />
                                        {listing.quantity} {listing.unit}
                                    </span>
                                    {listing.location.distance && (
                                        <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {listing.location.distance}km
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {listing.description}
                            </p>

                            <div className="mt-auto pt-4 border-t border-border/50">
                                <Button
                                    variant="eco"
                                    className="w-full shadow-md group-hover:shadow-lg transition-all"
                                    onClick={() => onContact(listing)}
                                >
                                    View Details
                                    <Eye className="w-4 h-4 ml-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ListingsBrowse;

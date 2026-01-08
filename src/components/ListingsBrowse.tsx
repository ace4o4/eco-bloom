import { motion } from "framer-motion";
import { MapPin, Package, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Listing {
    id: string;
    title: string;
    description: string;
    category: string;
    quantity: string;
    unit: string;
    imageData?: string;
    location: {
        address: string;
        distance?: number;
    };
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map((listing, index) => (
                    <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group rounded-2xl border-2 border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                    >
                        {/* Image */}
                        {listing.imageData ? (
                            <div className="aspect-video bg-muted overflow-hidden">
                                <img
                                    src={listing.imageData}
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
                            <div className="flex items-center gap-2">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${categoryColors[listing.category] || categoryColors.other
                                        }`}
                                >
                                    {listing.category ?
                                        listing.category.charAt(0).toUpperCase() + listing.category.slice(1)
                                        : 'Other'}
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
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                    <span className="line-clamp-1">
                                        {listing.location.address}
                                        {listing.location.distance && ` (${listing.location.distance}km away)`}
                                    </span>
                                </div>
                            </div>

                            {/* Contact Button */}
                            <Button
                                variant="eco"
                                onClick={() => onContact(listing)}
                                className="w-full group/btn"
                            >
                                <Mail className="w-4 h-4 mr-2 group-hover/btn:rotate-12 transition-transform" />
                                Contact Seller
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ListingsBrowse;

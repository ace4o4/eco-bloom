import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, Package, User, Mail, Phone, Share2, Heart, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { Listing } from "@/lib/supabase-listings";

const ListingDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [listing, setListing] = useState<Listing | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchListing = async () => {
            if (!id) return;
            try {
                setIsLoading(true);
                const { data, error } = await supabase
                    .from('listings')
                    .select(`
                        *,
                        categories (
                            slug
                        )
                    `)
                    .eq('id', id)
                    .single();

                if (error) throw error;

                // Transform data
                const transformedListing = {
                    ...data,
                    category: (data.categories as { slug?: string })?.slug || 'other',
                } as Listing;

                setListing(transformedListing);
            } catch (err) {
                console.error("Error fetching listing:", err);
                setError("Failed to load listing details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchListing();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background bg-vibrant-pattern flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                    <p className="mt-4 text-muted-foreground">Loading listing details...</p>
                </div>
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="min-h-screen bg-background bg-vibrant-pattern">
                <Navbar />
                <main className="pt-28 pb-16 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-2xl font-bold mb-4">Listing Not Found</h2>
                        <p className="text-muted-foreground mb-6">{error || "The listing you're looking for doesn't exist or has been removed."}</p>
                        <Button onClick={() => navigate(-1)} variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Button>
                    </div>
                </main>
            </div>
        );
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

    return (
        <div className="min-h-screen bg-background bg-vibrant-pattern">
            <Navbar />
            <main className="pt-28 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="mb-6 hover:bg-background/80"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left Column: Image */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <div className="aspect-square md:aspect-4/3 rounded-2xl overflow-hidden border-2 border-border bg-card shadow-lg relative group">
                                {listing.image_url ? (
                                    <img
                                        src={listing.image_url}
                                        alt={listing.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted/30">
                                        <Package className="w-20 h-20 text-muted-foreground/50" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border backdrop-blur-md shadow-sm ${categoryColors[listing.category] || categoryColors.other}`}>
                                        {listing.category.charAt(0).toUpperCase() + listing.category.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column: Details */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="glass-card p-6 md:p-8">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                        listing.type === 'offering' 
                                        ? 'bg-primary/10 text-primary border border-primary/20' 
                                        : 'bg-info/10 text-info border border-info/20'
                                    }`}>
                                        {listing.type === 'offering' ? 'Offering' : 'Seeking'}
                                    </span>
                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(listing.created_at || "").toLocaleDateString()}
                                    </span>
                                </div>

                                <h1 className="text-3xl font-bold mb-4 text-gradient-eco leading-tight">
                                    {listing.title}
                                </h1>

                                <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                                    {listing.description}
                                </p>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                        <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                                            <Package className="w-4 h-4" /> Quantity
                                        </div>
                                        <div className="font-semibold text-lg">
                                            {listing.quantity} {listing.unit}
                                        </div>
                                    </div>
                                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                        <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                                            <MapPin className="w-4 h-4" /> Location
                                        </div>
                                        <div className="font-semibold text-lg truncate" title={listing.location_address}>
                                            {listing.location_address || "Not specified"}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-border/50 pt-6 mb-6">
                                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5 text-primary" />
                                        Seller Information
                                    </h3>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-md">
                                            {listing.contact_name ? listing.contact_name.charAt(0).toUpperCase() : "U"}
                                        </div>
                                        <div>
                                            <div className="font-medium">{listing.contact_name || "Eco Warrior"}</div>
                                            <div className="text-sm text-muted-foreground">Level 5 Contributor</div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid gap-3">
                                        {listing.contact_email && (
                                            <a href={`mailto:${listing.contact_email}`} className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/10 group">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-primary group-hover:scale-110 transition-transform">
                                                    <Mail className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium text-foreground">{listing.contact_email}</span>
                                            </a>
                                        )}
                                        {listing.contact_phone && (
                                            <a href={`tel:${listing.contact_phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/10 group">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-primary group-hover:scale-110 transition-transform">
                                                    <Phone className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium text-foreground">{listing.contact_phone}</span>
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button className="flex-1" size="lg" variant="eco">
                                        Contact Seller
                                    </Button>
                                    <Button size="lg" variant="outline" className="px-3">
                                        <Share2 className="w-5 h-5" />
                                    </Button>
                                    <Button size="lg" variant="outline" className="px-3">
                                        <Flag className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ListingDetails;

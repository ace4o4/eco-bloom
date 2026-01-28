import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, Package, User, Mail, Phone, Share2, Heart, Flag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { Listing } from "@/lib/supabase-listings";
import { useAuth } from "@/contexts/AuthContext";

const ListingDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [listing, setListing] = useState<Listing | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Bidding State
    const [bids, setBids] = useState<{ amount: number; created_at: string; bidder_id: string; status?: string; bidder: { full_name: string } }[]>([]);
    const [bidAmount, setBidAmount] = useState("");
    const [isPlacingBid, setIsPlacingBid] = useState(false);
    const [isLoadingBids, setIsLoadingBids] = useState(false);

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
                
                // Load Bids
                loadBids(transformedListing.id);
            } catch (err) {
                console.error("Error fetching listing:", err);
                setError("Failed to load listing details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchListing();
    }, [id]);

    const loadBids = async (listingId: string) => {
        setIsLoadingBids(true);
        try {
             // Dynamic import to avoid circular dependencies if any, or just cleaner modularity
             const { getBidsForListing } = await import('@/lib/supabase-bids');
             const data = await getBidsForListing(listingId);
             setBids(data);
        } catch (error) {
            console.error("Failed to load bids", error);
        } finally {
            setIsLoadingBids(false);
        }
    };

    const handlePlaceBid = async () => {
        if (!listing?.id || !bidAmount) return;
        
        const amount = parseFloat(bidAmount);
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        const highestBid = bids.length > 0 ? Math.max(...bids.map(b => b.amount)) : 0;
        if (amount <= highestBid) {
            alert(`Bid must be higher than the current highest bid (₹${highestBid})`);
            return;
        }

        setIsPlacingBid(true);
        try {
            const { placeBid } = await import('@/lib/supabase-bids');
            await placeBid(listing.id, amount);
            setBidAmount("");
            await loadBids(listing.id); 
        } catch (error) {
            console.error("Failed to place bid", error);
            alert("Failed to place bid. Please try again.");
        } finally {
            setIsPlacingBid(false);
        }
    };

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

    const isOwner = user?.id === listing.user_id;
    const highestBid = bids.length > 0 ? Math.max(...bids.map(b => b.amount)) : 0;
    const startPrice = listing.price || 0;
    const minBid = Math.max(startPrice, highestBid + 1); 
    const userHasBid = user && bids.some(b => b.bidder_id === user.id);

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

                                {/* Bidding Section */}
                                <div className="bg-card border-2 border-primary/20 rounded-2xl p-5 shadow-sm mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-semibold text-lg flex items-center gap-2">
                                            <span className="text-xl">🔨</span>
                                            Bidding
                                        </h4>
                                        {highestBid > 0 && (
                                            <div className="py-1 px-3 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                                                Highest: ₹{highestBid}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {/* Logic: If ANY bid is accepted, bidding is CLOSED */}
                                        {bids.some(b => b.status === 'accepted') ? (
                                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center space-y-2">
                                                <h5 className="text-lg font-bold text-green-700 flex items-center justify-center gap-2">
                                                    <span className="text-xl">✅</span> Bid Accepted
                                                </h5>
                                                <p className="text-sm text-green-800/80">
                                                    The seller has accepted a bid of <strong>₹{bids.find(b => b.status === 'accepted')?.amount}</strong> from <strong>{bids.find(b => b.status === 'accepted')?.bidder.full_name}</strong>.
                                                    <br/>Bidding is now closed.
                                                </p>
                                            </div>
                                        ) : (
                                            /* Buyer Place/Update Bid Section (Only if NOT closed) */
                                            !isOwner && (
                                                <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                                                    {user ? (
                                                        <div className="flex gap-2">
                                                            <div className="relative flex-1">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                                                <input
                                                                    type="number"
                                                                    value={bidAmount}
                                                                    onChange={(e) => setBidAmount(e.target.value)}
                                                                    placeholder={`Min ₹${minBid}`}
                                                                    min={minBid}
                                                                    step="0.01"
                                                                    className="w-full pl-7 pr-4 py-2.5 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                                                />
                                                            </div>
                                                            <Button
                                                                variant="eco"
                                                                onClick={handlePlaceBid}
                                                                disabled={isPlacingBid || !bidAmount}
                                                            >
                                                                {isPlacingBid ? <Loader2 className="w-4 h-4 animate-spin" /> : (userHasBid ? "Update" : "Bid")}
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button 
                                                            variant="outline" 
                                                            className="w-full"
                                                            onClick={() => navigate('/login')}
                                                        >
                                                            Login to Place a Bid
                                                        </Button>
                                                    )}
                                                    {userHasBid && (
                                                        <p className="mt-2 text-xs text-primary font-medium text-center">
                                                            You have already placed a bid. You can update it above.
                                                        </p>
                                                    )}
                                                </div>
                                            )
                                        )}

                                        {/* Bids List - Visible to Everyone */}
                                        <div className="space-y-3">
                                            <h5 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                                Recent Bids
                                            </h5>
                                            {isLoadingBids ? (
                                                <div className="text-center py-4 text-muted-foreground">Loading bids...</div>
                                            ) : bids.length > 0 ? (
                                                <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                                    {bids.map((bid, i) => (
                                                        <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${bid.status === 'accepted' ? 'bg-green-500/10 border-green-500/30' : (bid.bidder_id === user?.id ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-border/50')}`}>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-bold text-secondary">
                                                                    {bid.bidder?.full_name?.charAt(0) || "U"}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-sm flex items-center gap-2">
                                                                        {bid.bidder?.full_name || "Anonymous"}
                                                                        {bid.bidder_id === user?.id && <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full">YOU</span>}
                                                                        {bid.status === 'accepted' && <span className="text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded-full">ACCEPTED</span>}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">{new Date(bid.created_at).toLocaleDateString()}</p>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-bold text-primary">₹{bid.amount}</span>
                                                                {/* Accept Button for Owner */}
                                                                {isOwner && bid.status === 'pending' && !bids.some(b => b.status === 'accepted') && (
                                                                        <Button 
                                                                        size="sm" 
                                                                        variant="outline" 
                                                                        className="h-7 text-xs border-green-600 text-green-700 hover:bg-green-50"
                                                                        onClick={async () => {
                                                                            if (confirm(`Are you sure you want to accept this bid of ₹${bid.amount}? This will close bidding.`)) {
                                                                                // Call accept API
                                                                                try {
                                                                                    const { acceptBid } = await import('@/lib/supabase-bids');
                                                                                    await acceptBid(bid.id, listing.id);
                                                                                    await loadBids(listing.id); // Refresh
                                                                                } catch (e) {
                                                                                    alert("Failed to accept bid. Make sure you have permission.");
                                                                                }
                                                                            }
                                                                        }}
                                                                        >
                                                                        Accept
                                                                        </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 bg-muted/20 rounded-xl border border-dashed border-muted-foreground/30">
                                                    <p className="text-muted-foreground text-sm">No bids yet 🦗</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

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

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
            const buyerName = user?.user_metadata?.full_name || user?.email || 'Eco User';
            const conversationId = await getOrCreateConversation(listing.id, listing.user_id, buyerName);
            onClose();
            navigate('/messages', { state: { activeId: conversationId } }); 
        } catch (error) {
            console.error("Failed to start chat", error);
        } finally {
            setIsCreatingChat(false);
        }
    };

    const [bids, setBids] = React.useState<{ amount: number; created_at: string; bidder_id: string; status?: string; bidder: { full_name: string } }[]>([]);
    const [bidAmount, setBidAmount] = React.useState("");
    const [isPlacingBid, setIsPlacingBid] = React.useState(false);
    const [isLoadingBids, setIsLoadingBids] = React.useState(false);
    
    // Import dynamically or at top (using dynamic here to avoid conflict with existing structure if needed, but best to move to top in real refactor)
    // For this edit, I will rely on the helper functions being available.
    // NOTE: I will add the imports at the top of the file in a separate edit if needed, but for now I'll assume I can add them.
    // Actually, let's just use the functions if I import them.
    
    React.useEffect(() => {
        if (isOpen && listing?.id) {
            loadBids();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, listing]);

    // Pre-fill bid amount if user has already bid
    React.useEffect(() => {
        if (user && bids.length > 0) {
            const myBid = bids.find(b => b.bidder_id === user.id);
            if (myBid) {
                setBidAmount(myBid.amount.toString());
            }
        }
    }, [bids, user]);

    const loadBids = async () => {
        if (!listing?.id) return;
        setIsLoadingBids(true);
        try {
             // We need to import this. Since I can't easily add global imports in this chunk without replacing the whole file,
             // I will assume the user (me) will add the import or I will do a multi-replace.
             // Wait, I am replacing the CONTACT DIALOG component body.
             // I will actually replace the whole component to be safe or use `multi_replace` to add imports.
             // For now, I'll put the logic here and standard imports.
             const { getBidsForListing } = await import('@/lib/supabase-bids');
             const data = await getBidsForListing(listing.id);
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
            alert(`Bid must be higher than the current highest bid ($${highestBid})`);
            return;
        }

        setIsPlacingBid(true);
        try {
            const { placeBid } = await import('@/lib/supabase-bids');
            await placeBid(listing.id, amount);
            setBidAmount("");
            await loadBids(); 
        } catch (error) {
            console.error("Failed to place bid", error);
            alert("Failed to place bid. Please try again.");
        } finally {
            setIsPlacingBid(false);
        }
    };

    if (!listing) return null;

    const recyclability = getRecyclabilityStatus(listing.category);
    const isOwner = user?.id === listing.user_id;
    const highestBid = bids.length > 0 ? Math.max(...bids.map(b => b.amount)) : 0;
    
    // Calculate minimum bid (start at price if no bids, else highest + 1)
    // If no price set (free), start at 1? Or 0? Let's assume 0 is allowed if free, but usually bids imply value.
    const startPrice = listing.price || 0;
    const minBid = Math.max(startPrice, highestBid + 1); 

    const userHasBid = user && bids.some(b => b.bidder_id === user.id);

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
                                            {listing.price ? `₹${listing.price}` : "Free"}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-8">
                                    {/* Title & Stats */}
                                    <div>
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <h3 className="text-3xl font-bold leading-tight text-foreground">{listing.title} ✅</h3>
                                        </div>

                                        {/* Bidding Section - Moved UP for visibility */}
                                        <div className="bg-card border-2 border-primary/20 rounded-2xl p-5 shadow-sm mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
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
                                                                                            await loadBids(); // Refresh
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
                            {!isOwner && (
                                <div className="p-4 bg-background/80 backdrop-blur-sm border-t border-border/50 flex gap-3">
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
                            )}
                            {isOwner && (
                                 <div className="p-4 bg-background/80 backdrop-blur-sm border-t border-border/50 flex gap-3">
                                    <Button variant="outline" onClick={onClose} className="w-full h-12 px-6 hover:bg-muted transition-colors">
                                        Close
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ContactDialog;

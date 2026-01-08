import { Mail, Phone, User, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import type { Listing } from "./ListingsBrowse";

interface ContactDialogProps {
    listing: Listing | null;
    isOpen: boolean;
    onClose: () => void;
}

const ContactDialog = ({ listing, isOpen, onClose }: ContactDialogProps) => {
    if (!listing) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Dialog */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-card border-2 border-border rounded-3xl p-6 max-w-md w-full shadow-2xl"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">Contact Seller</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Reach out about: {listing.title}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-xl hover:bg-muted transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Listing Info */}
                            <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                                <h4 className="font-semibold mb-2">{listing.title}</h4>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        <span>{listing.location.address}</span>
                                    </div>
                                    <p className="text-xs mt-2">Quantity: {listing.quantity} {listing.unit}</p>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                    Contact Information
                                </h4>

                                {listing.user.name && (
                                    <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                            <User className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Name</p>
                                            <p className="font-medium">{listing.user.name}</p>
                                        </div>
                                    </div>
                                )}

                                {listing.user.email && (
                                    <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted-foreground">Email</p>
                                            <a
                                                href={`mailto:${listing.user.email}`}
                                                className="font-medium text-primary hover:underline truncate block"
                                            >
                                                {listing.user.email}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {listing.user.phone && (
                                    <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                            <Phone className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Phone</p>
                                            <a
                                                href={`tel:${listing.user.phone}`}
                                                className="font-medium text-primary hover:underline"
                                            >
                                                {listing.user.phone}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {!listing.user.email && !listing.user.phone && (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No contact information available
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex gap-3">
                                {listing.user.email && (
                                    <Button
                                        variant="eco"
                                        className="flex-1"
                                        onClick={() => window.location.href = `mailto:${listing.user.email}`}
                                    >
                                        <Mail className="w-4 h-4 mr-2" />
                                        Send Email
                                    </Button>
                                )}
                                <Button variant="outline" onClick={onClose} className="flex-1">
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

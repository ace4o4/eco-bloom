import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { Listing } from "@/lib/supabase-listings";
import { supabase } from "@/lib/supabase";

interface EditListingModalProps {
    isOpen: boolean;
    onClose: () => void;
    listing: Listing | null;
    onSuccess: () => void;
}

const EditListingModal = ({
    isOpen,
    onClose,
    listing,
    onSuccess,
}: EditListingModalProps) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        quantity: "",
        unit: "units",
        frequency: "one-time",
        location: "",
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (listing) {
            setFormData({
                title: listing.title || "",
                description: listing.description || "",
                quantity: listing.quantity || "",
                unit: listing.unit || "units",
                frequency: listing.frequency || "one-time",
                location: listing.location_address || "",
            });
        }
    }, [listing]);

    const handleSave = async () => {
        if (!listing?.id) return;

        try {
            setIsSaving(true);
            setError("");

            const { error: updateError } = await supabase
                .from('listings')
                .update({
                    title: formData.title,
                    description: formData.description,
                    quantity: parseFloat(formData.quantity),
                    unit: formData.unit,
                    frequency: formData.frequency,
                    location_address: formData.location, // Map to DB column
                    updated_at: new Date().toISOString(),
                })
                .eq('id', listing.id);

            if (updateError) throw updateError;

            onSuccess();
            onClose();
        } catch (err) {
            const error = err as Error;
            console.error('Error updating listing:', error);
            setError(error.message || 'Failed to update listing');
        } finally {
            setIsSaving(false);
        }
    };

    if (!listing) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Edit Listing</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {error && (
                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Plastic bottles for recycling"
                            className="eco-input w-full"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the material condition, quantity details, etc."
                            rows={4}
                            className="eco-input w-full resize-none"
                        />
                    </div>

                    {/* Quantity & Unit */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Quantity</label>
                            <input
                                type="number"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                placeholder="e.g., 100"
                                className="eco-input w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Unit</label>
                            <select
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                className="eco-select w-full"
                            >
                                <option value="kg">Kilograms (kg)</option>
                                <option value="tons">Tons</option>
                                <option value="liters">Liters</option>
                                <option value="units">Units/Pieces</option>
                            </select>
                        </div>
                    </div>

                    {/* Frequency */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Frequency</label>
                        <select
                            value={formData.frequency}
                            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                            className="eco-select w-full"
                        >
                            <option value="one-time">One-time</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Location</label>
                         <div className="relative">
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Enter location..."
                                className="eco-input w-full pr-10"
                            />
                            <button
                                onClick={async () => {
                                    try {
                                        // Dynamic import to avoid circular dependencies if any
                                        const { getCurrentLocation } = await import('@/lib/geolocation');
                                        const location = await getCurrentLocation();
                                        if (location.address) {
                                            setFormData({ ...formData, location: location.address });
                                        }
                                    } catch (error) {
                                        console.error("Failed to get location", error);
                                        // silent fail or small toast
                                    }
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-muted text-primary transition-colors"
                                type="button"
                                title="Use my current location"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button variant="eco" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditListingModal;

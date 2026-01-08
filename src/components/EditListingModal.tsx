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
                            <option value="ongoing">Ongoing</option>
                        </select>
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

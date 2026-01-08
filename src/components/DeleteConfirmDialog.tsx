import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface DeleteConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    listingTitle: string;
    isDeleting?: boolean;
}

const DeleteConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    listingTitle,
    isDeleting = false,
}: DeleteConfirmDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="w-5 h-5" />
                        Delete Listing?
                    </DialogTitle>
                    <DialogDescription className="pt-4">
                        Are you sure you want to delete <strong>"{listingTitle}"</strong>?
                        <br /><br />
                        This action cannot be undone. The listing will be permanently removed from the database.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Deleting...
                            </>
                        ) : (
                            'Delete Listing'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteConfirmDialog;

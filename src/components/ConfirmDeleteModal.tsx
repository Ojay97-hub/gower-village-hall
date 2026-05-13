import { AlertTriangle, Loader2 } from "lucide-react";

type ConfirmDeleteModalProps = {
    isOpen: boolean;
    title: string;
    itemName: string;
    isDeleting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export function ConfirmDeleteModal({
    isOpen,
    title,
    itemName,
    isDeleting,
    onConfirm,
    onCancel,
}: ConfirmDeleteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div
                role="alertdialog"
                aria-modal="true"
                className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
            >
                <div className="flex items-start gap-4 px-6 py-5">
                    <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">
                            {title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Are you sure you want to delete <span className="font-semibold">"{itemName}"</span>? This cannot be undone.
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors disabled:opacity-70"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-70"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

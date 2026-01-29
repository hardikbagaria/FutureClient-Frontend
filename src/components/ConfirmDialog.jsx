import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col items-center gap-4 p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle size={24} className="text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-main">{title}</h3>
                    <p className="text-muted text-sm">{message}</p>
                    <div className="flex gap-3 w-full mt-2">
                        <button className="btn btn-secondary flex-1" onClick={onClose}>
                            Cancel
                        </button>
                        <button className="btn btn-danger flex-1" onClick={onConfirm}>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

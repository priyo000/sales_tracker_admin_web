import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
    noPadding?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', noPadding = false }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-4xl',
        full: 'max-w-full m-4',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity" 
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className={`relative w-full ${sizeClasses[size]} transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col`}>
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button 
                        onClick={onClose} 
                        className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all active:scale-90"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className={cn("flex-1 min-h-0 flex flex-col", !noPadding ? "p-6 overflow-y-auto" : "overflow-hidden")}>
                    {children}
                </div>
            </div>
        </div>
    );
};

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
    isOpen, onClose, onConfirm, title, message, 
    confirmText = 'Konfirmasi', cancelText = 'Batal', type = 'warning'
}) => {
    if (!isOpen) return null;

    const confirmColor = type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700';
    const iconColor = type === 'danger' ? 'text-red-500 bg-red-50' : 'text-amber-500 bg-amber-50';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity" 
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-sm transform overflow-hidden rounded-xl bg-white p-6 shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4 ${iconColor}`}>
                    <AlertTriangle className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold leading-6 text-gray-900 text-center mb-2">{title}</h3>
                <p className="text-sm text-center text-gray-500 mb-6 px-2">{message}</p>
                <div className="flex justify-center space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white focus:outline-none transition-all active:scale-95 ${confirmColor}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

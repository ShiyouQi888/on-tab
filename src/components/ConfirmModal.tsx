import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onClose,
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const colors = {
    danger: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700 shadow-red-100',
      border: 'border-red-100'
    },
    warning: {
      bg: 'bg-amber-50',
      icon: 'text-amber-600',
      button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-100',
      border: 'border-amber-100'
    },
    info: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100',
      border: 'border-blue-100'
    }
  };

  const currentColors = colors[type];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white/80 backdrop-blur-2xl rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white/40">
        <div className={`p-6 bg-white/20 flex flex-col items-center text-center`}>
          <div className={`w-14 h-14 bg-white/40 rounded-full flex items-center justify-center mb-4 border-2 border-white/60 shadow-sm`}>
            <AlertTriangle className={currentColors.icon} size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed font-medium">
            {message}
          </p>
        </div>

        <div className="p-4 bg-white/10 flex gap-3 border-t border-white/20">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-700 hover:bg-black/5 transition-all border border-white/40"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-3 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 ${currentColors.button}`}
          >
            {confirmText}
          </button>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-gray-700 hover:bg-black/5 rounded-full transition-all"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit animation after 2.7s (300ms before onClose)
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2700);

    const closeTimer = setTimeout(onClose, 3000);
    
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <XCircle className="text-red-500" size={20} />,
    warning: <AlertCircle className="text-yellow-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-100',
    error: 'bg-red-50 border-red-100',
    warning: 'bg-yellow-50 border-yellow-100',
    info: 'bg-blue-50 border-blue-100',
  };

  return (
    <div className={`fixed bottom-4 right-4 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg z-[100] transition-all duration-300 ${
      isExiting ? 'opacity-0 translate-y-2 pointer-events-none' : 'animate-in fade-in slide-in-from-bottom-4'
    } ${bgColors[type]}`}>
      {icons[type]}
      <span className="text-sm font-medium text-gray-800">{message}</span>
      <button onClick={() => {
        setIsExiting(true);
        setTimeout(onClose, 300);
      }} className="ml-2 text-gray-400 hover:text-gray-600 transition-colors">
        <X size={16} />
      </button>
    </div>
  );
};

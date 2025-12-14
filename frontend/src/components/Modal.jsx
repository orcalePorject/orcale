import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'max-w-2xl',
  showCloseButton = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-lg ${maxWidth} w-full max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between mb-6">
              {title && <h2 className="text-xl font-bold text-gray-800">{title}</h2>}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} />
                </button>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
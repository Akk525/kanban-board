import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertCircle className="text-red-600" size={48} />;
      case 'warning':
        return <AlertCircle className="text-orange-600" size={48} />;
      case 'success':
        return <CheckCircle className="text-green-600" size={48} />;
      default:
        return <Info className="text-blue-600" size={48} />;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'btn-danger';
      case 'warning':
        return 'bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-all hover:shadow-md';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all hover:shadow-md';
      default:
        return 'btn-primary';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center modal-backdrop">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">{getIcon()}</div>
            <div className="flex-1">
              <p className="text-gray-700 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-secondary px-4 py-2">
            {cancelText}
          </button>
          <button onClick={onConfirm} className={`${getButtonClass()} px-4 py-2`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

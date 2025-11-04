import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
}

export const InputModal: React.FC<InputModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  label,
  placeholder = '',
  defaultValue = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center modal-backdrop">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform animate-scaleIn">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              autoFocus
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-4 py-2"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

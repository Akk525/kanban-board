import React, { useState } from 'react';
import { X, RotateCcw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Card as CardType, Category } from '../types';

interface ArchiveProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardType[];
  categories?: Category[];
  onRestore: (cardId: string) => void;
  onDelete: (cardId: string) => void;
}

export const Archive: React.FC<ArchiveProps> = ({
  isOpen,
  onClose,
  cards,
  categories = [],
  onRestore,
  onDelete,
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Sort by archived date (most recent first)
  const sortedCards = [...cards].sort((a, b) => {
    const dateA = a.archivedAt ? new Date(a.archivedAt).getTime() : 0;
    const dateB = b.archivedAt ? new Date(b.archivedAt).getTime() : 0;
    return dateB - dateA;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryColor = (categoryId?: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6b7280';
  };

  const handleDelete = (cardId: string) => {
    if (deleteConfirmId === cardId) {
      onDelete(cardId);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(cardId);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center modal-backdrop">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Archive</h2>
            <p className="text-sm text-gray-500 mt-1">
              {sortedCards.length} completed {sortedCards.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {sortedCards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No archived tasks</p>
              <p className="text-gray-400 text-sm mt-2">
                Completed tasks will appear here after 3 seconds
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedCards.map(card => (
                <div
                  key={card.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: card.categoryId ? getCategoryColor(card.categoryId) : '#6b7280',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Title and Priority */}
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {card.title}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(card.priority)}`}>
                          {card.priority}
                        </span>
                      </div>

                      {/* Description */}
                      {card.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {card.description}
                        </p>
                      )}

                      {/* Labels */}
                      {card.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {card.labels.slice(0, 3).map((label, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200"
                            >
                              {label}
                            </span>
                          ))}
                          {card.labels.length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-50 text-gray-600">
                              +{card.labels.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {card.completedAt && (
                          <span>
                            Completed: {format(new Date(card.completedAt), 'MMM d, yyyy')}
                          </span>
                        )}
                        {card.archivedAt && (
                          <span>
                            Archived: {format(new Date(card.archivedAt), 'MMM d, yyyy h:mm a')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onRestore(card.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Restore"
                      >
                        <RotateCcw size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(card.id)}
                        className={`p-2 rounded transition-colors ${
                          deleteConfirmId === card.id
                            ? 'bg-red-100 text-red-700 shake'
                            : 'text-gray-400 hover:bg-red-50 hover:text-red-600'
                        }`}
                        title={deleteConfirmId === card.id ? 'Click again to confirm' : 'Delete permanently'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <p>
              Tip: Restore tasks to bring them back to the board
            </p>
            <button
              onClick={onClose}
              className="btn-secondary text-xs px-4 py-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

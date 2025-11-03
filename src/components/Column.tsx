import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import { Card } from './Card';
import type { Column as ColumnType, Category } from '../types';

interface ColumnProps {
  column: ColumnType;
  categories?: Category[];
  onAddCard: (columnId: string) => void;
  onCardClick?: (card: import('../types').Card) => void;
  onDeleteColumn?: (columnId: string) => void;
  onRenameColumn?: (columnId: string, newTitle: string) => void;
}

export const Column: React.FC<ColumnProps> = ({ 
  column, 
  categories = [], 
  onAddCard, 
  onCardClick,
  onDeleteColumn,
  onRenameColumn 
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleRename = () => {
    if (editTitle.trim() && editTitle !== column.title && onRenameColumn) {
      onRenameColumn(column.id, editTitle.trim());
    }
    setIsEditing(false);
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (onDeleteColumn) {
      onDeleteColumn(column.id);
    }
    setShowDeleteConfirm(false);
    setShowMenu(false);
  };

  return (
    <div className="column relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleRename}
              onKeyPress={(e) => e.key === 'Enter' && handleRename()}
              className="flex-1 font-semibold text-gray-800 text-sm border-b-2 border-blue-500 focus:outline-none bg-transparent"
              autoFocus
            />
          ) : (
            <>
              <h2 className="font-semibold text-gray-800 text-sm">{column.title}</h2>
              <span className="bg-gray-200 text-gray-600 text-xs font-medium px-1.5 py-0.5 rounded-full">
                {column.cards.length}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 relative">
          <button
            onClick={() => onAddCard(column.id)}
            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
            title="Add card"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-all"
          >
            <MoreHorizontal size={14} />
          </button>
          
          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="dropdown">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left text-sm transition-colors"
                >
                  <Edit2 size={14} />
                  Rename Column
                </button>
                <button
                  onClick={() => {
                    if (column.cards.length > 0) {
                      setShowDeleteConfirm(true);
                    } else {
                      handleDelete();
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 w-full text-left text-sm transition-colors"
                >
                  <Trash2 size={14} />
                  Delete Column
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="absolute top-0 left-0 right-0 bg-red-50 border-2 border-red-500 rounded-lg p-3 z-20 delete-confirm">
          <p className="text-sm text-red-800 mb-2">
            Delete column with {column.cards.length} cards?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-600 text-white text-xs px-3 py-1.5 rounded hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 bg-gray-200 text-gray-800 text-xs px-3 py-1.5 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div
        ref={setNodeRef}
        className={`min-h-[400px] transition-all duration-200 rounded-lg ${isOver ? 'bg-blue-50 ring-2 ring-blue-300' : ''}`}
      >
        <SortableContext items={column.cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
          {column.cards.map((card, index) => (
            <div key={card.id} className="card-enter" style={{ animationDelay: `${index * 0.05}s` }}>
              <Card card={card} categories={categories} onCardClick={onCardClick} />
            </div>
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

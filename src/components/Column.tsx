import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal } from 'lucide-react';
import { Card } from './Card';
import type { Column as ColumnType, Category } from '../types';

interface ColumnProps {
  column: ColumnType;
  categories?: Category[];
  onAddCard: (columnId: string) => void;
  onCardClick?: (card: import('../types').Card) => void;
}

export const Column: React.FC<ColumnProps> = ({ column, categories = [], onAddCard, onCardClick }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div className="column">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-800 text-sm">{column.title}</h2>
          <span className="bg-gray-200 text-gray-600 text-xs font-medium px-1.5 py-0.5 rounded-full">
            {column.cards.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddCard(column.id)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Add card"
          >
            <Plus size={14} />
          </button>
          <button className="p-1 hover:bg-gray-200 rounded transition-colors">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-[400px] ${isOver ? 'bg-blue-50' : ''} transition-colors`}
      >
        <SortableContext items={column.cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
          {column.cards.map(card => (
            <Card key={card.id} card={card} categories={categories} onCardClick={onCardClick} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

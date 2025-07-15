import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MessageCircle, Tag } from 'lucide-react';
import { format } from 'date-fns';
import type { Card as CardType, Category } from '../types';

interface CardProps {
  card: CardType;
  categories?: Category[];
  onCardClick?: (card: CardType) => void;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export const Card: React.FC<CardProps> = ({ card, categories = [], onCardClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const category = categories.find(cat => cat.id === card.categoryId);
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();
  const isDueSoon = card.dueDate && 
    new Date(card.dueDate) > new Date() && 
    new Date(card.dueDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days

  const handleClick = () => {
    // Only open details if not dragging and click is on the card itself
    if (!isDragging && onCardClick) {
      onCardClick(card);
    }
  };

  // Create category border style
  const categoryBorderStyle = category 
    ? { borderLeftColor: category.color, borderLeftWidth: '4px' }
    : {};

  const dueDateBorderClass = isOverdue 
    ? 'border-l-4 border-l-red-500' 
    : isDueSoon 
    ? 'border-l-4 border-l-orange-500' 
    : category 
    ? 'border-l-4' 
    : '';

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...categoryBorderStyle }}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={`card mb-2 ${isDragging ? 'opacity-50' : ''} ${dueDateBorderClass}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 text-xs">{card.title}</h3>
        <span
          className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
            priorityColors[card.priority]
          }`}
        >
          {card.priority}
        </span>
      </div>

      {/* Category Badge */}
      {category && (
        <div className="mb-2">
          <span
            className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-full text-white"
            style={{ backgroundColor: category.color }}
          >
            {category.name}
          </span>
        </div>
      )}

      {card.description && (
        <p className="text-gray-600 text-xs mb-2 line-clamp-2">
          {card.description}
        </p>
      )}

      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.slice(0, 2).map((label, index) => (
            <div
              key={index}
              className="flex items-center gap-1 bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs"
            >
              <Tag size={8} />
              {label}
            </div>
          ))}
          {card.labels.length > 2 && (
            <span className="text-xs text-gray-400">+{card.labels.length - 2}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          {card.dueDate && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : ''}`}>
              <Calendar size={10} />
              <span>{format(new Date(card.dueDate), 'MMM dd')}</span>
              {isOverdue && <span className="text-xs">(overdue)</span>}
              {isDueSoon && <span className="text-xs">(due soon)</span>}
            </div>
          )}
        </div>

        {card.comments.length > 0 && (
          <div className="flex items-center gap-1">
            <MessageCircle size={10} />
            <span>{card.comments.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};

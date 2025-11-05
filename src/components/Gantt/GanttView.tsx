import React, { useState } from 'react';
import { 
  format, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek, 
  addWeeks, 
  addMonths, 
  startOfMonth, 
  endOfMonth,
  isSameDay,
  differenceInDays
} from 'date-fns';
import type { Card, User } from '../../types';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface GanttViewProps {
  cards: Card[];
  users: User[];
  onCardClick?: (card: Card) => void;
}

type ZoomLevel = 'week' | 'month';

export const GanttView: React.FC<GanttViewProps> = ({ cards, users, onCardClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('week');

  const getDateRange = () => {
    if (zoomLevel === 'week') {
      return {
        start: startOfWeek(currentDate, { weekStartsOn: 0 }),
        end: endOfWeek(addWeeks(currentDate, 3), { weekStartsOn: 0 })
      };
    } else {
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(addMonths(currentDate, 2))
      };
    }
  };

  const { start, end } = getDateRange();
  const days = eachDayOfInterval({ start, end });

  // Filter cards that have dates and are in view range
  const visibleCards = cards.filter(card => {
    const cardStart = card.startDate ? new Date(card.startDate) : null;
    const cardDue = card.dueDate ? new Date(card.dueDate) : null;
    
    if (!cardStart && !cardDue) return false;
    
    const effectiveStart = cardStart || cardDue!;
    const effectiveEnd = cardDue || cardStart!;
    
    // Check if card overlaps with view range
    return effectiveEnd >= start && effectiveStart <= end;
  });

  const navigate = (direction: 'prev' | 'next') => {
    if (zoomLevel === 'week') {
      setCurrentDate(direction === 'prev' ? addWeeks(currentDate, -1) : addWeeks(currentDate, 1));
    } else {
      setCurrentDate(direction === 'prev' ? addMonths(currentDate, -1) : addMonths(currentDate, 1));
    }
  };

  const getCardPosition = (card: Card) => {
    const cardStart = card.startDate ? new Date(card.startDate) : new Date(card.dueDate!);
    const cardDue = card.dueDate ? new Date(card.dueDate) : new Date(card.startDate!);
    
    const totalDays = days.length;
    const startDay = Math.max(0, differenceInDays(cardStart, start));
    const duration = Math.max(1, differenceInDays(cardDue, cardStart) + 1);
    
    const left = (startDay / totalDays) * 100;
    const width = (duration / totalDays) * 100;
    
    return { left: `${left}%`, width: `${Math.min(width, 100 - left)}%` };
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: '#ef4444',
      high: '#f59e0b',
      medium: '#3b82f6',
      low: '#10b981'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const today = new Date();
  const todayInRange = days.some(day => isSameDay(day, today));
  const todayPosition = todayInRange 
    ? ((differenceInDays(today, start)) / days.length) * 100 
    : -1;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Gantt Chart</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Previous period"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium px-4">
              {format(start, 'MMM d')} - {format(end, 'MMM d, yyyy')}
            </span>
            <button
              onClick={() => navigate('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Next period"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel('week')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1 ${
              zoomLevel === 'week' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
          >
            <ZoomIn className="w-4 h-4" />
            Week
          </button>
          <button
            onClick={() => setZoomLevel('month')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1 ${
              zoomLevel === 'month' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
          >
            <ZoomOut className="w-4 h-4" />
            Month
          </button>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="relative overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Date Headers */}
          <div className="flex border-b border-gray-200 mb-4 pb-2">
            {days.map((day, index) => {
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              const isToday = isSameDay(day, today);
              
              return (
                <div
                  key={index}
                  className={`flex-1 text-center text-sm ${
                    isWeekend ? 'bg-gray-50' : ''
                  } ${isToday ? 'bg-blue-50' : ''}`}
                  style={{ minWidth: '40px' }}
                >
                  <div className={`font-medium ${isToday ? 'text-blue-600' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="text-gray-500 text-xs">{format(day, 'EEE')}</div>
                </div>
              );
            })}
          </div>

          {/* Today Line */}
          {todayPosition >= 0 && (
            <div
              className="absolute top-16 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
              style={{ left: `${todayPosition}%` }}
            >
              <div className="absolute -top-12 -left-8 text-xs text-red-600 font-medium whitespace-nowrap">
                Today
              </div>
            </div>
          )}

          {/* Cards */}
          <div className="space-y-2">
            {visibleCards.map((card) => {
              const position = getCardPosition(card);
              const user = users.find(u => u.id === card.assigneeId);
              const hasDependencies = card.dependencies && card.dependencies.length > 0;
              
              return (
                <div key={card.id} className="relative h-12 flex items-center">
                  <div className="w-48 pr-4 flex-shrink-0">
                    <div className="text-sm font-medium truncate">{card.title}</div>
                    <div className="text-xs text-gray-500">
                      {user?.name || 'Unassigned'}
                    </div>
                  </div>
                  <div className="flex-1 relative">
                    <button
                      onClick={() => onCardClick?.(card)}
                      className="absolute h-8 rounded px-3 flex items-center gap-2 text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
                      style={{
                        left: position.left,
                        width: position.width,
                        backgroundColor: getPriorityColor(card.priority)
                      }}
                    >
                      <span className="truncate">{card.title}</span>
                      {hasDependencies && (
                        <span className="text-xs" title="Has dependencies">🔗</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {visibleCards.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No cards with dates in this time range. Add start or due dates to cards to see them here.
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
            <span>Urgent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
            <span>High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
            <span>Low</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🔗</span>
            <span>Has dependencies</span>
          </div>
        </div>
      </div>
    </div>
  );
};

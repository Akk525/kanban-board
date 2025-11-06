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
        end: endOfWeek(addWeeks(currentDate, 1), { weekStartsOn: 0 }) // 2 weeks for better spacing
      };
    } else {
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate) // Single month for better spacing
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

  // Calculate dynamic column width based on zoom level
  const dayColumnWidth = zoomLevel === 'week' ? 80 : 50; // Wider for week view
  const minTotalWidth = days.length * dayColumnWidth;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <h2 className="text-3xl font-bold text-gray-800">Gantt Chart</h2>
          <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2">
            <button
              onClick={() => navigate('prev')}
              className="p-2 hover:bg-white rounded-lg transition-all shadow-sm hover:shadow"
              aria-label="Previous period"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="font-semibold px-4 text-gray-700 min-w-[240px] text-center">
              {format(start, 'MMM d')} - {format(end, 'MMM d, yyyy')}
            </span>
            <button
              onClick={() => navigate('next')}
              className="p-2 hover:bg-white rounded-lg transition-all shadow-sm hover:shadow"
              aria-label="Next period"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
          <button
            onClick={() => setZoomLevel('week')}
            className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 font-medium ${
              zoomLevel === 'week' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'hover:bg-white text-gray-600'
            }`}
          >
            <ZoomIn className="w-4 h-4" />
            Week View
          </button>
          <button
            onClick={() => setZoomLevel('month')}
            className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 font-medium ${
              zoomLevel === 'month' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'hover:bg-white text-gray-600'
            }`}
          >
            <ZoomOut className="w-4 h-4" />
            Month View
          </button>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="relative overflow-x-auto border border-gray-200 rounded-lg">
        <div style={{ minWidth: `${minTotalWidth}px` }}>
          {/* Date Headers */}
          <div className="flex border-b-2 border-gray-300 bg-gradient-to-b from-gray-50 to-white sticky top-0 z-20">
            <div className="w-64 flex-shrink-0 border-r-2 border-gray-300 px-6 py-4">
              <div className="font-semibold text-gray-700">Task</div>
              <div className="text-xs text-gray-500 mt-1">Assignee</div>
            </div>
            {days.map((day, index) => {
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              const isToday = isSameDay(day, today);
              const isMonthStart = day.getDate() === 1;
              
              return (
                <div
                  key={index}
                  className={`text-center border-r border-gray-200 py-4 transition-colors ${
                    isWeekend ? 'bg-gray-50' : 'bg-white'
                  } ${isToday ? 'bg-blue-50 border-blue-300' : ''}`}
                  style={{ 
                    minWidth: `${dayColumnWidth}px`,
                    width: `${dayColumnWidth}px`
                  }}
                >
                  <div className={`font-bold text-base ${isToday ? 'text-blue-600' : 'text-gray-800'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className={`text-xs mt-1 ${isToday ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                    {format(day, 'EEE')}
                  </div>
                  {isMonthStart && (
                    <div className="text-xs font-semibold text-gray-600 mt-1">
                      {format(day, 'MMM')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Today Line */}
          {todayPosition >= 0 && (
            <div
              className="absolute bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none shadow-lg"
              style={{ 
                left: `calc(256px + ${todayPosition}%)`,
                top: '0'
              }}
            >
              <div className="absolute top-2 -left-10 text-xs text-red-600 font-semibold whitespace-nowrap bg-white px-2 py-1 rounded shadow-sm">
                Today
              </div>
            </div>
          )}

          {/* Cards */}
          <div className="divide-y divide-gray-100">
            {visibleCards.map((card, idx) => {
              const position = getCardPosition(card);
              const user = users.find(u => u.id === card.assigneeId);
              const hasDependencies = card.dependencies && card.dependencies.length > 0;
              
              return (
                <div 
                  key={card.id} 
                  className={`flex items-center hover:bg-gray-50 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                  }`}
                  style={{ minHeight: '72px' }}
                >
                  <div className="w-64 flex-shrink-0 border-r-2 border-gray-300 px-6 py-4">
                    <div className="text-sm font-semibold text-gray-800 truncate mb-1">
                      {card.title}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>{user?.name || 'Unassigned'}</span>
                      {card.estimateHours && (
                        <span className="text-gray-400">• {card.estimateHours}h</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 relative px-4 py-4">
                    {/* Background grid for each day */}
                    <div className="absolute inset-0 flex">
                      {days.map((day, dayIdx) => {
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                        return (
                          <div
                            key={dayIdx}
                            className={`border-r border-gray-100 ${isWeekend ? 'bg-gray-50' : ''}`}
                            style={{ 
                              minWidth: `${dayColumnWidth}px`,
                              width: `${dayColumnWidth}px`
                            }}
                          />
                        );
                      })}
                    </div>
                    
                    {/* Card bar */}
                    <button
                      onClick={() => onCardClick?.(card)}
                      className="absolute h-10 rounded-lg px-4 flex items-center gap-2 text-white font-medium hover:shadow-lg transition-all transform hover:scale-105 z-10"
                      style={{
                        left: position.left,
                        width: position.width,
                        backgroundColor: getPriorityColor(card.priority),
                        top: '50%',
                        transform: 'translateY(-50%)'
                      }}
                    >
                      <span className="truncate text-sm">{card.title}</span>
                      {hasDependencies && (
                        <span className="text-xs flex-shrink-0" title="Has dependencies">🔗</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {visibleCards.length === 0 && (
            <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-lg">
              <p className="text-lg font-medium mb-2">No tasks in this time range</p>
              <p className="text-sm">Add start or due dates to cards to see them on the timeline.</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats and Legend */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-semibold">{visibleCards.length}</span>
          <span>task{visibleCards.length !== 1 ? 's' : ''} in view</span>
          <span className="mx-2">•</span>
          <span>{zoomLevel === 'week' ? '2 weeks' : '1 month'} timeline</span>
        </div>
        
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded shadow-sm" style={{ backgroundColor: '#ef4444' }}></div>
            <span className="font-medium">Urgent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded shadow-sm" style={{ backgroundColor: '#f59e0b' }}></div>
            <span className="font-medium">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded shadow-sm" style={{ backgroundColor: '#3b82f6' }}></div>
            <span className="font-medium">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded shadow-sm" style={{ backgroundColor: '#10b981' }}></div>
            <span className="font-medium">Low</span>
          </div>
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-300">
            <span>🔗</span>
            <span className="font-medium">Has dependencies</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import type { Card, User, Column } from '../../types';
import { 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isPast
} from 'date-fns';
import clsx from 'clsx';

interface CalendarViewProps {
  cards: Card[];
  columns: Column[];
  users: User[];
  onCardClick: (card: Card) => void;
  onCreateCard?: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  cards,
  columns,
  users,
  onCardClick,
  onCreateCard
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get column name from ID
  const getColumnName = (columnId: string) => {
    return columns.find(col => col.id === columnId)?.title || 'Unknown';
  };

  // Get user name from ID
  const getUserName = (userId?: string) => {
    if (!userId) return 'Unassigned';
    return users.find(user => user.id === userId)?.name || 'Unknown';
  };

  // Priority configuration
  const priorityConfig = {
    urgent: { color: 'bg-red-500 border-red-600', textColor: 'text-red-700', lightBg: 'bg-red-50' },
    high: { color: 'bg-orange-500 border-orange-600', textColor: 'text-orange-700', lightBg: 'bg-orange-50' },
    medium: { color: 'bg-blue-500 border-blue-600', textColor: 'text-blue-700', lightBg: 'bg-blue-50' },
    low: { color: 'bg-green-500 border-green-600', textColor: 'text-green-700', lightBg: 'bg-green-50' }
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Group cards by date
  const cardsByDate = useMemo(() => {
    const grouped = new Map<string, Card[]>();

    cards.forEach(card => {
      if (card.dueDate) {
        const dateKey = format(new Date(card.dueDate), 'yyyy-MM-dd');
        if (!grouped.has(dateKey)) {
          grouped.set(dateKey, []);
        }
        grouped.get(dateKey)!.push(card);
      }
    });

    // Sort cards by priority within each date
    grouped.forEach((cards) => {
      cards.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    });

    return grouped;
  }, [cards]);

  // Get cards for a specific date
  const getCardsForDate = (date: Date): Card[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return cardsByDate.get(dateKey) || [];
  };

  // Get selected date's cards
  const selectedDateCards = selectedDate ? getCardsForDate(selectedDate) : [];

  // Navigate months
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Statistics for current month
  const monthStats = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    let totalInMonth = 0;
    let completedInMonth = 0;
    let overdueInMonth = 0;

    cards.forEach(card => {
      if (card.dueDate) {
        const dueDate = new Date(card.dueDate);
        if (dueDate >= monthStart && dueDate <= monthEnd) {
          totalInMonth++;
          if (card.completedAt) {
            completedInMonth++;
          } else if (isPast(dueDate)) {
            overdueInMonth++;
          }
        }
      }
    });

    return { total: totalInMonth, completed: completedInMonth, overdue: overdueInMonth };
  }, [cards, currentDate]);

  return (
    <div className="flex h-full bg-gray-50">
      {/* Main Calendar */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Previous month"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={goToToday}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Next month"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Month Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{monthStats.total} tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">{monthStats.completed} completed</span>
              </div>
              {monthStats.overdue > 0 && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-red-600 font-medium">{monthStats.overdue} overdue</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div
                  key={day}
                  className="p-3 text-center text-xs font-semibold text-gray-600 uppercase"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const dayCards = getCardsForDate(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isDayToday = isToday(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isPastDay = isPast(day) && !isDayToday;

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={clsx(
                      'min-h-[120px] border-b border-r border-gray-200 p-2 transition-colors cursor-pointer',
                      index % 7 === 6 && 'border-r-0',
                      !isCurrentMonth && 'bg-gray-50',
                      isSelected && 'bg-blue-50 ring-2 ring-blue-500 ring-inset',
                      !isSelected && 'hover:bg-gray-50'
                    )}
                  >
                    {/* Day Number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={clsx(
                          'text-sm font-medium',
                          isDayToday && 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center',
                          !isDayToday && isCurrentMonth && 'text-gray-900',
                          !isDayToday && !isCurrentMonth && 'text-gray-400',
                          isPastDay && !isDayToday && 'text-gray-500'
                        )}
                      >
                        {format(day, 'd')}
                      </span>
                      {dayCards.length > 0 && (
                        <span className="text-xs text-gray-500 font-medium">
                          {dayCards.length}
                        </span>
                      )}
                    </div>

                    {/* Cards for this day */}
                    <div className="space-y-1">
                      {dayCards.slice(0, 3).map(card => {
                        const isOverdue = !card.completedAt && isPast(new Date(card.dueDate!));
                        const isCompleted = !!card.completedAt;
                        const config = priorityConfig[card.priority];

                        return (
                          <button
                            key={card.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onCardClick(card);
                            }}
                            className={clsx(
                              'w-full text-left p-1.5 rounded text-xs border-l-2 transition-all hover:shadow-md',
                              config.lightBg,
                              config.color,
                              isCompleted && 'opacity-60'
                            )}
                          >
                            <div className="flex items-start gap-1">
                              {isCompleted && (
                                <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                              )}
                              {isOverdue && !isCompleted && (
                                <AlertCircle className="w-3 h-3 text-red-600 flex-shrink-0 mt-0.5" />
                              )}
                              <span className={clsx(
                                'flex-1 truncate font-medium',
                                config.textColor,
                                isCompleted && 'line-through'
                              )}>
                                {card.title}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                      {dayCards.length > 3 && (
                        <div className="text-xs text-gray-500 text-center py-1">
                          +{dayCards.length - 3} more
                        </div>
                      )}
                    </div>

                    {/* Add task button (show on hover for current month) */}
                    {isCurrentMonth && onCreateCard && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateCard(day);
                        }}
                        className="w-full mt-1 p-1 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded flex items-center justify-center gap-1 opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Selected Date Details */}
      {selectedDate && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {format(selectedDate, 'EEEE, MMM d')}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600">
              {selectedDateCards.length} {selectedDateCards.length === 1 ? 'task' : 'tasks'} due
            </p>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-auto p-4">
            {selectedDateCards.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No tasks due on this date</p>
                {onCreateCard && (
                  <button
                    onClick={() => onCreateCard(selectedDate)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Create Task
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateCards.map(card => {
                  const isOverdue = !card.completedAt && isPast(new Date(card.dueDate!));
                  const isCompleted = !!card.completedAt;
                  const config = priorityConfig[card.priority];

                  return (
                    <button
                      key={card.id}
                      onClick={() => onCardClick(card)}
                      className={clsx(
                        'w-full text-left p-3 rounded-lg border-l-4 transition-all hover:shadow-md',
                        config.lightBg,
                        config.color,
                        isCompleted && 'opacity-60'
                      )}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        {isCompleted && (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        )}
                        {isOverdue && !isCompleted && (
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className={clsx(
                            'font-medium text-gray-900 mb-1',
                            isCompleted && 'line-through'
                          )}>
                            {card.title}
                          </h4>
                          {card.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {card.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                        <span className={clsx(
                          'inline-flex items-center gap-1 px-2 py-1 rounded',
                          config.lightBg,
                          config.textColor
                        )}>
                          {card.priority}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
                          {getColumnName(card.columnId)}
                        </span>
                        {card.assigneeId && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
                            <UserIcon className="w-3 h-3" />
                            {getUserName(card.assigneeId)}
                          </span>
                        )}
                        {card.estimateHours && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
                            <Clock className="w-3 h-3" />
                            {card.estimateHours}h
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

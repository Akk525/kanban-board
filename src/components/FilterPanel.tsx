import React, { useState } from 'react';
import { X, Filter, Calendar, User, RotateCcw } from 'lucide-react';
import type { User as UserType, Card } from '../types';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserType[];
  onFiltersChange: (filters: FilterState) => void;
  currentFilters: FilterState;
}

export interface FilterState {
  assigneeIds: string[];
  priorities: string[];
  labels: string[];
  dueDateRange: {
    start?: Date;
    end?: Date;
  };
  overdue: boolean;
  dueSoon: boolean;
}

const initialFilters: FilterState = {
  assigneeIds: [],
  priorities: [],
  labels: [],
  dueDateRange: {},
  overdue: false,
  dueSoon: false,
};

export const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  users,
  onFiltersChange,
  currentFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(currentFilters);

  if (!isOpen) return null;

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleArrayFilterToggle = (key: 'assigneeIds' | 'priorities' | 'labels', value: string) => {
    const currentArray = localFilters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    handleFilterChange(key, newArray);
  };

  const handleClearAll = () => {
    setLocalFilters(initialFilters);
    onFiltersChange(initialFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) return Object.values(value).some(v => v);
    return value;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end z-50">
      <div className="bg-white h-full w-80 shadow-lg p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter size={20} />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Assignees */}
          <div>
            <h3 className="flex items-center gap-2 font-medium text-gray-900 mb-3">
              <User size={16} />
              Assignees
            </h3>
            <div className="space-y-2">
              {users.map(user => (
                <label key={user.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localFilters.assigneeIds.includes(user.id)}
                    onChange={() => handleArrayFilterToggle('assigneeIds', user.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{user.name}</span>
                </label>
              ))}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.assigneeIds.includes('unassigned')}
                  onChange={() => handleArrayFilterToggle('assigneeIds', 'unassigned')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">Unassigned</span>
              </label>
            </div>
          </div>

          {/* Priorities */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Priority</h3>
            <div className="space-y-2">
              {['urgent', 'high', 'medium', 'low'].map(priority => (
                <label key={priority} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localFilters.priorities.includes(priority)}
                    onChange={() => handleArrayFilterToggle('priorities', priority)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-sm px-2 py-1 rounded capitalize ${
                    priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {priority}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <h3 className="flex items-center gap-2 font-medium text-gray-900 mb-3">
              <Calendar size={16} />
              Due Date
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.overdue}
                  onChange={(e) => handleFilterChange('overdue', e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-red-600">Overdue</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.dueSoon}
                  onChange={(e) => handleFilterChange('dueSoon', e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-orange-600">Due Soon (3 days)</span>
              </label>
              
              <div className="pt-2 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Date Range
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={localFilters.dueDateRange.start?.toISOString().split('T')[0] || ''}
                    onChange={(e) => handleFilterChange('dueDateRange', {
                      ...localFilters.dueDateRange,
                      start: e.target.value ? new Date(e.target.value) : undefined
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Start date"
                  />
                  <input
                    type="date"
                    value={localFilters.dueDateRange.end?.toISOString().split('T')[0] || ''}
                    onChange={(e) => handleFilterChange('dueDateRange', {
                      ...localFilters.dueDateRange,
                      end: e.target.value ? new Date(e.target.value) : undefined
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="End date"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <RotateCcw size={16} />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const useCardFilters = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const applyFilters = (cards: Card[]): Card[] => {
    return cards.filter(card => {
      // Assignee filter
      if (filters.assigneeIds.length > 0) {
        const matchesAssignee = filters.assigneeIds.includes(card.assigneeId || 'unassigned');
        if (!matchesAssignee) return false;
      }

      // Priority filter
      if (filters.priorities.length > 0) {
        if (!filters.priorities.includes(card.priority)) return false;
      }

      // Due date filters
      if (filters.overdue) {
        if (!card.dueDate || new Date(card.dueDate) >= new Date()) return false;
      }

      if (filters.dueSoon) {
        if (!card.dueDate) return false;
        const dueDate = new Date(card.dueDate);
        const now = new Date();
        const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        if (dueDate <= now || dueDate > threeDaysFromNow) return false;
      }

      // Custom date range
      if (filters.dueDateRange.start || filters.dueDateRange.end) {
        if (!card.dueDate) return false;
        const dueDate = new Date(card.dueDate);
        
        if (filters.dueDateRange.start && dueDate < filters.dueDateRange.start) return false;
        if (filters.dueDateRange.end && dueDate > filters.dueDateRange.end) return false;
      }

      return true;
    });
  };

  return { filters, setFilters, applyFilters };
};

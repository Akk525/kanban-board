import React from 'react';
import { LayoutGrid, GanttChart, BarChart3, Table, Calendar } from 'lucide-react';
import clsx from 'clsx';

export type ViewType = 'kanban' | 'gantt' | 'dashboard' | 'table' | 'calendar';

interface ViewTabsProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const views: Array<{ id: ViewType; label: string; icon: React.ReactNode }> = [
  { id: 'kanban', label: 'Kanban', icon: <LayoutGrid className="w-4 h-4" /> },
  { id: 'table', label: 'Table', icon: <Table className="w-4 h-4" /> },
  { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
  { id: 'gantt', label: 'Gantt', icon: <GanttChart className="w-4 h-4" /> },
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
];

export const ViewTabs: React.FC<ViewTabsProps> = ({ activeView, onViewChange }) => {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      {views.map(view => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all',
            activeView === view.id
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          )}
        >
          {view.icon}
          <span>{view.label}</span>
        </button>
      ))}
    </div>
  );
};

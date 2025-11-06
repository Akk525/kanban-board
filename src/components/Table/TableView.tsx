import React, { useState, useMemo } from 'react';
import type { Card, User, Column } from '../../types';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Download,
  Filter,
  Search,
  Calendar,
  User as UserIcon,
  Tag,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText
} from 'lucide-react';
import { format, isAfter } from 'date-fns';
import clsx from 'clsx';

type SortField = 'title' | 'priority' | 'status' | 'assignee' | 'dueDate' | 'createdAt' | 'estimateHours';
type SortDirection = 'asc' | 'desc' | null;

interface TableViewProps {
  cards: Card[];
  columns: Column[];
  users: User[];
  onCardClick: (card: Card) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  cards,
  columns,
  users,
  onCardClick
}) => {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');

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
    urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800', icon: AlertCircle },
    high: { label: 'High', color: 'bg-orange-100 text-orange-800', icon: ArrowUp },
    medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800', icon: ArrowUpDown },
    low: { label: 'Low', color: 'bg-green-100 text-green-800', icon: ArrowDown }
  };

  // Sort and filter cards
  const processedCards = useMemo(() => {
    let filtered = [...cards];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(card => 
        card.title.toLowerCase().includes(query) ||
        card.description?.toLowerCase().includes(query) ||
        card.labels.some(label => label.toLowerCase().includes(query))
      );
    }

    // Apply priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(card => card.priority === filterPriority);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'completed') {
        filtered = filtered.filter(card => card.completedAt);
      } else if (filterStatus === 'overdue') {
        filtered = filtered.filter(card => 
          card.dueDate && 
          !card.completedAt && 
          isAfter(new Date(), new Date(card.dueDate))
        );
      } else if (filterStatus === 'active') {
        filtered = filtered.filter(card => !card.completedAt);
      }
    }

    // Apply assignee filter
    if (filterAssignee !== 'all') {
      if (filterAssignee === 'unassigned') {
        filtered = filtered.filter(card => !card.assigneeId);
      } else {
        filtered = filtered.filter(card => card.assigneeId === filterAssignee);
      }
    }

    // Apply sorting
    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        let aVal: any;
        let bVal: any;

        switch (sortField) {
          case 'title':
            aVal = a.title.toLowerCase();
            bVal = b.title.toLowerCase();
            break;
          case 'priority':
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            aVal = priorityOrder[a.priority];
            bVal = priorityOrder[b.priority];
            break;
          case 'status':
            aVal = getColumnName(a.columnId);
            bVal = getColumnName(b.columnId);
            break;
          case 'assignee':
            aVal = getUserName(a.assigneeId);
            bVal = getUserName(b.assigneeId);
            break;
          case 'dueDate':
            aVal = a.dueDate ? new Date(a.dueDate).getTime() : 0;
            bVal = b.dueDate ? new Date(b.dueDate).getTime() : 0;
            break;
          case 'createdAt':
            aVal = new Date(a.createdAt).getTime();
            bVal = new Date(b.createdAt).getTime();
            break;
          case 'estimateHours':
            aVal = a.estimateHours || 0;
            bVal = b.estimateHours || 0;
            break;
          default:
            return 0;
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [cards, searchQuery, filterPriority, filterStatus, filterAssignee, sortField, sortDirection, columns, users]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null -> asc
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField('createdAt');
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Export to CSV
  const handleExport = () => {
    const headers = [
      'Title',
      'Description',
      'Status',
      'Priority',
      'Assignee',
      'Labels',
      'Due Date',
      'Created Date',
      'Completed Date',
      'Estimate Hours',
      'Comments'
    ];

    const rows = processedCards.map(card => [
      card.title,
      card.description || '',
      getColumnName(card.columnId),
      card.priority,
      getUserName(card.assigneeId),
      card.labels.join('; '),
      card.dueDate ? format(new Date(card.dueDate), 'yyyy-MM-dd') : '',
      format(new Date(card.createdAt), 'yyyy-MM-dd'),
      card.completedAt ? format(new Date(card.completedAt), 'yyyy-MM-dd') : '',
      card.estimateHours || '',
      card.comments.length.toString()
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kanban-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterPriority('all');
    setFilterStatus('all');
    setFilterAssignee('all');
  };

  const hasActiveFilters = searchQuery || filterPriority !== 'all' || filterStatus !== 'all' || filterAssignee !== 'all';

  // Render sort icon
  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="w-4 h-4 text-blue-600" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="w-4 h-4 text-blue-600" />;
    }
    return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-4 space-y-4 flex-shrink-0">
        {/* Search and Actions */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear all
            </button>
          )}

          <div className="ml-auto text-sm text-gray-600">
            Showing {processedCards.length} of {cards.length} tasks
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="text-left p-3 border-b border-gray-200">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                >
                  <FileText className="w-4 h-4" />
                  Title
                  <SortIcon field="title" />
                </button>
              </th>
              <th className="text-left p-3 border-b border-gray-200">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                >
                  Status
                  <SortIcon field="status" />
                </button>
              </th>
              <th className="text-left p-3 border-b border-gray-200">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                >
                  Priority
                  <SortIcon field="priority" />
                </button>
              </th>
              <th className="text-left p-3 border-b border-gray-200">
                <button
                  onClick={() => handleSort('assignee')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                >
                  <UserIcon className="w-4 h-4" />
                  Assignee
                  <SortIcon field="assignee" />
                </button>
              </th>
              <th className="text-left p-3 border-b border-gray-200">
                <div className="flex items-center gap-2 font-semibold text-gray-700">
                  <Tag className="w-4 h-4" />
                  Labels
                </div>
              </th>
              <th className="text-left p-3 border-b border-gray-200">
                <button
                  onClick={() => handleSort('dueDate')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                >
                  <Calendar className="w-4 h-4" />
                  Due Date
                  <SortIcon field="dueDate" />
                </button>
              </th>
              <th className="text-left p-3 border-b border-gray-200">
                <button
                  onClick={() => handleSort('estimateHours')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                >
                  <Clock className="w-4 h-4" />
                  Estimate
                  <SortIcon field="estimateHours" />
                </button>
              </th>
              <th className="text-left p-3 border-b border-gray-200">
                <button
                  onClick={() => handleSort('createdAt')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                >
                  Created
                  <SortIcon field="createdAt" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {processedCards.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-500">
                  {hasActiveFilters ? 'No tasks match your filters' : 'No tasks available'}
                </td>
              </tr>
            ) : (
              processedCards.map((card) => {
                const isOverdue = card.dueDate && !card.completedAt && isAfter(new Date(), new Date(card.dueDate));
                const isCompleted = !!card.completedAt;
                const priorityInfo = priorityConfig[card.priority];
                const PriorityIcon = priorityInfo.icon;

                return (
                  <tr
                    key={card.id}
                    onClick={() => onCardClick(card)}
                    className={clsx(
                      'border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors',
                      isCompleted && 'opacity-60'
                    )}
                  >
                    {/* Title */}
                    <td className="p-3">
                      <div className="flex items-start gap-2">
                        {isCompleted && (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className={clsx(
                            'font-medium text-gray-900',
                            isCompleted && 'line-through'
                          )}>
                            {card.title}
                          </div>
                          {card.description && (
                            <div className="text-sm text-gray-500 truncate mt-1">
                              {card.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getColumnName(card.columnId)}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="p-3">
                      <span className={clsx(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                        priorityInfo.color
                      )}>
                        <PriorityIcon className="w-3 h-3" />
                        {priorityInfo.label}
                      </span>
                    </td>

                    {/* Assignee */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {card.assigneeId ? (
                          <>
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium">
                              {getUserName(card.assigneeId).charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-gray-700">
                              {getUserName(card.assigneeId)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Unassigned</span>
                        )}
                      </div>
                    </td>

                    {/* Labels */}
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {card.labels.length > 0 ? (
                          card.labels.map((label, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                            >
                              {label}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="p-3">
                      {card.dueDate ? (
                        <div className="flex items-center gap-1.5">
                          {isOverdue && (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className={clsx(
                            'text-sm',
                            isOverdue ? 'text-red-600 font-medium' : 'text-gray-700'
                          )}>
                            {format(new Date(card.dueDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>

                    {/* Estimate */}
                    <td className="p-3">
                      {card.estimateHours ? (
                        <span className="text-sm text-gray-700">
                          {card.estimateHours}h
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>

                    {/* Created */}
                    <td className="p-3">
                      <span className="text-sm text-gray-700">
                        {format(new Date(card.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

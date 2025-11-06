import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Calendar,
  Folder,
  LayoutDashboard,
  Plus,
  ArrowRight
} from 'lucide-react';
import type { Board, Card, User, BoardMetadata } from '../../types';
import { format, isPast } from 'date-fns';

interface DashboardViewProps {
  boards: Board[];
  boardsMetadata: BoardMetadata[];
  allCards: Card[];
  users: User[];
  activeBoardId: string | null;
  onBoardSelect: (boardId: string) => void;
  onCreateBoard?: () => void;
  onSwitchToKanban?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  boards,
  boardsMetadata,
  allCards,
  users,
  activeBoardId,
  onBoardSelect,
  onCreateBoard,
  onSwitchToKanban
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'all'>('week');

  // Calculate metrics
  const totalCards = allCards.length;
  const completedCards = allCards.filter(card => 
    card.columnId.toLowerCase().includes('done') || card.completedAt
  ).length;
  const inProgressCards = allCards.filter(card => 
    card.columnId.toLowerCase().includes('progress')
  ).length;
  const overdueCards = allCards.filter(card => 
    card.dueDate && isPast(new Date(card.dueDate)) && !card.completedAt
  ).length;

  // Team activity
  const userActivity = users.map(user => {
    const userCards = allCards.filter(card => card.assigneeId === user.id);
    const userCompleted = userCards.filter(card => card.completedAt).length;
    const userInProgress = userCards.filter(card => 
      card.columnId.toLowerCase().includes('progress')
    ).length;

    return {
      user,
      total: userCards.length,
      completed: userCompleted,
      inProgress: userInProgress,
      completionRate: userCards.length > 0 ? (userCompleted / userCards.length) * 100 : 0
    };
  }).filter(activity => activity.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Priority breakdown
  const priorityBreakdown = {
    urgent: allCards.filter(c => c.priority === 'urgent').length,
    high: allCards.filter(c => c.priority === 'high').length,
    medium: allCards.filter(c => c.priority === 'medium').length,
    low: allCards.filter(c => c.priority === 'low').length,
  };

  // Boards overview
  const boardsOverview = boards.map(board => {
    const boardCards = board.columns.flatMap(col => col.cards);
    const metadata = boardsMetadata.find(m => m.id === board.id);
    
    return {
      board,
      metadata,
      totalCards: boardCards.length,
      completed: boardCards.filter(c => c.completedAt).length,
      overdue: boardCards.filter(c => 
        c.dueDate && isPast(new Date(c.dueDate)) && !c.completedAt
      ).length,
    };
  });

  const completionRate = totalCards > 0 ? (completedCards / totalCards) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your projects and team activity</p>
        </div>
        
        {/* Time Range Filter */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setSelectedTimeRange('week')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedTimeRange === 'week' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setSelectedTimeRange('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedTimeRange === 'month' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setSelectedTimeRange('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedTimeRange === 'all' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalCards}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">Active</span>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{completedCards}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{completionRate.toFixed(0)}% completion</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{inProgressCards}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-yellow-600 font-medium">Active work</span>
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{overdueCards}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {overdueCards > 0 ? (
              <>
                <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                <span className="text-red-600 font-medium">Needs attention</span>
              </>
            ) : (
              <span className="text-green-600 font-medium">On track!</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
          <div className="space-y-4">
            {Object.entries(priorityBreakdown).map(([priority, count]) => {
              const total = Object.values(priorityBreakdown).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const colors = {
                urgent: { bg: 'bg-red-500', light: 'bg-red-100', text: 'text-red-700' },
                high: { bg: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-700' },
                medium: { bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-700' },
                low: { bg: 'bg-green-500', light: 'bg-green-100', text: 'text-green-700' },
              };
              const color = colors[priority as keyof typeof colors];

              return (
                <div key={priority}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 capitalize">{priority}</span>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                  <div className={`w-full ${color.light} rounded-full h-2`}>
                    <div 
                      className={`${color.bg} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Contributors</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {userActivity.length > 0 ? (
              userActivity.map(({ user, total, completed, inProgress, completionRate }) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{total} tasks</span>
                        <span>•</span>
                        <span>{completed} done</span>
                        <span>•</span>
                        <span>{inProgress} active</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {completionRate.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No assigned tasks yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Boards Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Folder className="w-6 h-6 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Your Boards</h3>
          </div>
          {onCreateBoard && (
            <button
              onClick={onCreateBoard}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Board
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boardsOverview.map(({ board, metadata, totalCards, completed, overdue }) => {
            const isActive = board.id === activeBoardId;
            const progress = totalCards > 0 ? (completed / totalCards) * 100 : 0;

            return (
              <button
                key={board.id}
                onClick={() => {
                  onBoardSelect(board.id);
                  onSwitchToKanban?.();
                }}
                className={`text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  isActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{board.title}</h4>
                    {board.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{board.description}</p>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-600 mt-3">
                    <span className="flex items-center gap-1">
                      <LayoutDashboard className="w-3 h-3" />
                      {totalCards} tasks
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      {completed} done
                    </span>
                    {overdue > 0 && (
                      <span className="flex items-center gap-1 text-red-600">
                        <AlertCircle className="w-3 h-3" />
                        {overdue} overdue
                      </span>
                    )}
                  </div>

                  {metadata?.updatedAt && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                      <Calendar className="w-3 h-3" />
                      Updated {format(new Date(metadata.updatedAt), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>

                {isActive && (
                  <div className="mt-3 text-xs text-blue-600 font-medium">
                    Currently viewing
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {boards.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No boards yet</p>
            {onCreateBoard && (
              <button
                onClick={onCreateBoard}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Your First Board
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

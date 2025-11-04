import React, { useState } from 'react';
import { X, Trash2, Edit2, Check } from 'lucide-react';
import type { BoardMetadata } from '../types';

interface BoardManagerProps {
  isOpen: boolean;
  onClose: () => void;
  boards: BoardMetadata[];
  activeBoardId: string;
  onCreateBoard: (name: string, description: string, color: string) => void;
  onUpdateBoard: (id: string, name: string, description: string, color: string) => void;
  onDeleteBoard: (id: string) => void;
}

const BOARD_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // orange
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
  '#6366F1', // indigo
  '#84CC16', // lime
];

export const BoardManager: React.FC<BoardManagerProps> = ({
  isOpen,
  onClose,
  boards,
  activeBoardId,
  onCreateBoard,
  onUpdateBoard,
  onDeleteBoard,
}) => {
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [newBoardColor, setNewBoardColor] = useState(BOARD_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleCreate = () => {
    if (newBoardName.trim()) {
      onCreateBoard(newBoardName.trim(), newBoardDescription.trim(), newBoardColor);
      setNewBoardName('');
      setNewBoardDescription('');
      setNewBoardColor(BOARD_COLORS[0]);
    }
  };

  const handleEdit = (board: BoardMetadata) => {
    setEditingId(board.id);
    setEditName(board.name);
    setEditDescription(board.description || '');
    setEditColor(board.color);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      onUpdateBoard(editingId, editName.trim(), editDescription.trim(), editColor);
      setEditingId(null);
    }
  };

  const handleDelete = (boardId: string) => {
    if (boardId === activeBoardId) {
      setErrorMessage('Cannot delete the active board. Please switch to another board first.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    if (deleteConfirmId === boardId) {
      onDeleteBoard(boardId);
      setDeleteConfirmId(null);
      setErrorMessage('');
    } else {
      setDeleteConfirmId(boardId);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center modal-backdrop">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Manage Boards</h2>
            <p className="text-sm text-gray-500 mt-1">Create and organize your team boards</p>
            {errorMessage && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 animate-shake">
                {errorMessage}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Create New Board */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Create New Board</h3>
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Board name *"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newBoardDescription}
                  onChange={(e) => setNewBoardDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Board Color</label>
                <div className="flex gap-2">
                  {BOARD_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewBoardColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        newBoardColor === color
                          ? 'ring-2 ring-offset-2 ring-gray-900 scale-110'
                          : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={handleCreate}
                disabled={!newBoardName.trim()}
                className="w-full btn-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Board
              </button>
            </div>
          </div>

          {/* Existing Boards */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Boards ({boards.length})</h3>
            <div className="space-y-2">
              {boards.map((board) => (
                <div
                  key={board.id}
                  className={`p-4 bg-white border rounded-lg transition-all ${
                    board.id === activeBoardId
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {editingId === board.id ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: editColor }}
                        />
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Description"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="flex gap-2">
                        {BOARD_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => setEditColor(color)}
                            className={`w-6 h-6 rounded-full transition-all ${
                              editColor === color
                                ? 'ring-2 ring-offset-1 ring-gray-900 scale-110'
                                : 'hover:scale-110'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 btn-primary text-sm py-1.5 flex items-center justify-center gap-1"
                        >
                          <Check size={14} />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 btn-secondary text-sm py-1.5"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                          style={{ backgroundColor: board.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{board.name}</h4>
                            {board.id === activeBoardId && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                                Active
                              </span>
                            )}
                          </div>
                          {board.description && (
                            <p className="text-sm text-gray-600 mt-1">{board.description}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Created {new Date(board.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(board)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(board.id)}
                          disabled={board.id === activeBoardId}
                          className={`p-2 rounded transition-colors ${
                            deleteConfirmId === board.id
                              ? 'bg-red-100 text-red-700 shake'
                              : board.id === activeBoardId
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title={
                            board.id === activeBoardId
                              ? 'Cannot delete active board'
                              : deleteConfirmId === board.id
                              ? 'Click again to confirm'
                              : 'Delete'
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full btn-secondary text-sm py-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

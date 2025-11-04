import React, { useState } from 'react';
import { ChevronDown, Plus, Settings } from 'lucide-react';
import type { BoardMetadata } from '../types';

interface BoardSelectorProps {
  boards: BoardMetadata[];
  activeBoard: BoardMetadata;
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: () => void;
  onManageBoards: () => void;
}

export const BoardSelector: React.FC<BoardSelectorProps> = ({
  boards,
  activeBoard,
  onSelectBoard,
  onCreateBoard,
  onManageBoards,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Selected Board Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: activeBoard.color }}
        />
        <span className="font-semibold text-gray-900">{activeBoard.name}</span>
        <ChevronDown 
          size={16} 
          className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-40 overflow-hidden animate-slideDown">
            {/* Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Your Boards</h3>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onManageBoards();
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  title="Manage Boards"
                >
                  <Settings size={16} />
                </button>
              </div>
            </div>

            {/* Board List */}
            <div className="max-h-96 overflow-y-auto">
              {boards.map((board) => (
                <button
                  key={board.id}
                  onClick={() => {
                    onSelectBoard(board.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                    board.id === activeBoard.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: board.color }}
                  />
                  <div className="flex-1 text-left">
                    <div className={`font-medium text-sm ${
                      board.id === activeBoard.id ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {board.name}
                    </div>
                    {board.description && (
                      <div className="text-xs text-gray-500 truncate">
                        {board.description}
                      </div>
                    )}
                  </div>
                  {board.id === activeBoard.id && (
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </button>
              ))}
            </div>

            {/* Create Board Button */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onCreateBoard();
                }}
                className="w-full btn-primary flex items-center justify-center gap-2 text-sm py-2"
              >
                <Plus size={16} />
                Create New Board
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

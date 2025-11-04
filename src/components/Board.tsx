import React, { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Filter, Search, Palette, Archive as ArchiveIcon } from 'lucide-react';
import { Column } from './Column';
import { Card } from './Card';
import { CreateCardModal } from './CreateCardModal';
import { CardDetailsModal } from './CardDetailsModal';
import { FilterPanel, useCardFilters } from './FilterPanel';
import { GameStats } from './GameStats';
import { Celebration } from './Celebration';
import { CategoryManager } from './CategoryManager';
import { Archive } from './Archive';
import { BoardSelector } from './BoardSelector';
import { BoardManager } from './BoardManager';
import { InputModal } from './InputModal';
import { useBoardContext } from '../context/BoardContext';
import { useGame } from '../context/GameContext';
import { sampleBoard } from '../data/sampleData';
import type { Card as CardType } from '../types';

export const Board: React.FC = () => {
  const { state, dispatch } = useBoardContext();
  const { addPoints, addProgressPoints, state: gameState } = useGame();
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationPoints, setCelebrationPoints] = useState(0);
  const [celebrationAchievement, setCelebrationAchievement] = useState<string>('');
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showBoardManager, setShowBoardManager] = useState(false);
  const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const { filters, setFilters, applyFilters } = useCardFilters();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Initialize with sample board if no boards exist
  useEffect(() => {
    if (state.boards.length === 0 && state.boardMetadata.length === 0) {
      // Create initial board with sample data
      const boardMetadata = {
        id: sampleBoard.id,
        name: sampleBoard.title,
        description: sampleBoard.description,
        color: '#3B82F6',
        createdAt: sampleBoard.createdAt,
        updatedAt: sampleBoard.updatedAt,
      };
      
      dispatch({ 
        type: 'SET_BOARDS', 
        payload: { 
          boards: [sampleBoard], 
          metadata: [boardMetadata]
        } 
      });
    }
  }, []); // Run only once on mount

  // Get active board
  const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
  const activeBoardMetadata = state.boardMetadata.find(m => m.id === state.activeBoardId);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = activeBoard?.columns
      .flatMap(col => col.cards)
      .find(card => card.id === active.id);
    setActiveCard(card || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over || active.id === over.id) return;

    const activeCard = activeBoard?.columns
      .flatMap(col => col.cards)
      .find(card => card.id === active.id);

    if (!activeCard) return;

    const sourceColumn = activeBoard?.columns.find(col => 
      col.cards.some(card => card.id === active.id)
    );
    
    const targetColumn = activeBoard?.columns.find(col => col.id === over.id);

    if (!sourceColumn || !targetColumn) return;

    if (sourceColumn.id !== targetColumn.id) {
      dispatch({
        type: 'MOVE_CARD',
        payload: {
          cardId: active.id as string,
          sourceColumnId: sourceColumn.id,
          targetColumnId: targetColumn.id,
          newOrder: targetColumn.cards.length,
        },
      });

      // Game events
      if (targetColumn.title.toLowerCase() === 'done') {
        // Task completed - trigger celebration
        const points = { low: 10, medium: 20, high: 35, urgent: 50 }[activeCard.priority];
        const prevAchievementCount = gameState.achievements.filter(a => a.unlocked).length;
        
        addPoints(activeCard.priority);
        
        // Check for newly unlocked achievements after a short delay
        setTimeout(() => {
          const newAchievementCount = gameState.achievements.filter(a => a.unlocked).length;
          const newlyUnlocked = gameState.achievements
            .filter(a => a.unlocked)
            .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))[0];
          
          if (newAchievementCount > prevAchievementCount && newlyUnlocked) {
            setCelebrationAchievement(newlyUnlocked.title);
          }
        }, 100);
        
        setCelebrationPoints(points);
        setShowCelebration(true);
        
        // Auto-archive the card after 3 seconds
        setTimeout(() => {
          dispatch({ type: 'ARCHIVE_CARD', payload: active.id as string });
        }, 3000);
      } else if (targetColumn.title.toLowerCase().includes('progress')) {
        // Task moved to in progress
        addProgressPoints();
      }
    }
  };

  const handleAddCard = (columnId: string) => {
    setSelectedColumnId(columnId);
    setShowCreateCard(true);
  };

  const handleAddColumn = () => {
    setShowAddColumnModal(true);
  };

  const handleDeleteColumn = (columnId: string) => {
    dispatch({ type: 'DELETE_COLUMN', payload: columnId });
  };

  const handleRenameColumn = (columnId: string, newTitle: string) => {
    dispatch({ type: 'UPDATE_COLUMN', payload: { id: columnId, title: newTitle } });
  };

  const handleCardClick = (card: CardType) => {
    setSelectedCard(card);
    setShowCardDetails(true);
  };

  const filteredBoard = React.useMemo(() => {
    if (!activeBoard) return null;

    let filteredCards: CardType[] = [];
    
    // First filter out archived cards and apply search filter
    activeBoard.columns.forEach(column => {
      const searchFiltered = column.cards.filter(card =>
        !card.archived && // Exclude archived cards
        (!searchTerm || 
        card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.labels.some(label => label.toLowerCase().includes(searchTerm.toLowerCase())))
      );
      filteredCards = [...filteredCards, ...searchFiltered];
    });

    // Then apply advanced filters
    const advancedFiltered = applyFilters(filteredCards);

    return {
      ...activeBoard,
      columns: activeBoard.columns.map(column => ({
        ...column,
        cards: column.cards.filter(card => !card.archived && advancedFiltered.includes(card)),
      })),
    };
  }, [activeBoard, searchTerm, filters, applyFilters]);

  // Get archived cards
  const archivedCards = activeBoard?.columns
    .flatMap(col => col.cards)
    .filter(card => card.archived) || [];

  // Show loading only if we're still initializing
  if (!filteredBoard || !activeBoardMetadata) {
    // If boards exist but no active board, something is wrong
    if (state.boards.length > 0 && !state.activeBoardId) {
      // Set the first board as active
      dispatch({ type: 'SET_ACTIVE_BOARD', payload: state.boards[0].id });
      return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Game Stats */}
      <div className="bg-white shadow-sm border-b border-gray-200 py-2">
        <div className="max-w-7xl mx-auto px-4">
          <GameStats />
        </div>
      </div>

      {/* Compact Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Board Selector */}
              <BoardSelector
                boards={state.boardMetadata}
                activeBoard={activeBoardMetadata}
                onSelectBoard={(boardId) => {
                  dispatch({ type: 'SET_ACTIVE_BOARD', payload: boardId });
                }}
                onCreateBoard={() => setShowCreateBoardModal(true)}
                onManageBoards={() => setShowBoardManager(true)}
              />
              
              <div>
                {filteredBoard.description && (
                  <p className="text-gray-600 text-xs">{filteredBoard.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
                />
              </div>
              
              <button 
                className="btn-secondary flex items-center gap-1 text-xs px-3 py-1.5"
                onClick={() => setShowFilters(true)}
              >
                <Filter size={14} />
                Filter
              </button>

              <button 
                className="btn-secondary flex items-center gap-1 text-xs px-3 py-1.5 relative"
                onClick={() => setShowArchive(true)}
              >
                <ArchiveIcon size={14} />
                Archive
                {archivedCards.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {archivedCards.length}
                  </span>
                )}
              </button>

              <button 
                className="btn-secondary flex items-center gap-1 text-xs px-3 py-1.5"
                onClick={() => setShowCategoryManager(true)}
              >
                <Palette size={14} />
                Categories
              </button>
              
              <button
                onClick={handleAddColumn}
                className="btn-primary flex items-center gap-1 text-xs px-3 py-1.5"
              >
                <Plus size={14} />
                Add Column
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4">
              <SortableContext
                items={filteredBoard.columns.map(col => col.id)}
                strategy={horizontalListSortingStrategy}
              >
                {filteredBoard.columns.map(column => (
                  <Column
                    key={column.id}
                    column={column}
                    categories={activeBoard?.categories}
                    onAddCard={handleAddCard}
                    onCardClick={handleCardClick}
                    onDeleteColumn={handleDeleteColumn}
                    onRenameColumn={handleRenameColumn}
                  />
                ))}
              </SortableContext>
            </div>

            <DragOverlay>
              {activeCard && (
                <Card card={activeCard} categories={activeBoard?.categories} />
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Create Card Modal */}
      {showCreateCard && (
        <CreateCardModal
          isOpen={showCreateCard}
          onClose={() => setShowCreateCard(false)}
          columnId={selectedColumnId}
          users={state.users}
          categories={activeBoard?.categories}
        />
      )}

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          users={state.users}
          onFiltersChange={setFilters}
          currentFilters={filters}
        />
      )}

      {/* Card Details Modal */}
      {showCardDetails && (
        <CardDetailsModal
          card={selectedCard}
          isOpen={showCardDetails}
          onClose={() => setShowCardDetails(false)}
          users={state.users}
        />
      )}

      {/* Celebration Animation */}
      <Celebration
        show={showCelebration}
        onComplete={() => {
          setShowCelebration(false);
          setCelebrationAchievement('');
        }}
        points={celebrationPoints}
        achievementUnlocked={celebrationAchievement}
      />

      {/* Category Manager */}
      {showCategoryManager && (
        <CategoryManager
          isOpen={showCategoryManager}
          onClose={() => setShowCategoryManager(false)}
          categories={activeBoard?.categories || []}
          onAddCategory={(name, color) => {
            dispatch({
              type: 'ADD_CATEGORY',
              payload: { name, color }
            });
          }}
          onUpdateCategory={(id, name, color) => {
            dispatch({
              type: 'UPDATE_CATEGORY',
              payload: { id, name, color }
            });
          }}
          onDeleteCategory={(id) => {
            dispatch({
              type: 'DELETE_CATEGORY',
              payload: { id }
            });
          }}
        />
      )}

      {/* Archive */}
      {showArchive && (
        <Archive
          isOpen={showArchive}
          onClose={() => setShowArchive(false)}
          cards={archivedCards}
          categories={activeBoard?.categories}
          onRestore={(cardId) => {
            dispatch({ type: 'RESTORE_CARD', payload: cardId });
          }}
          onDelete={(cardId) => {
            dispatch({ type: 'DELETE_CARD', payload: cardId });
          }}
        />
      )}

      {/* Board Manager */}
      {showBoardManager && (
        <BoardManager
          isOpen={showBoardManager}
          onClose={() => setShowBoardManager(false)}
          boards={state.boardMetadata}
          activeBoardId={state.activeBoardId || ''}
          onCreateBoard={(name, description, color) => {
            dispatch({
              type: 'CREATE_BOARD',
              payload: { name, description, color },
            });
          }}
          onUpdateBoard={(id, name, description, color) => {
            dispatch({
              type: 'UPDATE_BOARD_METADATA',
              payload: { id, name, description, color },
            });
          }}
          onDeleteBoard={(id) => {
            dispatch({
              type: 'DELETE_BOARD',
              payload: id,
            });
          }}
        />
      )}

      {/* Create Board Modal */}
      <InputModal
        isOpen={showCreateBoardModal}
        onClose={() => setShowCreateBoardModal(false)}
        onConfirm={(name) => {
          dispatch({
            type: 'CREATE_BOARD',
            payload: {
              name,
              description: '',
              color: '#3B82F6',
            },
          });
        }}
        title="Create New Board"
        label="Board Name"
        placeholder="Enter board name..."
        confirmText="Create Board"
      />

      {/* Add Column Modal */}
      <InputModal
        isOpen={showAddColumnModal}
        onClose={() => setShowAddColumnModal(false)}
        onConfirm={(title) => {
          dispatch({ type: 'ADD_COLUMN', payload: { title } });
        }}
        title="Add New Column"
        label="Column Title"
        placeholder="e.g., To Do, In Progress, Done..."
        confirmText="Add Column"
      />
    </div>
  );
};

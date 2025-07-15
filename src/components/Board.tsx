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
import { Plus, Filter, Search, Palette } from 'lucide-react';
import { Column } from './Column';
import { Card } from './Card';
import { CreateCardModal } from './CreateCardModal';
import { CardDetailsModal } from './CardDetailsModal';
import { FilterPanel, useCardFilters } from './FilterPanel';
import { GameStats } from './GameStats';
import { Celebration } from './Celebration';
import { CategoryManager } from './CategoryManager';
import { useBoardContext } from '../context/BoardContext';
import { useGame } from '../context/GameContext';
import { sampleBoard } from '../data/sampleData';
import type { Card as CardType } from '../types';

export const Board: React.FC = () => {
  const { state, dispatch } = useBoardContext();
  const { addPoints, addProgressPoints } = useGame();
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationPoints, setCelebrationPoints] = useState(0);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const { filters, setFilters, applyFilters } = useCardFilters();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (!state.board) {
      dispatch({ type: 'SET_BOARD', payload: sampleBoard });
    }
  }, [state.board, dispatch]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = state.board?.columns
      .flatMap(col => col.cards)
      .find(card => card.id === active.id);
    setActiveCard(card || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over || active.id === over.id) return;

    const activeCard = state.board?.columns
      .flatMap(col => col.cards)
      .find(card => card.id === active.id);

    if (!activeCard) return;

    const sourceColumn = state.board?.columns.find(col => 
      col.cards.some(card => card.id === active.id)
    );
    
    const targetColumn = state.board?.columns.find(col => col.id === over.id);

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
        addPoints(activeCard.priority);
        setCelebrationPoints(points);
        setShowCelebration(true);
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
    const title = prompt('Enter column title:');
    if (title) {
      dispatch({ type: 'ADD_COLUMN', payload: { title } });
    }
  };

  const handleCardClick = (card: CardType) => {
    setSelectedCard(card);
    setShowCardDetails(true);
  };

  const filteredBoard = React.useMemo(() => {
    if (!state.board) return state.board;

    let filteredCards: CardType[] = [];
    
    // First apply search filter
    state.board.columns.forEach(column => {
      const searchFiltered = column.cards.filter(card =>
        !searchTerm || 
        card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.labels.some(label => label.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      filteredCards = [...filteredCards, ...searchFiltered];
    });

    // Then apply advanced filters
    const advancedFiltered = applyFilters(filteredCards);

    return {
      ...state.board,
      columns: state.board.columns.map(column => ({
        ...column,
        cards: column.cards.filter(card => advancedFiltered.includes(card)),
      })),
    };
  }, [state.board, searchTerm, filters, applyFilters]);

  if (!filteredBoard) {
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
            <div>
              <h1 className="text-xl font-bold text-gray-900">{filteredBoard.title}</h1>
              {filteredBoard.description && (
                <p className="text-gray-600 text-xs">{filteredBoard.description}</p>
              )}
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
                    categories={state.board?.categories}
                    onAddCard={handleAddCard}
                    onCardClick={handleCardClick}
                  />
                ))}
              </SortableContext>
            </div>

            <DragOverlay>
              {activeCard && (
                <Card card={activeCard} categories={state.board?.categories} />
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
          categories={state.board?.categories}
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
        onComplete={() => setShowCelebration(false)}
        points={celebrationPoints}
      />

      {/* Category Manager */}
      {showCategoryManager && (
        <CategoryManager
          isOpen={showCategoryManager}
          onClose={() => setShowCategoryManager(false)}
          categories={state.board?.categories || []}
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
    </div>
  );
};

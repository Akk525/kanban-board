import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Board, Card, Column, User, CreateCardData, UpdateCardData, Category } from '../types';

interface BoardState {
  board: Board | null;
  users: User[];
  currentUser: User | null;
}

type BoardAction =
  | { type: 'SET_BOARD'; payload: Board }
  | { type: 'ADD_CARD'; payload: CreateCardData }
  | { type: 'UPDATE_CARD'; payload: UpdateCardData }
  | { type: 'DELETE_CARD'; payload: string }
  | { type: 'MOVE_CARD'; payload: { cardId: string; sourceColumnId: string; targetColumnId: string; newOrder: number } }
  | { type: 'ADD_COLUMN'; payload: { title: string } }
  | { type: 'UPDATE_COLUMN'; payload: { id: string; title: string } }
  | { type: 'DELETE_COLUMN'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: { name: string; color: string } }
  | { type: 'UPDATE_CATEGORY'; payload: { id: string; name: string; color: string } }
  | { type: 'DELETE_CATEGORY'; payload: { id: string } }
  | { type: 'SET_CURRENT_USER'; payload: User };

const initialState: BoardState = {
  board: null,
  users: [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'member',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'member',
    },
  ],
  currentUser: {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
  },
};

function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'SET_BOARD':
      return { ...state, board: action.payload };

    case 'ADD_CARD': {
      if (!state.board) return state;
      
      const newCard: Card = {
        id: uuidv4(),
        ...action.payload,
        createdAt: new Date(),
        updatedAt: new Date(),
        comments: [],
        order: state.board.columns.find(col => col.id === action.payload.columnId)?.cards.length || 0,
      };

      const updatedBoard = {
        ...state.board,
        columns: state.board.columns.map(column =>
          column.id === action.payload.columnId
            ? { ...column, cards: [...column.cards, newCard] }
            : column
        ),
      };

      return { ...state, board: updatedBoard };
    }

    case 'UPDATE_CARD': {
      if (!state.board) return state;

      const updatedBoard = {
        ...state.board,
        columns: state.board.columns.map(column => ({
          ...column,
          cards: column.cards.map(card =>
            card.id === action.payload.id
              ? { ...card, ...action.payload, updatedAt: new Date() }
              : card
          ),
        })),
      };

      return { ...state, board: updatedBoard };
    }

    case 'DELETE_CARD': {
      if (!state.board) return state;

      const updatedBoard = {
        ...state.board,
        columns: state.board.columns.map(column => ({
          ...column,
          cards: column.cards.filter(card => card.id !== action.payload),
        })),
      };

      return { ...state, board: updatedBoard };
    }

    case 'MOVE_CARD': {
      if (!state.board) return state;

      const { cardId, sourceColumnId, targetColumnId, newOrder } = action.payload;
      
      // Find the card to move
      let cardToMove: Card | null = null;
      const updatedColumns = state.board.columns.map(column => {
        if (column.id === sourceColumnId) {
          const card = column.cards.find(c => c.id === cardId);
          if (card) {
            cardToMove = { ...card, columnId: targetColumnId, order: newOrder };
            return { ...column, cards: column.cards.filter(c => c.id !== cardId) };
          }
        }
        return column;
      });

      if (!cardToMove) return state;

      // Add card to target column
      const finalColumns = updatedColumns.map(column => {
        if (column.id === targetColumnId) {
          const newCards = [...column.cards, cardToMove!];
          // Reorder cards
          newCards.sort((a, b) => a.order - b.order);
          return { ...column, cards: newCards };
        }
        return column;
      });

      return { ...state, board: { ...state.board, columns: finalColumns } };
    }

    case 'ADD_COLUMN': {
      if (!state.board) return state;

      const newColumn: Column = {
        id: uuidv4(),
        title: action.payload.title,
        order: state.board.columns.length,
        cards: [],
      };

      return {
        ...state,
        board: {
          ...state.board,
          columns: [...state.board.columns, newColumn],
        },
      };
    }

    case 'UPDATE_COLUMN': {
      if (!state.board) return state;

      const updatedBoard = {
        ...state.board,
        columns: state.board.columns.map(column =>
          column.id === action.payload.id
            ? { ...column, title: action.payload.title }
            : column
        ),
      };

      return { ...state, board: updatedBoard };
    }

    case 'DELETE_COLUMN': {
      if (!state.board) return state;

      const updatedBoard = {
        ...state.board,
        columns: state.board.columns.filter(column => column.id !== action.payload),
      };

      return { ...state, board: updatedBoard };
    }

    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };

    case 'ADD_CATEGORY': {
      if (!state.board) return state;
      const newCategory = {
        id: uuidv4(),
        name: action.payload.name,
        color: action.payload.color,
        createdAt: new Date(),
      };
      return {
        ...state,
        board: {
          ...state.board,
          categories: [...state.board.categories, newCategory],
        },
      };
    }

    case 'UPDATE_CATEGORY': {
      if (!state.board) return state;
      return {
        ...state,
        board: {
          ...state.board,
          categories: state.board.categories.map(category =>
            category.id === action.payload.id
              ? { ...category, name: action.payload.name, color: action.payload.color }
              : category
          ),
        },
      };
    }

    case 'DELETE_CATEGORY': {
      if (!state.board) return state;
      const categoryToDelete = action.payload.id;
      
      // Remove category from all cards
      const updatedColumns = state.board.columns.map(column => ({
        ...column,
        cards: column.cards.map(card =>
          card.categoryId === categoryToDelete
            ? { ...card, categoryId: undefined }
            : card
        ),
      }));

      return {
        ...state,
        board: {
          ...state.board,
          columns: updatedColumns,
          categories: state.board.categories.filter(category => category.id !== categoryToDelete),
        },
      };
    }

    default:
      return state;
  }
}

const BoardContext = createContext<{
  state: BoardState;
  dispatch: React.Dispatch<BoardAction>;
} | null>(null);

export const useBoardContext = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoardContext must be used within a BoardProvider');
  }
  return context;
};

export const BoardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(boardReducer, initialState);

  return (
    <BoardContext.Provider value={{ state, dispatch }}>
      {children}
    </BoardContext.Provider>
  );
};

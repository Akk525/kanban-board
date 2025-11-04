import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Board, BoardMetadata, Card, Column, User, CreateCardData, UpdateCardData } from '../types';

interface BoardState {
  boards: Board[];
  boardMetadata: BoardMetadata[];
  activeBoardId: string | null;
  users: User[];
  currentUser: User | null;
}

type BoardAction =
  | { type: 'SET_BOARDS'; payload: { boards: Board[]; metadata: BoardMetadata[] } }
  | { type: 'SET_ACTIVE_BOARD'; payload: string }
  | { type: 'CREATE_BOARD'; payload: { name: string; description: string; color: string } }
  | { type: 'UPDATE_BOARD_METADATA'; payload: { id: string; name: string; description: string; color: string } }
  | { type: 'DELETE_BOARD'; payload: string }
  | { type: 'ADD_CARD'; payload: CreateCardData }
  | { type: 'UPDATE_CARD'; payload: UpdateCardData }
  | { type: 'DELETE_CARD'; payload: string }
  | { type: 'ARCHIVE_CARD'; payload: string }
  | { type: 'RESTORE_CARD'; payload: string }
  | { type: 'MOVE_CARD'; payload: { cardId: string; sourceColumnId: string; targetColumnId: string; newOrder: number } }
  | { type: 'ADD_COLUMN'; payload: { title: string } }
  | { type: 'UPDATE_COLUMN'; payload: { id: string; title: string } }
  | { type: 'DELETE_COLUMN'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: { name: string; color: string } }
  | { type: 'UPDATE_CATEGORY'; payload: { id: string; name: string; color: string } }
  | { type: 'DELETE_CATEGORY'; payload: { id: string } }
  | { type: 'SET_CURRENT_USER'; payload: User };

const initialState: BoardState = {
  boards: [],
  boardMetadata: [],
  activeBoardId: null,
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
    case 'SET_BOARDS':
      return { 
        ...state, 
        boards: action.payload.boards,
        boardMetadata: action.payload.metadata,
        activeBoardId: state.activeBoardId || action.payload.metadata[0]?.id || null,
      };

    case 'SET_ACTIVE_BOARD': {
      // Save boards to localStorage before switching
      if (typeof window !== 'undefined') {
        localStorage.setItem('kanban_boards', JSON.stringify(state.boards));
        localStorage.setItem('kanban_board_metadata', JSON.stringify(state.boardMetadata));
        localStorage.setItem('kanban_active_board', action.payload);
      }
      return { ...state, activeBoardId: action.payload };
    }

    case 'CREATE_BOARD': {
      const newBoardId = uuidv4();
      const now = new Date();
      
      const newBoard: Board = {
        id: newBoardId,
        title: action.payload.name,
        description: action.payload.description,
        columns: [
          { id: uuidv4(), title: 'To Do', order: 0, cards: [] },
          { id: uuidv4(), title: 'In Progress', order: 1, cards: [] },
          { id: uuidv4(), title: 'Done', order: 2, cards: [] },
        ],
        members: state.users,
        categories: [],
        createdAt: now,
        updatedAt: now,
      };

      const newMetadata: BoardMetadata = {
        id: newBoardId,
        name: action.payload.name,
        description: action.payload.description,
        color: action.payload.color,
        createdAt: now,
        updatedAt: now,
      };

      const updatedBoards = [...state.boards, newBoard];
      const updatedMetadata = [...state.boardMetadata, newMetadata];

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('kanban_boards', JSON.stringify(updatedBoards));
        localStorage.setItem('kanban_board_metadata', JSON.stringify(updatedMetadata));
      }

      return {
        ...state,
        boards: updatedBoards,
        boardMetadata: updatedMetadata,
        activeBoardId: newBoardId,
      };
    }

    case 'UPDATE_BOARD_METADATA': {
      const updatedMetadata = state.boardMetadata.map(metadata =>
        metadata.id === action.payload.id
          ? {
              ...metadata,
              name: action.payload.name,
              description: action.payload.description,
              color: action.payload.color,
              updatedAt: new Date(),
            }
          : metadata
      );

      const updatedBoards = state.boards.map(board =>
        board.id === action.payload.id
          ? {
              ...board,
              title: action.payload.name,
              description: action.payload.description,
              updatedAt: new Date(),
            }
          : board
      );

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('kanban_boards', JSON.stringify(updatedBoards));
        localStorage.setItem('kanban_board_metadata', JSON.stringify(updatedMetadata));
      }

      return {
        ...state,
        boards: updatedBoards,
        boardMetadata: updatedMetadata,
      };
    }

    case 'DELETE_BOARD': {
      const updatedBoards = state.boards.filter(board => board.id !== action.payload);
      const updatedMetadata = state.boardMetadata.filter(metadata => metadata.id !== action.payload);
      
      let newActiveBoardId = state.activeBoardId;
      if (state.activeBoardId === action.payload) {
        newActiveBoardId = updatedMetadata[0]?.id || null;
      }

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('kanban_boards', JSON.stringify(updatedBoards));
        localStorage.setItem('kanban_board_metadata', JSON.stringify(updatedMetadata));
        if (newActiveBoardId) {
          localStorage.setItem('kanban_active_board', newActiveBoardId);
        }
      }

      return {
        ...state,
        boards: updatedBoards,
        boardMetadata: updatedMetadata,
        activeBoardId: newActiveBoardId,
      };
    }

    case 'ADD_CARD': {
      const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
      if (!activeBoard) return state;
      
      const newCard: Card = {
        id: uuidv4(),
        ...action.payload,
        createdAt: new Date(),
        updatedAt: new Date(),
        comments: [],
        order: activeBoard.columns.find(col => col.id === action.payload.columnId)?.cards.length || 0,
      };

      const updatedBoard = {
        ...activeBoard,
        columns: activeBoard.columns.map(column =>
          column.id === action.payload.columnId
            ? { ...column, cards: [...column.cards, newCard] }
            : column
        ),
      };

      const updatedBoards = state.boards.map(board =>
        board.id === state.activeBoardId ? updatedBoard : board
      );

      return { ...state, boards: updatedBoards };
    }

    case 'UPDATE_CARD': {
      const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
      if (!activeBoard) return state;

      const updatedBoard = {
        ...activeBoard,
        columns: activeBoard.columns.map(column => ({
          ...column,
          cards: column.cards.map(card =>
            card.id === action.payload.id
              ? { ...card, ...action.payload, updatedAt: new Date() }
              : card
          ),
        })),
      };

      const updatedBoards = state.boards.map(board =>
        board.id === state.activeBoardId ? updatedBoard : board
      );

      return { ...state, boards: updatedBoards };
    }

    case 'DELETE_CARD': {
      const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
      if (!activeBoard) return state;

      const updatedBoard = {
        ...activeBoard,
        columns: activeBoard.columns.map(column => ({
          ...column,
          cards: column.cards.filter(card => card.id !== action.payload),
        })),
      };

      const updatedBoards = state.boards.map(board =>
        board.id === state.activeBoardId ? updatedBoard : board
      );

      return { ...state, boards: updatedBoards };
    }

    case 'ARCHIVE_CARD': {
      const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
      if (!activeBoard) return state;

      const updatedBoard = {
        ...activeBoard,
        columns: activeBoard.columns.map(column => ({
          ...column,
          cards: column.cards.map(card =>
            card.id === action.payload
              ? { ...card, archived: true, archivedAt: new Date() }
              : card
          ),
        })),
      };

      const updatedBoards = state.boards.map(board =>
        board.id === state.activeBoardId ? updatedBoard : board
      );

      return { ...state, boards: updatedBoards };
    }

    case 'RESTORE_CARD': {
      const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
      if (!activeBoard) return state;

      const updatedBoard = {
        ...activeBoard,
        columns: activeBoard.columns.map(column => ({
          ...column,
          cards: column.cards.map(card =>
            card.id === action.payload
              ? { ...card, archived: false, archivedAt: undefined }
              : card
          ),
        })),
      };

      const updatedBoards = state.boards.map(board =>
        board.id === state.activeBoardId ? updatedBoard : board
      );

      return { ...state, boards: updatedBoards };
    }

    case 'MOVE_CARD': {
      const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
      if (!activeBoard) return state;

      const { cardId, sourceColumnId, targetColumnId, newOrder } = action.payload;
      
      // Find the card to move
      let cardToMove: Card | null = null;
      const updatedColumns = activeBoard.columns.map(column => {
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

      const updatedBoard = { ...activeBoard, columns: finalColumns };
      const updatedBoards = state.boards.map(board =>
        board.id === state.activeBoardId ? updatedBoard : board
      );

      return { ...state, boards: updatedBoards };
    }

    case 'ADD_COLUMN': {
      const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
      if (!activeBoard) return state;

      const newColumn: Column = {
        id: uuidv4(),
        title: action.payload.title,
        order: activeBoard.columns.length,
        cards: [],
      };

      const updatedBoard = {
        ...activeBoard,
        columns: [...activeBoard.columns, newColumn],
      };

      const updatedBoards = state.boards.map(board =>
        board.id === state.activeBoardId ? updatedBoard : board
      );

      return { ...state, boards: updatedBoards };
    }

    case 'UPDATE_COLUMN': {
      const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
      if (!activeBoard) return state;

      const updatedBoard = {
        ...activeBoard,
        columns: activeBoard.columns.map(column =>
          column.id === action.payload.id
            ? { ...column, title: action.payload.title }
            : column
        ),
      };

      const updatedBoards = state.boards.map(board =>
        board.id === state.activeBoardId ? updatedBoard : board
      );

      return { ...state, boards: updatedBoards };
    }

    case 'DELETE_COLUMN': {
      const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
      if (!activeBoard) return state;

      const updatedBoard = {
        ...activeBoard,
        columns: activeBoard.columns.filter(column => column.id !== action.payload),
      };

      const updatedBoards = state.boards.map(board =>
        board.id === state.activeBoardId ? updatedBoard : board
      );

      return { ...state, boards: updatedBoards };
    }

    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };

    case 'ADD_CATEGORY': {
      const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
      if (!activeBoard) return state;

      const newCategory = {
        id: uuidv4(),
        name: action.payload.name,
        color: action.payload.color,
        createdAt: new Date(),
      };

      const updatedBoard = {
        ...activeBoard,
        categories: [...activeBoard.categories, newCategory],
      };

      const updatedBoards = state.boards.map(board =>
        board.id === state.activeBoardId ? updatedBoard : board
      );

      return { ...state, boards: updatedBoards };
    }

    case 'UPDATE_CATEGORY': {
      const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
      if (!activeBoard) return state;

      const updatedBoard = {
        ...activeBoard,
        categories: activeBoard.categories.map(category =>
          category.id === action.payload.id
            ? { ...category, name: action.payload.name, color: action.payload.color }
            : category
        ),
      };

      const updatedBoards = state.boards.map(board =>
        board.id === state.activeBoardId ? updatedBoard : board
      );

      return { ...state, boards: updatedBoards };
    }

    case 'DELETE_CATEGORY': {
      const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
      if (!activeBoard) return state;

      const categoryToDelete = action.payload.id;
      
      // Remove category from all cards
      const updatedColumns = activeBoard.columns.map(column => ({
        ...column,
        cards: column.cards.map(card =>
          card.categoryId === categoryToDelete
            ? { ...card, categoryId: undefined }
            : card
        ),
      }));

      const updatedBoard = {
        ...activeBoard,
        columns: updatedColumns,
        categories: activeBoard.categories.filter(category => category.id !== categoryToDelete),
      };

      const updatedBoards = state.boards.map(board =>
        board.id === state.activeBoardId ? updatedBoard : board
      );

      return { ...state, boards: updatedBoards };
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

  // Load boards from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBoards = localStorage.getItem('kanban_boards');
      const savedMetadata = localStorage.getItem('kanban_board_metadata');
      const savedActiveBoardId = localStorage.getItem('kanban_active_board');

      if (savedBoards && savedMetadata) {
        try {
          const boards = JSON.parse(savedBoards);
          const metadata = JSON.parse(savedMetadata);
          
          // Only load if we have valid data
          if (boards.length > 0 && metadata.length > 0) {
            dispatch({
              type: 'SET_BOARDS',
              payload: { boards, metadata },
            });

            if (savedActiveBoardId && boards.find((b: any) => b.id === savedActiveBoardId)) {
              dispatch({
                type: 'SET_ACTIVE_BOARD',
                payload: savedActiveBoardId,
              });
            }
          }
        } catch (error) {
          console.error('Failed to load boards from localStorage:', error);
        }
      }
    }
  }, []);

  // Save boards to localStorage whenever they change
  useEffect(() => {
    if (state.boards.length > 0 && typeof window !== 'undefined') {
      localStorage.setItem('kanban_boards', JSON.stringify(state.boards));
      localStorage.setItem('kanban_board_metadata', JSON.stringify(state.boardMetadata));
      if (state.activeBoardId) {
        localStorage.setItem('kanban_active_board', state.activeBoardId);
      }
    }
  }, [state.boards, state.boardMetadata, state.activeBoardId]);

  return (
    <BoardContext.Provider value={{ state, dispatch }}>
      {children}
    </BoardContext.Provider>
  );
};

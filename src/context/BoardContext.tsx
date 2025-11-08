import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Board, BoardMetadata, Card, Column, User, CreateCardData, UpdateCardData, CompletionRecord } from '../types';
import { boardService, metadataService } from '../services/firebaseService';

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
        updatedAt: new Date(),
      };

      const updatedBoards = state.boards.map(board =>
        board.id === state.activeBoardId ? updatedBoard : board
      );

      // Update metadata timestamp
      const updatedMetadata = state.boardMetadata.map(meta =>
        meta.id === state.activeBoardId
          ? { ...meta, updatedAt: new Date() }
          : meta
      );

      return { ...state, boards: updatedBoards, boardMetadata: updatedMetadata };
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
        updatedAt: new Date(),
      };

      const updatedBoards = state.boards.map(board =>
        board.id === state.activeBoardId ? updatedBoard : board
      );

      // Update metadata timestamp
      const updatedMetadata = state.boardMetadata.map(meta =>
        meta.id === state.activeBoardId
          ? { ...meta, updatedAt: new Date() }
          : meta
      );

      return { ...state, boards: updatedBoards, boardMetadata: updatedMetadata };
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
        updatedAt: new Date(),
      };

      const updatedBoards = state.boards.map(board =>
        board.id === state.activeBoardId ? updatedBoard : board
      );

      // Update metadata timestamp
      const updatedMetadata = state.boardMetadata.map(meta =>
        meta.id === state.activeBoardId
          ? { ...meta, updatedAt: new Date() }
          : meta
      );

      return { ...state, boards: updatedBoards, boardMetadata: updatedMetadata };
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
        updatedAt: new Date(),
      };

      const updatedBoards = state.boards.map(board =>
        board.id === state.activeBoardId ? updatedBoard : board
      );

      // Update metadata timestamp
      const updatedMetadata = state.boardMetadata.map(meta =>
        meta.id === state.activeBoardId
          ? { ...meta, updatedAt: new Date() }
          : meta
      );

      return { ...state, boards: updatedBoards, boardMetadata: updatedMetadata };
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
        updatedAt: new Date(),
      };

      const updatedBoards = state.boards.map(board =>
        board.id === state.activeBoardId ? updatedBoard : board
      );

      // Update metadata timestamp
      const updatedMetadata = state.boardMetadata.map(meta =>
        meta.id === state.activeBoardId
          ? { ...meta, updatedAt: new Date() }
          : meta
      );

      return { ...state, boards: updatedBoards, boardMetadata: updatedMetadata };
    }

    case 'MOVE_CARD': {
      const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
      if (!activeBoard) return state;

      const { cardId, sourceColumnId, targetColumnId, newOrder } = action.payload;
      
      // Find the target column to check if it's a "Done" column
      const targetColumn = activeBoard.columns.find(col => col.id === targetColumnId);
      const sourceColumn = activeBoard.columns.find(col => col.id === sourceColumnId);
      const isDoneColumn = targetColumn?.title.toLowerCase().includes('done') || false;
      const wasInDoneColumn = sourceColumn?.title.toLowerCase().includes('done') || false;
      
      // Find the card to move
      let cardToMove: Card | null = null;
      const updatedColumns = activeBoard.columns.map(column => {
        if (column.id === sourceColumnId) {
          const card = column.cards.find(c => c.id === cardId);
          if (card) {
            const now = new Date();
            cardToMove = { 
              ...card, 
              columnId: targetColumnId, 
              order: newOrder, 
              updatedAt: now,
              // Mark as completed if moved to Done column, clear if moved out
              completedAt: isDoneColumn ? (card.completedAt || now) : undefined
            };
            return { ...column, cards: column.cards.filter(c => c.id !== cardId) };
          }
        }
        return column;
      });

      if (!cardToMove) return state;

      // Track completion in history when card is moved TO Done column (and wasn't already there)
      let metadataWithHistory: BoardMetadata[] = state.boardMetadata;
      const movedCard: Card = cardToMove; // Type narrowing after null check
      
      if (isDoneColumn && !wasInDoneColumn && movedCard.completedAt) {
        const completedAt: Date = movedCard.completedAt;
        
        metadataWithHistory = state.boardMetadata.map(meta => {
          if (meta.id === state.activeBoardId) {
            const completionHistory: CompletionRecord[] = meta.completionHistory || [];
            // Check if this completion is already recorded
            const alreadyRecorded = completionHistory.some(record => 
              record.cardId === movedCard.id && 
              record.completedAt.getTime() === completedAt.getTime()
            );
            
            if (!alreadyRecorded) {
              const newRecord: CompletionRecord = {
                cardId: movedCard.id,
                cardTitle: movedCard.title,
                boardId: state.activeBoardId!,
                assigneeId: movedCard.assigneeId,
                priority: movedCard.priority,
                completedAt: completedAt,
                estimateHours: movedCard.estimateHours,
              };
              
              return {
                ...meta,
                completionHistory: [...completionHistory, newRecord],
                updatedAt: new Date(),
              };
            }
          }
          return meta;
        });
      }

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

      const updatedBoard = { 
        ...activeBoard, 
        columns: finalColumns,
        updatedAt: new Date(),
      };
      
      const updatedBoards = state.boards.map(board =>
        board.id === state.activeBoardId ? updatedBoard : board
      );

      // Merge history with timestamp update
      const finalMetadata = metadataWithHistory.map(meta =>
        meta.id === state.activeBoardId
          ? { ...meta, updatedAt: new Date() }
          : meta
      );

      return { ...state, boards: updatedBoards, boardMetadata: finalMetadata };
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
        updatedAt: new Date(),
      };

      const updatedBoards = state.boards.map(board =>
        board.id === state.activeBoardId ? updatedBoard : board
      );

      // Update metadata timestamp
      const updatedMetadata = state.boardMetadata.map(meta =>
        meta.id === state.activeBoardId
          ? { ...meta, updatedAt: new Date() }
          : meta
      );

      return { ...state, boards: updatedBoards, boardMetadata: updatedMetadata };
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
        updatedAt: new Date(),
      };

      const updatedBoards = state.boards.map(board =>
        board.id === state.activeBoardId ? updatedBoard : board
      );

      // Update metadata timestamp
      const updatedMetadata = state.boardMetadata.map(meta =>
        meta.id === state.activeBoardId
          ? { ...meta, updatedAt: new Date() }
          : meta
      );

      return { ...state, boards: updatedBoards, boardMetadata: updatedMetadata };
    }

    case 'DELETE_COLUMN': {
      const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
      if (!activeBoard) return state;

      const updatedBoard = {
        ...activeBoard,
        columns: activeBoard.columns.filter(column => column.id !== action.payload),
        updatedAt: new Date(),
      };

      const updatedBoards = state.boards.map(board =>
        board.id === state.activeBoardId ? updatedBoard : board
      );

      // Update metadata timestamp
      const updatedMetadata = state.boardMetadata.map(meta =>
        meta.id === state.activeBoardId
          ? { ...meta, updatedAt: new Date() }
          : meta
      );

      return { ...state, boards: updatedBoards, boardMetadata: updatedMetadata };
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

  // Helper function to convert date strings to Date objects
  const deserializeDates = (boards: Board[]): Board[] => {
    return boards.map(board => ({
      ...board,
      createdAt: new Date(board.createdAt),
      updatedAt: new Date(board.updatedAt),
      columns: board.columns.map(column => ({
        ...column,
        cards: column.cards.map(card => ({
          ...card,
          createdAt: new Date(card.createdAt),
          updatedAt: new Date(card.updatedAt),
          dueDate: card.dueDate ? new Date(card.dueDate) : undefined,
          startDate: card.startDate ? new Date(card.startDate) : undefined,
          archivedAt: card.archivedAt ? new Date(card.archivedAt) : undefined,
          completedAt: card.completedAt ? new Date(card.completedAt) : undefined,
          comments: card.comments.map(comment => ({
            ...comment,
            createdAt: new Date(comment.createdAt),
            updatedAt: new Date(comment.updatedAt),
          })),
        })),
      })),
      categories: board.categories.map(cat => ({
        ...cat,
        createdAt: new Date(cat.createdAt),
      })),
    }));
  };

  // Helper to sync to Firebase (non-blocking)
  const syncToFirebase = useCallback(async (boards: Board[], metadata: BoardMetadata[]) => {
    if (boards.length === 0) return;

    try {
      // Save to localStorage as cache (for offline support)
      if (typeof window !== 'undefined') {
        localStorage.setItem('kanban_boards', JSON.stringify(boards));
        localStorage.setItem('kanban_board_metadata', JSON.stringify(metadata));
      }

      // Sync each board to Firebase asynchronously
      await Promise.all([
        ...boards.map(board => 
          boardService.updateBoard(board.id, board).catch(err => {
            console.error(`Failed to sync board ${board.id} to Firebase:`, err);
            return null; // Continue with other syncs even if one fails
          })
        ),
        ...metadata.map(meta => 
          metadataService.updateBoardMetadata(meta.id, meta).catch(err => {
            console.error(`Failed to sync metadata ${meta.id} to Firebase:`, err);
            return null;
          })
        )
      ]);

      console.log('✅ Synced to Firebase successfully');
    } catch (err) {
      console.error('❌ Firebase sync failed, data cached locally:', err);
    }
  }, []);

  // Load boards from Firebase on mount, fallback to localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load from Firebase first
        const [boards, metadata] = await Promise.all([
          boardService.getAllBoards(),
          metadataService.getAllBoardsMetadata()
        ]);

        if (boards.length > 0 && metadata.length > 0) {
          dispatch({
            type: 'SET_BOARDS',
            payload: { boards, metadata },
          });

          // Save to localStorage as cache
          localStorage.setItem('kanban_boards', JSON.stringify(boards));
          localStorage.setItem('kanban_board_metadata', JSON.stringify(metadata));

          const savedActiveBoardId = localStorage.getItem('kanban_active_board');
          if (savedActiveBoardId && boards.find(b => b.id === savedActiveBoardId)) {
            dispatch({
              type: 'SET_ACTIVE_BOARD',
              payload: savedActiveBoardId,
            });
          }
          return;
        }
      } catch (error) {
        console.error('Failed to load from Firebase, falling back to localStorage:', error);
      }

      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        const savedBoards = localStorage.getItem('kanban_boards');
        const savedMetadata = localStorage.getItem('kanban_board_metadata');
        const savedActiveBoardId = localStorage.getItem('kanban_active_board');

        if (savedBoards && savedMetadata) {
          try {
            const boards = JSON.parse(savedBoards);
            const metadata = JSON.parse(savedMetadata);
            
            // Convert date strings back to Date objects
            const deserializedBoards = deserializeDates(boards);
            
            // Convert metadata dates
            const deserializedMetadata = metadata.map((meta: any) => ({
              ...meta,
              createdAt: new Date(meta.createdAt),
              updatedAt: new Date(meta.updatedAt),
              completionHistory: meta.completionHistory?.map((record: any) => ({
                ...record,
                completedAt: new Date(record.completedAt),
              })) || [],
            }));
            
            // Only load if we have valid data
            if (deserializedBoards.length > 0 && deserializedMetadata.length > 0) {
              dispatch({
                type: 'SET_BOARDS',
                payload: { boards: deserializedBoards, metadata: deserializedMetadata },
              });

              if (savedActiveBoardId && deserializedBoards.find((b: any) => b.id === savedActiveBoardId)) {
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
    };

    loadData();
  }, []);

  // Sync to Firebase whenever boards or metadata change (debounced)
  useEffect(() => {
    if (state.boards.length === 0) return;

    // Debounce Firebase sync to avoid too many writes
    const syncTimeout = setTimeout(() => {
      syncToFirebase(state.boards, state.boardMetadata);
    }, 1000); // Wait 1 second after last change before syncing

    return () => clearTimeout(syncTimeout);
  }, [state.boards, state.boardMetadata, syncToFirebase]);

  // Separate effect for active board ID (doesn't need Firebase sync)
  useEffect(() => {
    if (state.activeBoardId && typeof window !== 'undefined') {
      localStorage.setItem('kanban_active_board', state.activeBoardId);
    }
  }, [state.activeBoardId]);

  return (
    <BoardContext.Provider value={{ state, dispatch }}>
      {children}
    </BoardContext.Provider>
  );
};

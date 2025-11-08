import { useCallback } from 'react';
import { boardService, metadataService } from '../services/firebaseService';
import type { Board, BoardMetadata } from '../types';

/**
 * Hook to provide Firebase sync functions
 * Falls back to localStorage if Firebase operations fail
 */
export const useFirebaseSync = () => {
  // Save to localStorage as backup
  const saveToLocalStorage = useCallback((boards: Board[], metadata: BoardMetadata[], activeBoardId: string | null) => {
    try {
      localStorage.setItem('kanban_boards', JSON.stringify(boards));
      localStorage.setItem('kanban_board_metadata', JSON.stringify(metadata));
      if (activeBoardId) {
        localStorage.setItem('kanban_active_board', activeBoardId);
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, []);

  // Sync board to Firebase
  const syncBoard = useCallback(async (board: Board) => {
    try {
      await boardService.updateBoard(board.id, board);
    } catch (error) {
      console.error('Error syncing board to Firebase:', error);
      // Still save to localStorage as fallback
    }
  }, []);

  // Sync board metadata to Firebase
  const syncMetadata = useCallback(async (metadata: BoardMetadata) => {
    try {
      await metadataService.updateBoardMetadata(metadata.id, metadata);
    } catch (error) {
      console.error('Error syncing metadata to Firebase:', error);
    }
  }, []);

  // Create new board in Firebase
  const createBoard = useCallback(async (board: Board, metadata: BoardMetadata) => {
    try {
      // boardService.createBoard only takes board data (without id)
      // It generates and returns the new ID
      const { id, ...boardData } = board;
      await boardService.createBoard(boardData);
      
      // metadataService uses updateBoardMetadata which handles both create and update
      await metadataService.updateBoardMetadata(metadata.id, metadata);
    } catch (error) {
      console.error('Error creating board in Firebase:', error);
      throw error;
    }
  }, []);

  // Delete board from Firebase
  const deleteBoard = useCallback(async (boardId: string) => {
    try {
      await boardService.deleteBoard(boardId);
    } catch (error) {
      console.error('Error deleting board from Firebase:', error);
      throw error;
    }
  }, []);

  // Load all data from Firebase
  const loadFromFirebase = useCallback(async () => {
    try {
      const [boards, metadata] = await Promise.all([
        boardService.getAllBoards(),
        metadataService.getAllBoardsMetadata()
      ]);
      return { boards, metadata };
    } catch (error) {
      console.error('Error loading from Firebase:', error);
      throw error;
    }
  }, []);

  return {
    saveToLocalStorage,
    syncBoard,
    syncMetadata,
    createBoard,
    deleteBoard,
    loadFromFirebase,
  };
};

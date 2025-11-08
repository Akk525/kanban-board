import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc,
  setDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
  type DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Board, Card, User, BoardMetadata, Column } from '../types';

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  BOARDS: 'boards',
  BOARDS_METADATA: 'boards_metadata',
} as const;

// Helper: Remove undefined values from object
const removeUndefined = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const cleaned: any = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value !== undefined) {
      if (Array.isArray(value)) {
        cleaned[key] = value.map(item => 
          typeof item === 'object' && item !== null ? removeUndefined(item) : item
        );
      } else if (value instanceof Date) {
        cleaned[key] = value;
      } else if (typeof value === 'object' && value !== null) {
        cleaned[key] = removeUndefined(value);
      } else {
        cleaned[key] = value;
      }
    }
  });
  return cleaned;
};

// Helper: Convert Firestore timestamp to Date (with validation)
const timestampToDate = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  
  try {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      const date = new Date(timestamp);
      // Check if date is valid
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  } catch (error) {
    console.warn('Failed to convert timestamp:', timestamp, error);
  }
  
  // Return current date as fallback for invalid dates
  return new Date();
};

// Helper: Convert dates to Firestore timestamps (with validation)
const convertDatesToTimestamps = (data: any): any => {
  if (!data) return data;
  
  const converted = { ...data };
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Date) {
      // Validate date before converting
      if (!isNaN(converted[key].getTime())) {
        converted[key] = Timestamp.fromDate(converted[key]);
      } else {
        console.warn(`Invalid date found for key ${key}, using current date`);
        converted[key] = Timestamp.fromDate(new Date());
      }
    } else if (Array.isArray(converted[key])) {
      converted[key] = converted[key].map((item: any) => 
        typeof item === 'object' && item !== null ? convertDatesToTimestamps(item) : item
      );
    } else if (typeof converted[key] === 'object' && converted[key] !== null) {
      converted[key] = convertDatesToTimestamps(converted[key]);
    }
  });
  return converted;
};

// Helper: Safely convert optional date field
const toOptionalDate = (timestamp: any): Date | undefined => {
  if (!timestamp) return undefined;
  try {
    const date = timestampToDate(timestamp);
    return isNaN(date.getTime()) ? undefined : date;
  } catch {
    return undefined;
  }
};

// Helper: Convert Firestore board data to Board type
const convertFirestoreBoard = (id: string, data: DocumentData): Board => {
  return {
    id,
    title: data.title || 'Untitled',
    description: data.description,
    columns: (data.columns || []).map((col: any) => ({
      id: col.id || `col-${Math.random()}`,
      title: col.title || 'Untitled Column',
      order: col.order ?? 0,
      cards: (col.cards || []).map((card: any) => ({
        id: card.id || `card-${Math.random()}`,
        title: card.title || 'Untitled Card',
        description: card.description,
        assigneeId: card.assigneeId,
        priority: card.priority || 'medium',
        labels: card.labels || [],
        categoryId: card.categoryId,
        columnId: card.columnId || col.id,
        order: card.order ?? 0,
        archived: card.archived || false,
        comments: card.comments || [],
        createdAt: timestampToDate(card.createdAt),
        updatedAt: timestampToDate(card.updatedAt),
        dueDate: toOptionalDate(card.dueDate),
        startDate: toOptionalDate(card.startDate),
        completedAt: toOptionalDate(card.completedAt),
        archivedAt: toOptionalDate(card.archivedAt),
        estimateHours: card.estimateHours,
        dependencies: card.dependencies,
      })),
    })),
    members: data.members || [],
    categories: (data.categories || []).map((cat: any) => ({
      id: cat.id || `cat-${Math.random()}`,
      name: cat.name || 'Untitled Category',
      color: cat.color || '#3B82F6',
      createdAt: timestampToDate(cat.createdAt),
    })),
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
};

// User operations
export const userService = {
  async getUser(userId: string): Promise<User | null> {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  async createUser(userData: Omit<User, 'id'>): Promise<string> {
    try {
      const cleanData = removeUndefined(userData);
      const docRef = await addDoc(collection(db, COLLECTIONS.USERS), cleanData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, userId);
      const cleanData = removeUndefined(userData);
      await updateDoc(docRef, cleanData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  },
};

// Board operations
export const boardService = {
  async getBoard(boardId: string): Promise<Board | null> {
    try {
      const docRef = doc(db, COLLECTIONS.BOARDS, boardId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return convertFirestoreBoard(docSnap.id, docSnap.data());
      }
      return null;
    } catch (error) {
      console.error('Error getting board:', error);
      throw error;
    }
  },

  async getAllBoards(): Promise<Board[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.BOARDS));
      return querySnapshot.docs.map(doc => convertFirestoreBoard(doc.id, doc.data()));
    } catch (error) {
      console.error('Error getting all boards:', error);
      return [];
    }
  },

  async createBoard(boardData: Omit<Board, 'id'>): Promise<string> {
    try {
      const data = convertDatesToTimestamps({
        ...boardData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const cleanData = removeUndefined(data);
      const docRef = await addDoc(collection(db, COLLECTIONS.BOARDS), cleanData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating board:', error);
      throw error;
    }
  },

  async updateBoard(boardId: string, boardData: Partial<Board>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.BOARDS, boardId);
      
      // Check if document exists
      const docSnap = await getDoc(docRef);
      
      const data = convertDatesToTimestamps({
        ...boardData,
        updatedAt: new Date(),
      });
      const cleanData = removeUndefined(data);
      
      if (!docSnap.exists()) {
        // Document doesn't exist, create it with setDoc
        console.log(`Board ${boardId} doesn't exist, creating it...`);
        await setDoc(docRef, {
          ...cleanData,
          createdAt: Timestamp.fromDate(new Date()),
        });
      } else {
        // Document exists, update it
        await updateDoc(docRef, cleanData);
      }
    } catch (error) {
      console.error('Error updating board:', error);
      throw error;
    }
  },

  async deleteBoard(boardId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Delete board
      const boardRef = doc(db, COLLECTIONS.BOARDS, boardId);
      batch.delete(boardRef);
      
      // Delete metadata
      const metadataRef = doc(db, COLLECTIONS.BOARDS_METADATA, boardId);
      batch.delete(metadataRef);
      
      await batch.commit();
    } catch (error) {
      console.error('Error deleting board:', error);
      throw error;
    }
  },
};

// Board metadata operations
export const metadataService = {
  async getBoardMetadata(boardId: string): Promise<BoardMetadata | null> {
    try {
      const docRef = doc(db, COLLECTIONS.BOARDS_METADATA, boardId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || '',
          description: data.description,
          color: data.color || '#3B82F6',
          createdAt: timestampToDate(data.createdAt),
          updatedAt: timestampToDate(data.updatedAt),
          completionHistory: (data.completionHistory || []).map((record: any) => ({
            cardId: record.cardId,
            cardTitle: record.cardTitle,
            boardId: record.boardId,
            assigneeId: record.assigneeId,
            priority: record.priority,
            estimateHours: record.estimateHours,
            completedAt: timestampToDate(record.completedAt),
          })),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting board metadata:', error);
      throw error;
    }
  },

  async getAllBoardsMetadata(): Promise<BoardMetadata[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.BOARDS_METADATA));
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          description: data.description,
          color: data.color || '#3B82F6',
          createdAt: timestampToDate(data.createdAt),
          updatedAt: timestampToDate(data.updatedAt),
          completionHistory: (data.completionHistory || []).map((record: any) => ({
            cardId: record.cardId,
            cardTitle: record.cardTitle,
            boardId: record.boardId,
            assigneeId: record.assigneeId,
            priority: record.priority,
            estimateHours: record.estimateHours,
            completedAt: timestampToDate(record.completedAt),
          })),
        };
      });
    } catch (error) {
      console.error('Error getting all boards metadata:', error);
      return [];
    }
  },

  async updateBoardMetadata(
    boardId: string, 
    metadata: Partial<BoardMetadata>
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.BOARDS_METADATA, boardId);
      
      // Check if document exists
      const docSnap = await getDoc(docRef);
      
      const data = convertDatesToTimestamps({
        ...metadata,
        updatedAt: new Date(),
      });
      const cleanData = removeUndefined(data);
      
      if (!docSnap.exists()) {
        // Document doesn't exist, create it with setDoc
        console.log(`Metadata ${boardId} doesn't exist, creating it...`);
        await setDoc(docRef, {
          ...cleanData,
          name: metadata.name || '',
          color: metadata.color || '#3B82F6',
          createdAt: Timestamp.fromDate(new Date()),
        });
      } else {
        // Document exists, update it
        await updateDoc(docRef, cleanData);
      }
    } catch (error) {
      console.error('Error updating board metadata:', error);
      throw error;
    }
  },
};

// Sync all data to Firebase
export const syncToFirebase = async (
  boards: Board[],
  metadata: BoardMetadata[]
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // Sync boards
    boards.forEach(board => {
      const boardRef = doc(db, COLLECTIONS.BOARDS, board.id);
      const boardData = convertDatesToTimestamps(board);
      batch.set(boardRef, boardData);
    });
    
    // Sync metadata
    metadata.forEach(meta => {
      const metaRef = doc(db, COLLECTIONS.BOARDS_METADATA, meta.id);
      const metaData = convertDatesToTimestamps(meta);
      batch.set(metaRef, metaData);
    });
    
    await batch.commit();
    console.log('Successfully synced all data to Firebase');
  } catch (error) {
    console.error('Error syncing to Firebase:', error);
    throw error;
  }
};

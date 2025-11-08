export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member' | 'viewer';
}

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  assigneeId?: string;
  priority: Priority;
  labels: string[];
  categoryId?: string;
  startDate?: Date;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  comments: Comment[];
  columnId: string;
  order: number;
  archived?: boolean;
  archivedAt?: Date;
  completedAt?: Date;
  estimateHours?: number;
  dependencies?: string[];
}

export interface Column {
  id: string;
  title: string;
  order: number;
  cards: Card[];
}

export interface CompletionRecord {
  cardId: string;
  cardTitle: string;
  boardId: string;
  assigneeId?: string;
  priority?: Priority;
  completedAt: Date;
  estimateHours?: number;
}

export interface BoardMetadata {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  completionHistory?: CompletionRecord[];
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  columns: Column[];
  members: User[];
  categories: Category[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCardData {
  title: string;
  description?: string;
  assigneeId?: string;
  priority: Priority;
  labels: string[];
  categoryId?: string;
  startDate?: Date;
  dueDate?: Date;
  columnId: string;
  estimateHours?: number;
}

export interface UpdateCardData extends Partial<CreateCardData> {
  id: string;
  comments?: Comment[];
}

export interface DragEndEvent {
  active: {
    id: string;
  };
  over: {
    id: string;
  } | null;
}

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
  priority: 'low' | 'medium' | 'high' | 'urgent';
  labels: string[];
  categoryId?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  comments: Comment[];
  columnId: string;
  order: number;
  archived?: boolean;
  archivedAt?: Date;
  completedAt?: Date;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  cards: Card[];
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
  priority: Card['priority'];
  labels: string[];
  categoryId?: string;
  dueDate?: Date;
  columnId: string;
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

export interface UserSettings {
  profile: {
    name: string;
    email: string;
    profilePicture: string;
  };
  notifications: {
    emailAlerts: boolean;
    pushNotifications: boolean;
  };
  appearance: {
    theme: 'light' | 'dark';
    layout: 'grid' | 'list';
  };
  account: {
    password: string;
    accountStatus: 'active' | 'suspended' | 'deleted';
  };
}

export interface Board {
  id: string;
  title: string;
  description: string;
  columns: Column[];
  members: User[];
  categories: Category[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  cards: Card[];
}

export interface Card {
  id: string;
  title: string;
  description: string;
  columnId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  startDate?: Date;
  archivedAt?: Date;
  completedAt?: Date;
  comments: Comment[];
  categoryId?: string;
  assigneeId?: string;
  priority?: string;
  estimateHours?: number;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface BoardMetadata {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  completionHistory?: CompletionRecord[];
}

export interface CompletionRecord {
  cardId: string;
  cardTitle: string;
  boardId: string;
  assigneeId?: string;
  priority?: string;
  completedAt: Date;
  estimateHours?: number;
}
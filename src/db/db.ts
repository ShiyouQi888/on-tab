import Dexie, { type Table } from 'dexie';

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  icon?: string;
  categoryId?: string;
  tags: string[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
  deleted: number; // 0 for active, 1 for deleted
  syncStatus: 'synced' | 'pending' | 'error';
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  order: number;
  createdAt: number;
  updatedAt: number;
  deleted: number;
}

export interface SyncQueue {
  id?: number;
  action: 'create' | 'update' | 'delete';
  entityType: 'bookmark' | 'category';
  entityId: string;
  data: any;
  timestamp: number;
}

export class AppDatabase extends Dexie {
  bookmarks!: Table<Bookmark>;
  categories!: Table<Category>;
  syncQueue!: Table<SyncQueue>;

  constructor() {
    super('BookmarkNavDB');
    this.version(3).stores({
      bookmarks: 'id, title, url, categoryId, *tags, updatedAt, deleted',
      categories: 'id, name, order, updatedAt, deleted',
      syncQueue: '++id, entityId, timestamp'
    });
  }
}

export const db = new AppDatabase();

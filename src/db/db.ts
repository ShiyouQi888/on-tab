import Dexie, { type Table } from 'dexie';

export interface Bookmark {
  id: string;
  userId: string; // 添加用户ID字段
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
  userId: string; // 添加用户ID字段
  name: string;
  icon?: string;
  order: number;
  createdAt: number;
  updatedAt: number;
  deleted: number;
  syncStatus: 'synced' | 'pending' | 'error';
}

export interface SyncQueue {
  id?: number;
  userId: string; // 添加用户ID字段
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
    this.version(4).stores({
      bookmarks: 'id, userId, title, url, categoryId, *tags, updatedAt, deleted',
      categories: 'id, userId, name, order, updatedAt, deleted',
      syncQueue: '++id, userId, entityId, timestamp'
    });
  }
}

export const db = new AppDatabase();

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncService } from '../services/syncService';
import { db } from '../db/db';
import { supabase } from '../services/supabase';
import { authService } from '../services/authService';

vi.mock('../db/db', () => ({
  db: {
    bookmarks: {
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
      toArray: vi.fn(),
      update: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
    },
    categories: {
      toArray: vi.fn(),
    },
  },
}));

vi.mock('../services/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
  },
}));

vi.mock('../services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn(),
  },
}));

describe('syncService', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sync', () => {
    it('should return 0 if no user is logged in', async () => {
      (authService.getCurrentUser as any).mockResolvedValue(null);
      const result = await syncService.sync();
      expect(result).toBe(0);
    });

    it('should perform push and pull when user is logged in', async () => {
      (authService.getCurrentUser as any).mockResolvedValue(mockUser);
      
      // Mock pushLocalChanges
      (db.bookmarks.where as any)().equals().toArray.mockResolvedValue([]);
      (db.categories.toArray as any).mockResolvedValue([]);

      // Mock pullRemoteChanges
      (supabase.from as any)().select().eq.mockResolvedValue({ data: [], error: null });

      const result = await syncService.sync();
      expect(result).toBe(0);
      expect(authService.getCurrentUser).toHaveBeenCalled();
    });
  });

  describe('pushLocalChanges', () => {
    it('should push pending bookmarks to supabase', async () => {
      const pendingBookmark = { 
        id: '1', 
        title: 'Test', 
        url: 'https://test.com', 
        syncStatus: 'pending',
        updatedAt: 100 
      };
      
      (db.bookmarks.where as any)().equals().toArray.mockResolvedValue([pendingBookmark]);
      (supabase.from as any)().upsert.mockResolvedValue({ error: null });

      await syncService.pushLocalChanges(mockUser.id);

      expect(supabase.from).toHaveBeenCalledWith('bookmarks');
      expect((supabase as any).upsert).toHaveBeenCalledWith(expect.objectContaining({
        id: '1',
        user_id: mockUser.id
      }));
      expect(db.bookmarks.update).toHaveBeenCalledWith('1', { syncStatus: 'synced' });
    });
  });

  describe('pullRemoteChanges', () => {
    it('should update local db with newer remote bookmarks', async () => {
      const remoteBookmark = { 
        id: '1', 
        title: 'Remote Title', 
        url: 'https://test.com', 
        updatedAt: 200 
      };
      const localBookmark = { 
        id: '1', 
        title: 'Local Title', 
        url: 'https://test.com', 
        updatedAt: 100 
      };

      (supabase.from as any)().select().eq.mockResolvedValue({ 
        data: [remoteBookmark], 
        error: null 
      });
      (db.bookmarks.get as any).mockResolvedValue(localBookmark);

      const pulledCount = await syncService.pullRemoteChanges(mockUser.id);

      expect(pulledCount).toBe(1);
      expect(db.bookmarks.put).toHaveBeenCalledWith(expect.objectContaining({
        id: '1',
        title: 'Remote Title',
        syncStatus: 'synced'
      }));
    });
  });
});

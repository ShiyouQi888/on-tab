import { describe, it, expect, vi } from 'vitest';
import { bookmarkService } from '../services/bookmarkService';
import { db } from '../db/db';

vi.mock('../db/db', () => ({
  db: {
    bookmarks: {
      add: vi.fn(),
      update: vi.fn(),
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
      toArray: vi.fn().mockResolvedValue([]),
      filter: vi.fn().mockReturnThis(),
      reverse: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      count: vi.fn().mockResolvedValue(0),
    },
    categories: {
      add: vi.fn(),
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
      toArray: vi.fn().mockResolvedValue([]),
    }
  }
}));

describe('bookmarkService', () => {
  it('should add a bookmark with generated id and timestamps', async () => {
    const bookmarkData = {
      title: 'Test',
      url: 'https://test.com',
      tags: ['test'],
      notes: 'note'
    };

    await bookmarkService.addBookmark(bookmarkData);

    expect(db.bookmarks.add).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Test',
      url: 'https://test.com',
      deleted: 0,
      syncStatus: 'pending'
    }));
  });

  it('should soft delete a bookmark', async () => {
    const id = 'test-id';
    await bookmarkService.deleteBookmark(id);

    expect(db.bookmarks.update).toHaveBeenCalledWith(id, expect.objectContaining({
      deleted: 1,
      syncStatus: 'pending'
    }));
  });
});

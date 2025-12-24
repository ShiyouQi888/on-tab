import { describe, it, expect, vi, beforeEach } from 'vitest';
import { migrationService } from '../services/migrationService';
import { bookmarkService } from '../services/bookmarkService';

vi.mock('../services/bookmarkService', () => ({
  bookmarkService: {
    addBookmark: vi.fn(),
  },
}));

describe('migrationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock chrome global
    (globalThis as any).chrome = {
      bookmarks: {
        getTree: vi.fn(),
      },
    };
  });

  describe('importFromBrowser', () => {
    it('should process bookmark tree and call addBookmark', async () => {
      const mockTree = [
        {
          title: 'Root',
          children: [
            { title: 'Google', url: 'https://google.com' },
            { 
              title: 'Folder', 
              children: [
                { title: 'Vite', url: 'https://vitejs.dev' }
              ] 
            }
          ]
        }
      ];

      (chrome.bookmarks.getTree as any).mockImplementation((callback: any) => {
        callback(mockTree);
      });

      const count = await migrationService.importFromBrowser();

      expect(count).toBe(2);
      expect(bookmarkService.addBookmark).toHaveBeenCalledTimes(2);
      expect(bookmarkService.addBookmark).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Google',
        url: 'https://google.com'
      }));
    });

    it('should reject if chrome.bookmarks is not available', async () => {
      delete (globalThis as any).chrome;
      await expect(migrationService.importFromBrowser()).rejects.toThrow('Browser bookmarks API not available');
    });
  });

  describe('importFromJSON', () => {
    it('should parse JSON file and add bookmarks', async () => {
      const mockBookmarks = [
        { title: 'Imported 1', url: 'https://i1.com', tags: ['tag1'], notes: 'note1' },
        { title: 'Imported 2', url: 'https://i2.com' }
      ];
      const json = JSON.stringify(mockBookmarks);
      const file = new File([json], 'test.json', { type: 'application/json' });

      // Mock FileReader
      class MockReader {
        onload: any = null;
        readAsText(file: any) {
          setTimeout(() => {
            if (this.onload) {
              this.onload({ target: { result: json } });
            }
          }, 0);
        }
      }
      (globalThis as any).FileReader = MockReader;

      const count = await migrationService.importFromJSON(file);

      expect(count).toBe(2);
      expect(bookmarkService.addBookmark).toHaveBeenCalledTimes(2);
    });
  });
});

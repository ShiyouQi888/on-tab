import { db, type Bookmark, type Category } from '../db/db';
import { v4 as uuidv4 } from 'uuid';
import { authService } from './authService';

export const bookmarkService = {
  async addBookmark(bookmark: Omit<Bookmark, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'deleted' | 'syncStatus'>) {
    const userId = await authService.getEffectiveUserId();
    const id = uuidv4();
    const now = Date.now();
    const newBookmark: Bookmark = {
      ...bookmark,
      id,
      userId,
      createdAt: now,
      updatedAt: now,
      deleted: 0,
      syncStatus: 'pending'
    };
    await db.bookmarks.add(newBookmark);
    
    // 如果是已登录用户，立即触发后台同步
    if (userId !== 'local-user') {
      import('./syncService').then(({ syncService }) => syncService.sync());
    }

    return newBookmark;
  },

  async updateBookmark(id: string, updates: Partial<Bookmark>) {
    const userId = await authService.getEffectiveUserId();
    const now = Date.now();
    
    const bookmark = await db.bookmarks.get(id);
    if (bookmark && bookmark.userId === userId) {
      await db.bookmarks.update(id, {
        ...updates,
        updatedAt: now,
        syncStatus: 'pending'
      });

      if (userId !== 'local-user') {
        import('./syncService').then(({ syncService }) => syncService.sync());
      }
    }
  },

  async deleteBookmark(id: string) {
    const userId = await authService.getEffectiveUserId();
    const now = Date.now();
    
    const bookmark = await db.bookmarks.get(id);
    if (bookmark && bookmark.userId === userId) {
      // Soft delete for sync purposes
      await db.bookmarks.update(id, {
        deleted: 1,
        updatedAt: now,
        syncStatus: 'pending'
      });

      if (userId !== 'local-user') {
        import('./syncService').then(({ syncService }) => syncService.sync());
      }
    }
  },

  async getBookmarks(options: { 
    categoryId?: string, 
    tag?: string, 
    query?: string,
    offset?: number,
    limit?: number 
  } = {}) {
    const userId = await authService.getEffectiveUserId();
    let collection = db.bookmarks.where('userId').equals(userId).and(b => b.deleted === 0);

    if (options.categoryId) {
      collection = collection.filter(b => b.categoryId === options.categoryId);
    }

    if (options.tag) {
      collection = collection.filter(b => b.tags.includes(options.tag!));
    }

    if (options.query) {
      const q = options.query.toLowerCase();
      collection = collection.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.url.toLowerCase().includes(q) || 
        (b.notes || '').toLowerCase().includes(q)
      );
    }

    const total = await collection.count();
    const items = await collection
      .reverse()
      .offset(options.offset || 0)
      .limit(options.limit || 50)
      .toArray();

    return { items, total };
  },

  async getAllCategories() {
    try {
      const userId = await authService.getEffectiveUserId();
      const categories = await db.categories
        .where('userId').equals(userId)
        .and(c => c.deleted === 0)
        .sortBy('order');
      
      // Check if any category has order undefined and fix it
      const needsFix = categories.some(c => c.order === undefined);
      if (needsFix) {
        await db.transaction('rw', db.categories, async () => {
          for (let i = 0; i < categories.length; i++) {
            if (categories[i].order === undefined) {
              await db.categories.update(categories[i].id, { order: i });
              categories[i].order = i;
            }
          }
        });
        return categories.sort((a, b) => a.order - b.order);
      }
      
      return categories;
    } catch (error) {
      console.error('Dexie error in getAllCategories:', error);
      return [];
    }
  },

  async addCategory(name: string, icon?: string) {
    const userId = await authService.getEffectiveUserId();
    const id = uuidv4();
    const now = Date.now();
    // Get the highest order to put the new category at the end
    const categories = await db.categories.where('userId').equals(userId).sortBy('order');
    const lastCategory = categories[categories.length - 1];
    const order = lastCategory ? (lastCategory.order + 1) : 0;
    
    const category: Category = { 
      id, 
      userId,
      name, 
      icon, 
      order, 
      createdAt: now, 
      updatedAt: now, 
      deleted: 0,
      syncStatus: 'pending'
    };
    await db.categories.add(category);
    
    // 如果是已登录用户，立即触发后台同步
    if (userId !== 'local-user') {
      import('./syncService').then(({ syncService }) => syncService.sync());
    }
    
    return category;
  },

  async updateCategoriesOrder(categoryIds: string[]) {
    const userId = await authService.getEffectiveUserId();
    const now = Date.now();
    await db.transaction('rw', db.categories, async () => {
      for (let i = 0; i < categoryIds.length; i++) {
        const cat = await db.categories.get(categoryIds[i]);
        if (cat && cat.userId === userId) {
          await db.categories.update(categoryIds[i], {
            order: i,
            updatedAt: now,
            syncStatus: 'pending'
          });
        }
      }
    });

    if (userId !== 'local-user') {
      import('./syncService').then(({ syncService }) => syncService.sync());
    }
  },

  async updateCategory(id: string, updates: Partial<Category>) {
    const userId = await authService.getEffectiveUserId();
    const now = Date.now();
    const cat = await db.categories.get(id);
    if (cat && cat.userId === userId) {
      await db.categories.update(id, {
        ...updates,
        updatedAt: now,
        syncStatus: 'pending'
      });

      if (userId !== 'local-user') {
        import('./syncService').then(({ syncService }) => syncService.sync());
      }
    }
  },

  async deleteCategory(id: string) {
    const userId = await authService.getEffectiveUserId();
    const now = Date.now();
    const cat = await db.categories.get(id);
    if (cat && cat.userId === userId) {
      await db.categories.update(id, {
        deleted: 1,
        updatedAt: now,
        syncStatus: 'pending'
      });
      // Also mark bookmarks in this category as unmanaged or delete them? 
      // Usually better to keep bookmarks but clear their categoryId
      await db.bookmarks.where('categoryId').equals(id).modify(b => {
        if (b.userId === userId) {
          b.categoryId = undefined;
          b.syncStatus = 'pending';
        }
      });

      if (userId !== 'local-user') {
        import('./syncService').then(({ syncService }) => syncService.sync());
      }
    }
  },

  async fetchMetadata(url: string) {
    try {
      let targetUrl = url.trim();
      if (!targetUrl.startsWith('http')) {
        targetUrl = 'https://' + targetUrl;
      }
      
      const response = await fetch(targetUrl, { mode: 'cors' });
      const text = await response.text();
      const doc = new DOMParser().parseFromString(text, 'text/html');
      const title = doc.querySelector('title')?.innerText || 
                    doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
      
      const urlObj = new URL(targetUrl);
      const origin = urlObj.origin;

      // Get favicon from various link tags
      let icon = '';
      const selectors = [
        'link[rel="apple-touch-icon"]',
        'link[rel="apple-touch-icon-precomposed"]',
        'link[rel="shortcut icon"]',
        'link[rel="icon"]',
        'link[rel*="icon"]'
      ];

      for (const selector of selectors) {
        const node = doc.querySelector(selector);
        if (node) {
          const href = node.getAttribute('href');
          if (href) {
            if (href.startsWith('http')) {
              icon = href;
            } else if (href.startsWith('//')) {
              icon = 'https:' + href;
            } else if (href.startsWith('/')) {
              icon = `${origin}${href}`;
            } else {
              // Handle relative paths like "images/favicon.png"
              const path = urlObj.pathname.endsWith('/') ? urlObj.pathname : urlObj.pathname.substring(0, urlObj.pathname.lastIndexOf('/') + 1);
              icon = `${origin}${path}${href}`;
            }
            break;
          }
        }
      }

      // Fallback 1: check /favicon.ico
      if (!icon) {
        icon = `${origin}/favicon.ico`;
      }

      // Final fallback: Google Favicon Service (high quality)
      const googleFallback = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
      
      // We can't easily check if icon exists here without another fetch, 
      // so we return the best guess and let the UI handle error
      return { 
        title: title.trim(), 
        icon: icon || googleFallback, 
        url: targetUrl 
      };
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
      try {
        const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url.trim());
        return { 
          title: '', 
          icon: `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`,
          url: urlObj.href
        };
      } catch (e) {
        return { title: '', icon: '', url };
      }
    }
  }
};

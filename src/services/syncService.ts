import { db } from '../db/db';
import { supabase } from './supabase';
import { authService } from './authService';

export const syncService = {
  async sync() {
    const user = await authService.getCurrentUser();
    if (!user) return 0;

    try {
      // 1. Push local changes
      await this.pushLocalChanges(user.id);
      
      // 2. Pull remote changes
      const pulledCount = await this.pullRemoteChanges(user.id);
      
      console.log('同步完成');
      return pulledCount;
    } catch (error) {
      console.error('同步失败:', error);
      throw error;
    }
  },

  async pushLocalChanges(userId: string) {
    const pendingBookmarks = await db.bookmarks.where('syncStatus').equals('pending').toArray();
    
    for (const bookmark of pendingBookmarks) {
      const { syncStatus, ...dataToSync } = bookmark;
      const { error } = await supabase
        .from('bookmarks')
        .upsert({ ...dataToSync, user_id: userId });
      
      if (!error) {
        await db.bookmarks.update(bookmark.id, { syncStatus: 'synced' });
      } else {
        console.error('Push error:', error);
        await db.bookmarks.update(bookmark.id, { syncStatus: 'error' });
      }
    }

    const pendingCategories = await db.categories.toArray(); // Simplification: sync all categories for now
    for (const category of pendingCategories) {
      await supabase
        .from('categories')
        .upsert({ ...category, user_id: userId });
    }
  },

  async pullRemoteChanges(userId: string) {
    // Get last sync timestamp or just all changes for now
    // In a real app, we'd store lastSyncAt locally
    const { data: remoteBookmarks, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    
    let pulledCount = 0;
    for (const remote of remoteBookmarks) {
      const local = await db.bookmarks.get(remote.id);
      
      if (!local || remote.updatedAt > local.updatedAt) {
        await db.bookmarks.put({
          ...remote,
          syncStatus: 'synced'
        });
        pulledCount++;
      }
    }
    return pulledCount;
  },

  subscribeToChanges(userId: string, onUpdate: () => void) {
    return supabase
      .channel('any')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'bookmarks',
        filter: `user_id=eq.${userId}` 
      }, payload => {
        console.log('Change received!', payload);
        onUpdate();
      })
      .subscribe();
  }
};

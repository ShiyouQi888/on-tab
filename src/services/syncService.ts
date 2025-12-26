import { db } from '../db/db';
import { supabase } from './supabase';
import { authService } from './authService';

export const syncService = {
  async sync() {
    const user = await authService.getCurrentUser();
    if (!user) return 0;

    // 防止重入 (跨标签页/后台脚本)
    const isExtension = typeof chrome !== 'undefined' && chrome.storage;
    if (isExtension) {
      const { syncLock } = await chrome.storage.local.get('syncLock');
      if (syncLock && Date.now() - Number(syncLock) < 30000) { // 30秒锁定
        console.log('同步正在其他页面进行中，跳过本次请求');
        return 0;
      }
      await chrome.storage.local.set({ syncLock: Date.now() });
    } else {
      if ((globalThis as any)._isSyncing) {
        console.log('同步已在进行中，跳过本次请求');
        return 0;
      }
      (globalThis as any)._isSyncing = true;
    }

    try {
      console.log('开始同步流程...');
      // 0. 迁移访客数据
      await this.mergeLocalData(user.id);

      // 1. 推送本地更改（包含冲突检测）
      await this.pushLocalChanges(user.id);
      
      // 2. 拉取远程更改（包含冲突解决）
      const pulledCount = await this.pullRemoteChanges(user.id);
      
      // 3. 清理已删除的本地数据（如果云端也确认删除了）
      await this.cleanupDeletedData(user.id);

      console.log(`同步成功完成，拉取了 ${pulledCount} 条更新`);
      return pulledCount;
    } catch (error: any) {
      console.error('同步失败，详细错误:', error);
      // 如果是 RLS 错误或其他 Supabase 错误，可以在这里处理
      throw error;
    } finally {
      if (isExtension) {
        await chrome.storage.local.remove('syncLock');
      } else {
        (globalThis as any)._isSyncing = false;
      }
    }
  },

  async cleanupDeletedData(userId: string) {
    // 物理删除本地标记为 deleted 的数据
    await db.bookmarks.where('userId').equals(userId).and(b => b.deleted === 1 && b.syncStatus === 'synced').delete();
    await db.categories.where('userId').equals(userId).and(c => c.deleted === 1 && c.syncStatus === 'synced').delete();
  },

  async mergeLocalData(userId: string) {
    console.log('开始合并本地数据...', userId);
    const guestUserId = 'local-user';
    
    // 迁移分类
    const guestCategories = await db.categories.where('userId').equals(guestUserId).toArray();
    for (const cat of guestCategories) {
      await db.categories.update(cat.id, { 
        userId,
        syncStatus: 'pending' 
      });
    }

    // 迁移书签
    const guestBookmarks = await db.bookmarks.where('userId').equals(guestUserId).toArray();
    for (const bookmark of guestBookmarks) {
      await db.bookmarks.update(bookmark.id, { 
        userId,
        syncStatus: 'pending' 
      });
    }

    // 处理那些已经是当前用户但 syncStatus 为空的数据（兼容旧数据）
    await db.categories.where('userId').equals(userId).modify(c => {
      if (!c.syncStatus) c.syncStatus = 'pending';
    });
    await db.bookmarks.where('userId').equals(userId).modify(b => {
      if (!b.syncStatus) b.syncStatus = 'pending';
    });

    if (guestCategories.length > 0 || guestBookmarks.length > 0) {
      console.log(`已将 ${guestCategories.length} 个分类和 ${guestBookmarks.length} 个书签迁移至当前用户`);
    }
  },

  async pushLocalChanges(userId: string) {
    console.log('开始同步本地更改到远程...', userId);
    
    // 1. 同步分类
    const pendingCategories = await db.categories
      .where('userId').equals(userId)
      .and(c => c.syncStatus !== 'synced')
      .toArray();
    
    console.log(`找到 ${pendingCategories.length} 个本地分类需要同步`);
    
    for (const category of pendingCategories) {
      try {
        const { userId: localUserId, syncStatus, createdAt, updatedAt, ...rest } = category;
        
        // 使用 upsert，带上 updated_at 检查（简单的 LWW 策略）
        const { error } = await supabase
          .from('categories')
          .upsert({ 
            ...rest, 
            created_at: createdAt,
            updated_at: updatedAt,
            user_id: userId 
          }, {
            onConflict: 'id'
          });
          
        if (!error) {
          await db.categories.update(category.id, { syncStatus: 'synced' });
          console.log(`分类已同步到云端: ${category.name}`);
        } else {
          console.error(`Push category ${category.id} error:`, error);
          // 如果是因为外键或其他约束，这里会记录
        }
      } catch (err) {
        console.error(`Unexpected error pushing category ${category.id}:`, err);
      }
    }

    // 2. 同步书签
    const pendingBookmarks = await db.bookmarks
      .where('userId').equals(userId)
      .and(b => b.syncStatus !== 'synced')
      .toArray();
    
    console.log(`找到 ${pendingBookmarks.length} 个本地书签需要同步`);
    
    for (const bookmark of pendingBookmarks) {
      try {
        // 在推送书签之前，检查对应的分类是否已经在云端（外键约束保护）
        if (bookmark.categoryId) {
          const { data: catExists, error: checkError } = await supabase
            .from('categories')
            .select('id')
            .eq('id', bookmark.categoryId)
            .maybeSingle();
          
          if (checkError) {
            console.error(`检查分类是否存在时出错: ${bookmark.categoryId}`, checkError);
            continue;
          }

          if (!catExists) {
            console.warn(`跳过书签 ${bookmark.title}，分类 ${bookmark.categoryId} 尚未同步`);
            // 尝试立即同步这个缺失的分类
            const missingCat = await db.categories.get(bookmark.categoryId);
            if (missingCat) {
              console.log(`尝试立即补推缺失的分类: ${missingCat.name}`);
              const { userId: _, syncStatus: __, createdAt: c, updatedAt: u, ...catRest } = missingCat;
              const { error: upsertError } = await supabase.from('categories').upsert({
                ...catRest,
                created_at: c,
                updated_at: u,
                user_id: userId
              });
              if (upsertError) {
                console.error('补推分类失败:', upsertError);
                continue;
              } else {
                await db.categories.update(missingCat.id, { syncStatus: 'synced' });
              }
            } else {
              // 分类不存在，清除书签的 categoryId
              console.log(`分类已不存在，清除书签的 categoryId: ${bookmark.title}`);
              await db.bookmarks.update(bookmark.id, { categoryId: undefined, syncStatus: 'pending' });
              continue;
            }
          }
        }

        const { syncStatus, userId: localUserId, categoryId, createdAt, updatedAt, ...rest } = bookmark;
        const { error } = await supabase
          .from('bookmarks')
          .upsert({ 
            ...rest, 
            category_id: categoryId,
            created_at: createdAt,
            updated_at: updatedAt,
            user_id: userId 
          }, {
            onConflict: 'id'
          });
        
        if (!error) {
          await db.bookmarks.update(bookmark.id, { syncStatus: 'synced' });
          console.log(`书签已同步到云端: ${bookmark.title}`);
        } else {
          console.error(`Push bookmark ${bookmark.id} error:`, error);
        }
      } catch (err) {
        console.error(`Unexpected error pushing bookmark ${bookmark.id}:`, err);
      }
    }
    console.log('本地同步到远程完成');
  },

  async pullRemoteChanges(userId: string) {
    console.log('开始从远程拉取更改...', userId);
    let pulledCount = 0;

    // 1. 拉取分类
    const { data: remoteCategories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId);
    
    if (catError) {
      console.error('Pull categories error:', catError);
    } else {
      console.log(`获取到 ${remoteCategories?.length || 0} 个远程分类`);
      for (const remote of remoteCategories || []) {
        const local = await db.categories.get(remote.id);
        const remoteUpdatedAt = typeof remote.updated_at === 'number' 
          ? remote.updated_at 
          : new Date(remote.updated_at).getTime();
        
        // 如果本地没有，或者远程更亲，则更新本地
        if (!local || remoteUpdatedAt > (local.updatedAt || 0)) {
          const { user_id, created_at, updated_at, ...rest } = remote;
          await db.categories.put({
            ...rest,
            createdAt: typeof created_at === 'number' ? created_at : new Date(created_at).getTime(),
            updatedAt: remoteUpdatedAt,
            userId,
            order: typeof remote.order === 'number' ? remote.order : 0,
            deleted: remote.deleted || 0,
            syncStatus: 'synced'
          });
          pulledCount++;
          console.log(`更新本地分类: ${remote.name || remote.id}`);
        } else if (local && local.syncStatus !== 'synced') {
          // 如果本地存在且未同步，且本地比远程新，则保持本地状态（会在下一次同步时推送到远程）
          console.log(`本地分类 ${local.name} 较新，等待推送到远程`);
        }
      }
    }

    // 2. 拉取书签
    const { data: remoteBookmarks, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Pull bookmarks error:', error);
      throw error;
    }
    
    console.log(`获取到 ${remoteBookmarks?.length || 0} 个远程书签`);
    for (const remote of remoteBookmarks || []) {
      const local = await db.bookmarks.get(remote.id);
      const remoteUpdatedAt = typeof remote.updated_at === 'number'
        ? remote.updated_at
        : new Date(remote.updated_at).getTime();
      
      if (!local || remoteUpdatedAt > (local.updatedAt || 0)) {
        const { user_id, category_id, created_at, updated_at, ...rest } = remote;
        await db.bookmarks.put({
          ...rest,
          categoryId: category_id,
          createdAt: typeof created_at === 'number' ? created_at : new Date(created_at).getTime(),
          updatedAt: remoteUpdatedAt,
          userId,
          syncStatus: 'synced'
        });
        pulledCount++;
        console.log(`更新本地书签: ${remote.title || remote.id}`);
      } else if (local && local.syncStatus !== 'synced') {
        console.log(`本地书签 ${local.title} 较新，等待推送到远程`);
      }
    }
    console.log(`远程拉取完成，共更新了 ${pulledCount} 条数据`);
    return pulledCount;
  },

  subscribeToChanges(userId: string, onUpdate: () => void) {
    console.log('订阅远程数据变更...', userId);
    
    // 订阅书签变更
    const bookmarkChannel = supabase
      .channel('bookmarks_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'bookmarks',
        filter: `user_id=eq.${userId}` 
      }, payload => {
        console.log('远程书签变更!', payload);
        onUpdate();
      })
      .subscribe();

    // 订阅分类变更
    const categoryChannel = supabase
      .channel('categories_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'categories',
        filter: `user_id=eq.${userId}` 
      }, payload => {
        console.log('远程分类变更!', payload);
        onUpdate();
      })
      .subscribe();

    return {
      unsubscribe: () => {
        bookmarkChannel.unsubscribe();
        categoryChannel.unsubscribe();
      }
    };
  }
};

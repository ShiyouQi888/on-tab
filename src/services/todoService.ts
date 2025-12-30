import { db, type Todo } from '../db/db';
import { v4 as uuidv4 } from 'uuid';
import { authService } from './authService';

export const todoService = {
  async addTodo(content: string) {
    const userId = await authService.getEffectiveUserId();
    const id = uuidv4();
    const now = Date.now();
    
    // Get max order
    const lastTodo = await db.todos
      .where('userId').equals(userId)
      .and(t => t.deleted === 0)
      .sortBy('order');
    const nextOrder = lastTodo.length > 0 ? lastTodo[lastTodo.length - 1].order + 1 : 0;

    const newTodo: Todo = {
      id,
      userId,
      content,
      completed: 0,
      order: nextOrder,
      createdAt: now,
      updatedAt: now,
      deleted: 0,
      syncStatus: 'pending'
    };

    await db.todos.add(newTodo);

    if (userId !== 'local-user') {
      import('./syncService').then(({ syncService }) => syncService.sync());
    }

    return newTodo;
  },

  async updateTodo(id: string, updates: Partial<Omit<Todo, 'id' | 'userId' | 'createdAt'>>) {
    const userId = await authService.getEffectiveUserId();
    const now = Date.now();
    
    const todo = await db.todos.get(id);
    if (todo && todo.userId === userId) {
      await db.todos.update(id, {
        ...updates,
        updatedAt: now,
        syncStatus: 'pending'
      });

      if (userId !== 'local-user') {
        import('./syncService').then(({ syncService }) => syncService.sync());
      }
    }
  },

  async toggleTodo(id: string) {
    const todo = await db.todos.get(id);
    if (todo) {
      await this.updateTodo(id, { completed: todo.completed === 0 ? 1 : 0 });
    }
  },

  async deleteTodo(id: string) {
    const userId = await authService.getEffectiveUserId();
    const now = Date.now();
    
    const todo = await db.todos.get(id);
    if (todo && todo.userId === userId) {
      await db.todos.update(id, {
        deleted: 1,
        updatedAt: now,
        syncStatus: 'pending'
      });

      if (userId !== 'local-user') {
        import('./syncService').then(({ syncService }) => syncService.sync());
      }
    }
  },

  async getTodos() {
    const userId = await authService.getEffectiveUserId();
    return await db.todos
      .where('userId').equals(userId)
      .and(t => t.deleted === 0)
      .sortBy('order');
  },

  async reorderTodos(ids: string[]) {
    const userId = await authService.getEffectiveUserId();
    const now = Date.now();
    
    await db.transaction('rw', db.todos, async () => {
      for (let i = 0; i < ids.length; i++) {
        await db.todos.where({ id: ids[i], userId }).modify({
          order: i,
          updatedAt: now,
          syncStatus: 'pending'
        });
      }
    });

    if (userId !== 'local-user') {
      import('./syncService').then(({ syncService }) => syncService.sync());
    }
  }
};

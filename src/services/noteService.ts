import { db, type Note } from '../db/db';
import { v4 as uuidv4 } from 'uuid';
import { authService } from './authService';

export const noteService = {
  async getNote() {
    const userId = await authService.getEffectiveUserId();
    const notes = await db.notes.where('userId').equals(userId).toArray();
    
    if (notes.length === 0) {
      const id = uuidv4();
      const now = Date.now();
      const newNote: Note = {
        id,
        userId,
        content: '',
        updatedAt: now,
        syncStatus: 'synced'
      };
      await db.notes.add(newNote);
      return newNote;
    }
    
    return notes[0];
  },

  async updateNote(content: string) {
    const userId = await authService.getEffectiveUserId();
    const now = Date.now();
    const note = await this.getNote();
    
    if (note) {
      await db.notes.update(note.id, {
        content,
        updatedAt: now,
        syncStatus: 'pending'
      });

      if (userId !== 'local-user') {
        import('./syncService').then(({ syncService }) => syncService.sync());
      }
    }
  }
};

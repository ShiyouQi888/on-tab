import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { noteService } from '../../services/noteService';
import { StickyNote, Save, Loader2, Clock } from 'lucide-react';

export const NoteWidget: React.FC = () => {
  const { t } = useTranslation();
  const note = useLiveQuery(() => noteService.getNote());
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update local content when DB note changes (e.g., after sync)
  useEffect(() => {
    if (note && !isSaving) {
      setContent(note.content);
      setLastSaved(note.updatedAt);
    }
  }, [note, isSaving]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Auto-save with debounce
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      await noteService.updateNote(newContent);
      setIsSaving(false);
      setLastSaved(Date.now());
    }, 1000);
  };

  const formatLastSaved = (timestamp: number | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 w-full max-w-sm flex flex-col h-[400px] group transition-all hover:bg-white/[0.12]">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2 text-white/80">
          <StickyNote size={18} className="text-yellow-400" />
          <span className="text-sm font-bold tracking-wide">{t('widgets.note.title')}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-medium text-white/40">
          {isSaving ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              <span>{t('widgets.note.saving')}</span>
            </>
          ) : lastSaved ? (
            <>
              <Clock size={12} />
              <span>{t('widgets.note.lastSaved', { time: formatLastSaved(lastSaved) })}</span>
            </>
          ) : null}
        </div>
      </div>

      <textarea
        value={content}
        onChange={handleChange}
        placeholder={t('widgets.note.placeholder')}
        className="flex-1 bg-transparent border-none outline-none resize-none text-white/90 text-sm leading-relaxed placeholder:text-white/20 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      />
      
      <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center shrink-0">
        <span className="text-[10px] text-white/30 font-medium">
          {t('widgets.note.charCount', { count: content.length })}
        </span>
        <div className="flex gap-2">
          {/* Future actions could go here: Clear, Export, etc. */}
        </div>
      </div>
    </div>
  );
};

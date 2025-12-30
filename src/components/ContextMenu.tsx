import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit2, Trash2, Tag, ExternalLink, Copy } from 'lucide-react';
import { type Bookmark, type Category } from '../db/db';

interface ContextMenuProps {
  x: number;
  y: number;
  bookmark: Bookmark;
  categories: Category[];
  onClose: () => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onChangeCategory: (bookmarkId: string, categoryId: string | undefined) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  bookmark,
  categories,
  onClose,
  onEdit,
  onDelete,
  onChangeCategory,
}) => {
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', onClose);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', onClose);
    };
  }, [onClose]);

  // Adjust position if menu goes off screen
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - 300);

  const handleCopy = () => {
    navigator.clipboard.writeText(bookmark.url);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] bg-white/80 backdrop-blur-xl border border-white/40 rounded-xl shadow-2xl py-2 w-52 text-[13px] animate-in fade-in zoom-in duration-100"
      style={{ left: adjustedX, top: adjustedY }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <button
        onClick={() => {
          window.open(bookmark.url, '_blank');
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/50 transition-colors text-gray-700"
      >
        <ExternalLink size={15} className="text-gray-400" />
        {t('context.openInNewTab')}
      </button>

      <button
        onClick={handleCopy}
        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/50 transition-colors text-gray-700"
      >
        <Copy size={15} className="text-gray-400" />
        {t('context.copyLink')}
      </button>

      <div className="h-px bg-white/20 my-1" />

      <button
        onClick={() => {
          onEdit(bookmark);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/50 transition-colors text-gray-700"
      >
        <Edit2 size={15} className="text-gray-400" />
        {t('context.edit')}
      </button>

      <div className="relative group">
        <button className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/50 transition-colors text-gray-700">
          <div className="flex items-center gap-3">
            <Tag size={15} className="text-gray-400" />
            {t('context.moveToCategory')}
          </div>
          <span className="text-[10px] text-gray-400">▶</span>
        </button>
        
        <div className="absolute left-full top-0 ml-0.5 bg-white/80 backdrop-blur-xl border border-white/40 rounded-xl shadow-2xl py-2 w-44 hidden group-hover:block animate-in fade-in slide-in-from-left-1 duration-100">
          <button
            onClick={() => {
              onChangeCategory(bookmark.id, undefined);
              onClose();
            }}
            className={`w-full text-left px-4 py-2 hover:bg-white/50 transition-colors ${!bookmark.categoryId ? 'text-blue-600 font-bold bg-blue-50/30' : 'text-gray-600'}`}
          >
            {t('context.uncategorized')}
          </button>
          <div className="h-px bg-white/20 my-1" />
          <div className="max-h-60 overflow-y-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onChangeCategory(bookmark.id, cat.id);
                  onClose();
                }}
                className={`w-full text-left px-4 py-2 hover:bg-white/50 transition-colors truncate ${bookmark.categoryId === cat.id ? 'text-blue-600 font-bold bg-blue-50/30' : 'text-gray-600'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px bg-white/20 my-1" />

      <button
        onClick={() => {
          onDelete(bookmark.id);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50/50 hover:text-red-500 transition-colors text-gray-700"
      >
        <Trash2 size={15} />
        {t('context.delete')}
      </button>
    </div>
  );
};

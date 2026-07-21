import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Globe, Bookmark as BookmarkIcon } from 'lucide-react';
import type { Bookmark } from '../db/db';

interface BookmarkGridProps {
  bookmarks: Bookmark[];
  onAdd: () => void;
  onContextMenu: (e: React.MouseEvent, bookmark: Bookmark) => void;
}

const BookmarkCard = memo(function BookmarkCard({
  bookmark,
  onContextMenu,
}: {
  bookmark: Bookmark;
  onContextMenu: (e: React.MouseEvent, bookmark: Bookmark) => void;
}) {
  return (
    <a
      href={bookmark.url}
      className="flex flex-col items-center group relative cursor-pointer no-underline w-full max-w-[90px] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      onContextMenu={(e) => onContextMenu(e, bookmark)}
    >
      <div className="w-18 h-18 bg-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 group-hover:shadow-xl transition-all duration-300 relative overflow-hidden shadow-lg border border-black/5">
        {bookmark.icon ? (
          <img
            src={bookmark.icon}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=128`;
              (e.target as HTMLImageElement).className = 'w-10 h-10 object-contain';
            }}
          />
        ) : (
          <Globe size={32} className="text-gray-400" />
        )}
      </div>
      <span className="text-[13px] text-white font-bold w-full truncate text-center px-1 drop-shadow-md">
        {bookmark.title}
      </span>
    </a>
  );
});

const AddBookmarkButton = memo(function AddBookmarkButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();
  return (
    <div
      className="flex flex-col items-center group cursor-pointer w-full max-w-[90px] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      onClick={onClick}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
    >
      <div className="w-18 h-18 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/30 group-hover:scale-105 transition-all duration-300 shadow-lg border border-white/20">
        <Plus size={36} className="text-white/90" />
      </div>
      <span className="text-[13px] text-white font-bold drop-shadow-md">{t('common.add')}</span>
    </div>
  );
});

export const BookmarkGrid = memo(function BookmarkGrid({
  bookmarks,
  onAdd,
  onContextMenu,
}: BookmarkGridProps) {
  const { t } = useTranslation();

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-white/60">
        <BookmarkIcon size={48} className="opacity-30" />
        <p className="text-lg font-medium">{t('bookmark.emptyTitle')}</p>
        <p className="text-sm opacity-60">{t('bookmark.emptyDesc')}</p>
        <button
          onClick={onAdd}
          className="mt-4 px-6 py-3 bg-white/20 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/30 text-white text-sm font-bold transition-all active:scale-95"
        >
          {t('bookmark.addFirst')}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-10 gap-y-16 gap-x-14 w-full max-w-[1400px] justify-items-center mx-auto">
      {bookmarks.map(bookmark => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          onContextMenu={onContextMenu}
        />
      ))}
      <AddBookmarkButton onClick={onAdd} />
    </div>
  );
});

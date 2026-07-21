import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Globe } from 'lucide-react';
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
      className="flex flex-col items-center group relative cursor-pointer no-underline w-full max-w-[90px]"
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
      className="flex flex-col items-center group cursor-pointer w-full max-w-[90px]"
      onClick={onClick}
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
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-y-16 gap-x-14 w-full max-w-[1400px] justify-items-center mx-auto">
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

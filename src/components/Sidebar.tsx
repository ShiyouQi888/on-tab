import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User as UserIcon,
  Grid3X3,
  PlusCircle,
  Languages,
  Settings,
} from 'lucide-react';
import type { AppUser } from '../types';
import type { Category } from '../db/db';
import { Cloud } from 'lucide-react';

interface SidebarProps {
  user: AppUser | null;
  userAvatar: string | undefined;
  categories: Category[];
  selectedCategoryId: string | undefined;
  syncing: boolean;
  onCategorySelect: (id: string | undefined) => void;
  onAddCategory: () => void;
  onEditCategory: (cat: Category) => void;
  onAuthOpen: () => void;
  onSettingsOpen: () => void;
  onSync: () => void;
  getCategoryIcon: (iconId: string | undefined, size?: number) => React.ReactNode;
}

export const Sidebar = memo(function Sidebar({
  user,
  userAvatar,
  categories,
  selectedCategoryId,
  syncing,
  onCategorySelect,
  onAddCategory,
  onEditCategory,
  onAuthOpen,
  onSettingsOpen,
  onSync,
  getCategoryIcon,
}: SidebarProps) {
  const { t, i18n } = useTranslation();

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 w-16 max-h-[calc(100vh-48px)] bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl py-6 flex flex-col items-center z-40 group hover:w-48 transition-all duration-300 overflow-hidden shadow-2xl opacity-60 hover:opacity-100">
      <div
        onClick={() => !user ? onAuthOpen() : onSettingsOpen()}
        className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-6 cursor-pointer hover:bg-white/30 transition-colors shrink-0 overflow-hidden ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      >
        {userAvatar ? (
          <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <UserIcon className="text-white" size={24} />
        )}
      </div>

      <div className="w-8 h-[1px] bg-white/10 mb-4 shrink-0" />

      <div className="flex-1 w-full flex flex-col items-start gap-2 overflow-y-auto overflow-x-hidden no-scrollbar">
        <button
          onClick={() => onCategorySelect(undefined)}
          className={`w-[calc(100%-16px)] mx-2 flex items-center py-2 rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${!selectedCategoryId ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
        >
          <div className="w-8 h-10 flex justify-center items-center shrink-0 ml-2">
            <Grid3X3 size={20} />
          </div>
          <span className="whitespace-nowrap font-medium text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 ml-1">
            {t('nav.allBookmarks')}
          </span>
        </button>

        {categories.map(cat => (
          <div
            key={cat.id}
            className="w-[calc(100%-16px)] mx-2 relative group/cat"
          >
            <button
              onClick={() => onCategorySelect(cat.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                onEditCategory(cat);
              }}
              className={`w-full flex items-center py-2 rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${selectedCategoryId === cat.id ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
            >
              <div className="w-8 h-10 flex justify-center items-center shrink-0 ml-2">
                {getCategoryIcon(cat.icon)}
              </div>
              <span className="whitespace-nowrap font-medium text-sm truncate opacity-0 group-hover:opacity-100 transition-all duration-300 flex-1 text-left ml-1">
                {cat.name}
              </span>
            </button>
          </div>
        ))}
      </div>

      <div className="w-8 h-[1px] bg-white/10 my-4 shrink-0" />

      <button
        onClick={onAddCategory}
        className="w-[calc(100%-16px)] mx-2 flex items-center py-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all duration-300"
      >
        <div className="w-8 h-10 flex justify-center items-center shrink-0 ml-2">
          <PlusCircle size={20} />
        </div>
        <span className="whitespace-nowrap font-medium text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 ml-1">
          {t('nav.addCategory')}
        </span>
      </button>

      <div className="mt-auto space-y-2 w-full">
        <button
          onClick={() => {
            const nextLang = i18n.language.startsWith('zh') ? 'en' : 'zh';
            i18n.changeLanguage(nextLang);
          }}
          className="w-[calc(100%-16px)] mx-2 flex items-center py-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all duration-300 group/nav"
          title={t('nav.switchLang')}
        >
          <div className="w-8 h-10 flex justify-center items-center shrink-0 ml-2">
            <Languages size={20} className="group-hover/nav:scale-110 transition-transform" />
          </div>
          <span className="whitespace-nowrap font-medium text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 ml-1">
            {t('nav.switchLangName')}
          </span>
        </button>

        <button
          onClick={() => user ? onSync() : onAuthOpen()}
          disabled={syncing}
          className={`w-[calc(100%-16px)] mx-2 flex items-center py-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all duration-300 group/nav ${syncing ? 'animate-pulse' : ''}`}
          title={t('nav.syncNow')}
        >
          <div className="w-8 h-10 flex justify-center items-center shrink-0 ml-2">
            <Cloud size={20} className={`${syncing ? 'animate-spin' : 'group-hover/nav:scale-110'} transition-transform`} />
          </div>
          <span className="whitespace-nowrap font-medium text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 ml-1">
            {t('nav.syncNow')}
          </span>
        </button>

        <button
          onClick={onSettingsOpen}
          className="w-[calc(100%-16px)] mx-2 flex items-center py-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all duration-300 group/nav"
          title={t('nav.settings')}
        >
          <div className="w-8 h-10 flex justify-center items-center shrink-0 ml-2">
            <Settings size={20} className="group-hover/nav:rotate-90 transition-transform duration-500" />
          </div>
          <span className="whitespace-nowrap font-medium text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 ml-1">
            {t('nav.settings')}
          </span>
        </button>
      </div>
    </div>
  );
});

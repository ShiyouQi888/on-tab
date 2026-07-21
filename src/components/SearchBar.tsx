import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import type { SearchEngine } from '../types';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedEngine: SearchEngine;
  onEngineChange: (engine: SearchEngine) => void;
  isEngineMenuOpen: boolean;
  onEngineMenuToggle: (open: boolean) => void;
  engines: SearchEngine[];
}

export const SearchBar = memo(function SearchBar({
  searchQuery,
  onSearchChange,
  selectedEngine,
  onEngineChange,
  isEngineMenuOpen,
  onEngineMenuToggle,
  engines,
}: SearchBarProps) {
  const { t } = useTranslation();

  const handleSearch = () => {
    const query = searchQuery.trim();
    if (!query) return;
    const isUrl = query.includes('.') && !query.includes(' ');
    if (isUrl) {
      const url = query.startsWith('http') ? query : `https://${query}`;
      window.location.href = url;
    } else {
      window.location.href = `${selectedEngine.url}${encodeURIComponent(query)}`;
    }
  };

  return (
    <div className="w-full max-w-[700px] mb-12 relative group z-50">
      <div className="relative flex items-center bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 transition-all overflow-visible p-2 group-focus-within:bg-white/80 group-focus-within:border-white/60">
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEngineMenuToggle(!isEngineMenuOpen);
            }}
            className="flex items-center gap-2 px-1 py-1 hover:bg-black/5 rounded-xl transition-colors shrink-0 z-20"
          >
            <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-white/20 border border-white/20">
              <img src={selectedEngine.icon} alt="" className="w-full h-full object-cover pointer-events-none" />
            </div>
            <div className={`w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500 transition-transform duration-300 ${isEngineMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isEngineMenuOpen && (
            <>
              <div className="fixed inset-0 z-[60]" onClick={() => onEngineMenuToggle(false)} />
              <div className="absolute left-0 top-[calc(100%+12px)] w-[min(600px,calc(100vw-48px))] bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 p-6 z-[70] animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-6">
                  {engines.map(engine => (
                    <button
                      key={engine.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEngineChange(engine);
                        onEngineMenuToggle(false);
                      }}
                      className="flex flex-col items-center gap-3 group/item"
                    >
                      <div className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-300 overflow-hidden ${selectedEngine.id === engine.id ? 'bg-white shadow-md scale-110 ring-2 ring-blue-500/20' : 'bg-white/40 hover:bg-white/60 group-hover/item:shadow-lg group-hover/item:-translate-y-1'}`}>
                        <img src={engine.icon} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className={`text-xs font-bold transition-colors ${selectedEngine.id === engine.id ? 'text-blue-600' : 'text-gray-700 group-hover/item:text-gray-900'}`}>
                        {t(`search.engines.${engine.id}`)}
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    className="flex flex-col items-center gap-3 group/item"
                  >
                    <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-blue-500/10 border-2 border-dashed border-blue-500/30 hover:bg-blue-500 hover:border-blue-500 transition-all duration-300 group-hover/item:shadow-lg group-hover/item:-translate-y-1 group/add">
                      <Plus size={24} className="text-blue-500 group-hover/add:text-white transition-colors" />
                    </div>
                    <span className="text-xs font-bold text-blue-600 group-hover/item:text-blue-700">
                      {t('search.addEngine')}
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <input
          type="text"
          placeholder={t('search.placeholder')}
          className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-gray-800 placeholder:text-gray-500 text-[16px] font-bold"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchQuery) {
              handleSearch();
            }
          }}
        />
      </div>
    </div>
  );
});

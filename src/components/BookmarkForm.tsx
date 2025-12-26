import React, { useState, useEffect } from 'react';
import { type Bookmark, type Category } from '../db/db';
import { bookmarkService } from '../services/bookmarkService';
import { X, Loader2, Globe, RefreshCw } from 'lucide-react';

interface BookmarkFormProps {
  onClose: () => void;
  onSave: () => void;
  initialData?: Bookmark;
}

export const BookmarkForm: React.FC<BookmarkFormProps> = ({ onClose, onSave, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [icon, setIcon] = useState(initialData?.icon || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [tags, setTags] = useState(initialData?.tags.join(', ') || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedIcon, setFetchedIcon] = useState('');

  useEffect(() => {
    bookmarkService.getAllCategories().then(setCategories);
  }, []);

  const handleUrlBlur = async () => {
    if (url) {
      // Basic domain check
      const looksLikeDomain = url.includes('.') && !url.includes(' ');
      if (looksLikeDomain) {
        setIsFetching(true);
        try {
          const metadata = await bookmarkService.fetchMetadata(url);
          if (metadata.title && !title) setTitle(metadata.title);
          if (metadata.icon) {
            setFetchedIcon(metadata.icon);
            if (!icon) setIcon(metadata.icon);
          }
          if (metadata.url && url !== metadata.url) setUrl(metadata.url);
        } catch (err) {
          console.error('Fetch metadata error:', err);
        } finally {
          setIsFetching(false);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagList = tags.split(',').map(t => t.trim()).filter(t => t !== '');
    
    const bookmarkData = {
      title,
      url,
      icon,
      notes,
      tags: tagList,
      categoryId: categoryId || undefined,
    };

    if (initialData) {
      await bookmarkService.updateBookmark(initialData.id, bookmarkData);
    } else {
      await bookmarkService.addBookmark(bookmarkData);
    }
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white/80 backdrop-blur-2xl rounded-2xl w-full max-w-md shadow-2xl border border-white/40 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-white/20 bg-white/20">
          <h2 className="text-xl font-bold text-gray-800">{initialData ? '编辑书签' : '添加书签'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-black/5 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">URL 地址</label>
            <div className="relative group">
              <input
                type="text"
                required
                placeholder="example.com 或 https://..."
                className="block w-full bg-white/50 border border-white/40 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-gray-800 font-medium"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={handleUrlBlur}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {isFetching ? (
                  <Loader2 className="animate-spin text-blue-500" size={18} />
                ) : (
                  <button 
                    type="button"
                    onClick={handleUrlBlur}
                    className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                    title="重新获取信息"
                  >
                    获取信息
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">标题名称</label>
              <input
                type="text"
                required
                placeholder="书签名称"
                className="block w-full bg-white/50 border border-white/40 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-gray-800 font-medium"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">图标预览 & 自定义 (二选一)</label>
            <div className="flex items-start gap-4 p-4 bg-white/40 border border-white/40 rounded-2xl transition-all">
              <div className="w-14 h-14 bg-white/60 rounded-xl border border-white/60 flex items-center justify-center shrink-0 shadow-sm overflow-hidden group relative">
                {icon ? (
                  <img 
                    src={icon} 
                    alt="icon" 
                    className="w-10 h-10 object-contain transition-transform group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${url}&sz=64`;
                    }}
                  />
                ) : (
                  <Globe className="text-gray-300" size={28} />
                )}
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="手动输入图标 URL..."
                    className="block w-full bg-white/50 border border-white/40 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-gray-700"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                  />
                </div>
                
                {fetchedIcon && icon !== fetchedIcon && (
                  <button
                    type="button"
                    onClick={() => setIcon(fetchedIcon)}
                    className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black hover:bg-blue-100 transition-colors uppercase tracking-tight"
                  >
                    <RefreshCw size={10} className="group-hover:rotate-180 transition-transform duration-500" />
                    恢复获取到的图标
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">分类目录</label>
              <select
                className="block w-full bg-white/50 border border-white/40 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-gray-800 font-medium appearance-none cursor-pointer"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">未分类</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">标签 (逗号分隔)</label>
              <input
                type="text"
                placeholder="工作, 学习, 娱乐"
                className="block w-full bg-white/50 border border-white/40 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-gray-800 font-medium"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">备注说明 (可选)</label>
            <textarea
              placeholder="添加一些备注..."
              className="block w-full bg-white/50 border border-white/40 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-gray-800 font-medium h-20 resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={onClose} 
              className="flex-1 px-4 py-3 text-gray-700 font-bold hover:bg-black/5 rounded-xl transition-all"
            >
              取消
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              {initialData ? '更新书签' : '保存书签'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

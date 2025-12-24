import React, { useState, useEffect } from 'react';
import { type Bookmark, type Category } from '../db/db';
import { bookmarkService } from '../services/bookmarkService';
import { X, Loader2, Globe } from 'lucide-react';

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
          if (metadata.title) setTitle(metadata.title);
          if (metadata.icon) setIcon(metadata.icon);
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
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">{initialData ? '编辑书签' : '添加书签'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="example.com 或 https://..."
                className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    title="重新获取信息"
                  >
                    获取
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
            <div className="flex gap-2">
              <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                {icon ? (
                  <img 
                    src={icon} 
                    alt="" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      try {
                        const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
                        const img = e.target as HTMLImageElement;
                        img.src = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
                        img.className = "w-6 h-6 object-contain"; // Fallback for small favicons
                      } catch (err) {
                        setIcon('');
                      }
                    }} 
                  />
                ) : (
                  <Globe className="text-gray-400" size={24} />
                )}
              </div>
              <input
                type="text"
                required
                placeholder="网站名称"
                className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <select
              className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">标签 (逗号分隔)</label>
            <input
              type="text"
              placeholder="标签1, 标签2..."
              className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea
              placeholder="添加备注..."
              className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isFetching}
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              保存书签
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

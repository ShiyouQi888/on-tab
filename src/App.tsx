import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { db, type Bookmark } from './db/db';
import { bookmarkService } from './services/bookmarkService';
import { authService } from './services/authService';
import { syncService } from './services/syncService';
import { BookmarkForm } from './components/BookmarkForm';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ContextMenu } from './components/ContextMenu';
import { Toast, type ToastType } from './components/Toast';
import { CalendarModal } from './components/CalendarModal';
import { 
  Plus, 
  Search, 
  Settings, 
  LogOut, 
  LogIn, 
  RefreshCw, 
  Trash2, 
  ExternalLink,
  Tag as TagIcon,
  SlidersHorizontal,
  Globe,
  Mic,
  Camera,
  Grid3X3,
  X,
  Home,
  Briefcase,
  ShoppingBag,
  Palette,
  Wrench,
  Layout,
  User,
  PlusCircle,
  MoreHorizontal,
  Sparkles,
  Gamepad2,
  BookOpen,
  Music,
  Tv,
  Utensils,
  Plane,
  Heart,
  Dumbbell,
  Film,
  MessageCircle,
  Brain,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudDrizzle,
  Sun,
  Cloud,
  Clock,
  Calendar as CalendarIcon,
  Languages,
  ShieldCheck,
  Database,
  Coffee,
  Mail,
  CheckCircle2,
  Circle,
  ListTodo,
  Copy,
  Check,
  Quote,
} from 'lucide-react';

const SEARCH_ENGINES = [
  { id: 'bing', url: 'https://www.bing.com/search?q=', icon: 'https://www.google.com/s2/favicons?domain=bing.com&sz=64' },
  { id: 'baidu', url: 'https://www.baidu.com/s?wd=', icon: 'https://www.google.com/s2/favicons?domain=baidu.com&sz=64' },
  { id: 'google', url: 'https://www.google.com/search?q=', icon: 'https://www.google.com/s2/favicons?domain=google.com&sz=64' },
  { id: 'github', url: 'https://github.com/search?q=', icon: 'https://www.google.com/s2/favicons?domain=github.com&sz=64' },
  { id: 'bilibili', url: 'https://search.bilibili.com/all?keyword=', icon: 'https://www.google.com/s2/favicons?domain=bilibili.com&sz=64' },
  { id: 'zhihu', url: 'https://www.zhihu.com/search?q=', icon: 'https://www.google.com/s2/favicons?domain=zhihu.com&sz=64' },
];

const CATEGORY_ICONS = [
  { id: 'home', icon: Home },
  { id: 'sparkles', icon: Sparkles },
  { id: 'briefcase', icon: Briefcase },
  { id: 'wrench', icon: Wrench },
  { id: 'shopping-bag', icon: ShoppingBag },
  { id: 'palette', icon: Palette },
  { id: 'gamepad', icon: Gamepad2 },
  { id: 'book', icon: BookOpen },
  { id: 'music', icon: Music },
  { id: 'tv', icon: Tv },
  { id: 'utensils', icon: Utensils },
  { id: 'plane', icon: Plane },
  { id: 'heart', icon: Heart },
  { id: 'dumbbell', icon: Dumbbell },
  { id: 'film', icon: Film },
  { id: 'message', icon: MessageCircle },
  { id: 'brain', icon: Brain },
  { id: 'layout', icon: Layout },
];

import { TodoWidget } from './components/widgets/TodoWidget';
import { QuoteWidget } from './components/widgets/QuoteWidget';
import { PomodoroWidget } from './components/widgets/PomodoroWidget';
import { NoteWidget } from './components/widgets/NoteWidget';

function App() {
  const { t, i18n } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [initialSettingsTab, setInitialSettingsTab] = useState<string>('categories');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIconId, setSelectedIconId] = useState('home');
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | undefined>();
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, bookmark: Bookmark } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedSearchEngine, setSelectedSearchEngine] = useState(SEARCH_ENGINES[0]);
  const [isSearchEngineMenuOpen, setIsSearchEngineMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const userAvatar = user?.user_metadata?.avatar_url;

  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<{ temp: number; condition: string; icon: any }>({ temp: 24, condition: t('weather.cloudy'), icon: Cloud });
  const [wallpaper, setWallpaper] = useState(localStorage.getItem('app-wallpaper') || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
  const [isZenMode, setIsZenMode] = useState(localStorage.getItem('app-zen-mode') === 'true');
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [lastScrollTime, setLastScrollTime] = useState(0);

  const toggleZenMode = () => {
    const newMode = !isZenMode;
    setIsZenMode(newMode);
    localStorage.setItem('app-zen-mode', String(newMode));
  };

  const changeRandomWallpaper = () => {
    const curatedWallpapers = [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1493246507139-91e8bef99c02?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1433086566081-6428ca7af53f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1426604966848-d7adac402bff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    ];
    
    let nextWallpaper = curatedWallpapers[Math.floor(Math.random() * curatedWallpapers.length)];
    while (nextWallpaper === wallpaper) {
      nextWallpaper = curatedWallpapers[Math.floor(Math.random() * curatedWallpapers.length)];
    }
    
    setWallpaper(nextWallpaper);
    localStorage.setItem('app-wallpaper', nextWallpaper);
    showToast(t('toast.wallpaperUpdated'), 'info');
  };

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast(null);
    setTimeout(() => {
      setToast({ message, type });
    }, 10);
  };

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  
  const categories = useLiveQuery(
    () => bookmarkService.getAllCategories(),
    [user?.id]
  ) || [];

  const bookmarks = useLiveQuery(
    async () => {
      const { items } = await bookmarkService.getBookmarks({ 
        query: debouncedQuery,
        categoryId: selectedCategoryId 
      });
      return items;
    },
    [debouncedQuery, selectedCategoryId, user?.id]
  ) || [];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const checkServiceWorker = () => {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: 'PING' }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn(t('toast.swConnecting'), chrome.runtime.lastError.message);
            // 可能是 SW 还没准备好，1秒后重试一次
            setTimeout(checkServiceWorker, 1000);
          } else {
            console.log(t('toast.swReady'), response);
          }
        });
      }
    };

    try {
      checkServiceWorker();
      authService.getCurrentUser().then(user => {
        setUser(user);
        if (user) {
          // 登录后立即执行一次全量同步
          handleSync();
        }
      });
      
      const authResponse = authService.onAuthStateChange((_event, session) => {
        const newUser = session?.user ?? null;
        setUser(newUser);
        if (newUser) {
          // 状态变更（如登录）时也执行一次同步
          handleSync();
        }
      });
      
      const subscription = authResponse?.data?.subscription;
      return () => {
        if (subscription) subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Initialization error:', error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      const subscription = syncService.subscribeToChanges(user.id, () => {
        handleSync();
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // 模拟天气数据
    const conditions = [
      { temp: 24, condition: t('weather.cloudy'), icon: Cloud },
      { temp: 28, condition: t('weather.sunny'), icon: Sun },
      { temp: 22, condition: t('weather.drizzle'), icon: CloudDrizzle },
      { temp: 18, condition: t('weather.rain'), icon: CloudRain }
    ];
    setWeather(conditions[Math.floor(Math.random() * conditions.length)]);
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // 如果正在搜索，不执行切换
      if (searchQuery) return;
      
      const now = Date.now();
      // 防抖：500ms 内只触发一次切换
      if (now - lastScrollTime < 500) return;

      // 只有在页面没有滚动条或者已经滚动到底部/顶部时才切换分类
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
      const isAtTop = window.scrollY <= 50;

      if (e.deltaY > 0 && isAtBottom) {
        // 向下滚动 -> 下一个分类
        setLastScrollTime(now);
        const currentIndex = !selectedCategoryId ? -1 : categories.findIndex(c => c.id === selectedCategoryId);
        if (currentIndex < categories.length - 1) {
          const nextCat = categories[currentIndex + 1];
          setSelectedCategoryId(nextCat.id);
          showToast(t('toast.switchCat', { name: nextCat.name }), 'info');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (e.deltaY < 0 && isAtTop) {
        // 向上滚动 -> 上一个分类
        setLastScrollTime(now);
        const currentIndex = !selectedCategoryId ? -1 : categories.findIndex(c => c.id === selectedCategoryId);
        if (currentIndex > 0) {
          const prevCat = categories[currentIndex - 1];
          setSelectedCategoryId(prevCat.id);
          showToast(t('toast.switchCat', { name: prevCat.name }), 'info');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (currentIndex === 0) {
          setSelectedCategoryId(undefined);
          showToast(t('toast.switchCat', { name: t('nav.allBookmarks') }), 'info');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [selectedCategoryId, categories, lastScrollTime, searchQuery]);

  const handleSync = async () => {
    if (!user) return;
    if (syncing) return; // 防止 UI 层重复触发
    setSyncing(true);
    try {
      const pulledCount = await syncService.sync();
      // 只有当真正有数据更新时才显示通知，或者如果是手动点击同步
      if (pulledCount > 0) {
        showToast(t('toast.syncSuccess', { count: pulledCount as number }), 'success');
      }
    } catch (err) {
      console.error('Sync failed', err);
      showToast(t('toast.syncFailed'), 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: t('common.warning'),
      message: t('bookmark.deleteConfirm'),
      onConfirm: async () => {
        try {
          await bookmarkService.deleteBookmark(id);
          showToast(t('toast.bookmarkDeleted'), 'success');
        } catch (err) {
          showToast(t('common.error'), 'error');
        }
      }
    });
  };

  const handleCategoryDelete = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: t('common.warning'),
      message: t('category.deleteConfirm'),
      onConfirm: async () => {
        try {
          await bookmarkService.deleteCategory(id);
          showToast(t('toast.categoryDeleted'), 'success');
          if (selectedCategoryId === id) {
            setSelectedCategoryId(undefined);
          }
        } catch (err) {
          showToast(t('common.error'), 'error');
        }
      }
    });
  };

  const handleEdit = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setIsFormOpen(true);
  };

  const handleContextMenu = (e: React.MouseEvent, bookmark: Bookmark) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, bookmark });
  };

  const handleChangeCategory = async (bookmarkId: string, categoryId: string | undefined) => {
    try {
      await bookmarkService.updateBookmark(bookmarkId, { categoryId });
      showToast(t('toast.categoryUpdated'), 'success');
    } catch (err) {
      showToast(t('common.error'), 'error');
    }
  };

  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      if (editingCategory) {
        await bookmarkService.updateCategory(editingCategory.id, {
          name: newCategoryName,
          icon: selectedIconId
        });
        showToast(t('toast.categoryUpdated'), 'success');
      } else {
        await bookmarkService.addCategory(newCategoryName, selectedIconId);
        showToast(t('toast.categoryAdded'), 'success');
      }
      setIsCategoryModalOpen(false);
      setNewCategoryName('');
      setEditingCategory(null);
    } catch (err) {
      showToast(t('toast.saveFailed'), 'error');
    }
  };

  const handleEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setNewCategoryName(cat.name);
    setSelectedIconId(cat.icon || 'home');
    setIsCategoryModalOpen(true);
  };

  const getCategoryIcon = (iconId: string | undefined, size = 20) => {
    const iconObj = CATEGORY_ICONS.find(i => i.id === iconId) || CATEGORY_ICONS[0];
    const IconComponent = iconObj.icon;
    return <IconComponent size={size} />;
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center p-4 relative transition-all duration-700 ease-in-out"
         style={{ backgroundImage: `url("${wallpaper}")` }}>
      
      {/* Wallpaper Pull Rope */}
      <div 
        className="fixed top-0 right-48 z-[60] flex flex-col items-center cursor-ns-resize group"
        onMouseDown={(e) => {
          setIsPulling(true);
          const startY = e.clientY;
          const onMouseMove = (moveEvent: MouseEvent) => {
            const dist = Math.max(0, Math.min(150, moveEvent.clientY - startY));
            setPullDistance(dist);
          };
          const onMouseUp = (upEvent: MouseEvent) => {
            const finalDist = upEvent.clientY - startY;
            if (finalDist > 100) {
              changeRandomWallpaper();
            }
            setPullDistance(0);
            setIsPulling(false);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
          };
          window.addEventListener('mousemove', onMouseMove);
          window.addEventListener('mouseup', onMouseUp);
        }}
      >
        {/* Rope Line */}
        <div 
          className="w-1 bg-gradient-to-r from-white/20 via-white/50 to-white/20 group-hover:via-white/70 transition-colors shadow-[0_0_10px_rgba(0,0,0,0.3)] relative"
          style={{ height: `${60 + pullDistance}px`, transition: isPulling ? 'none' : 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
        >
          {/* Rope Texture Effect */}
          <div className="absolute inset-0 w-full h-full opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 4px)' }} />
        </div>
        {/* Rope Handle (Wood/Gold Style) */}
        <div 
          className="w-4 h-10 rounded-full bg-gradient-to-b from-[#d4af37] to-[#8b4513] shadow-lg border border-white/20 -mt-1 flex flex-col items-center justify-center gap-1 group-hover:scale-110 transition-transform"
          style={{ transform: `translateY(${pullDistance * 0.1}px)`, transition: isPulling ? 'none' : 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
        </div>
        {/* Pull Hint */}
        <div className="absolute top-[110%] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[10px] text-white/60 font-bold uppercase tracking-[0.2em] pointer-events-none">
          {pullDistance > 80 ? t('settings.labels.releaseToChange') : t('settings.labels.pullToChange')}
        </div>
      </div>

      {/* Zen Mode Toggle (Top Right) */}
      <div className="fixed top-8 right-8 z-50 flex items-center gap-3">
        <button
          onClick={toggleZenMode}
          className={`p-3 rounded-2xl backdrop-blur-md border transition-all duration-300 group shadow-lg ${
            isZenMode 
              ? 'bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30' 
              : 'bg-white/10 border-white/10 text-white/60 hover:bg-white/20 hover:text-white'
          }`}
          title={t('common.zenMode')}
        >
          {isZenMode ? (
            <Sparkles size={20} className="group-hover:scale-110 transition-transform" />
          ) : (
            <Coffee size={20} className="group-hover:scale-110 transition-transform" />
          )}
          <span className={`absolute right-full mr-4 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-xs font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}>
            {t('common.zenMode')}
          </span>
        </button>
      </div>
      
      {/* Left Sidebar Navigation */}
      {!isZenMode && (
        <div className="fixed left-6 top-1/2 -translate-y-1/2 w-16 max-h-[calc(100vh-48px)] bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl py-6 flex flex-col items-center z-40 group hover:w-48 transition-all duration-300 overflow-hidden shadow-2xl opacity-20 hover:opacity-100">
          <div 
            onClick={() => !user ? setIsAuthOpen(true) : setIsSettingsOpen(true)}
            className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-6 cursor-pointer hover:bg-white/30 transition-colors shrink-0 overflow-hidden"
          >
            {userAvatar ? (
              <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (            <User className="text-white" size={24} />
            )}
          </div>
          
          <div className="w-8 h-[1px] bg-white/10 mb-4 shrink-0" />

          <div className="flex-1 w-full flex flex-col items-start gap-2 overflow-y-auto overflow-x-hidden no-scrollbar">
            <button 
              onClick={() => setSelectedCategoryId(undefined)}
              className={`w-[calc(100%-16px)] mx-2 flex items-center py-2 rounded-lg transition-all duration-300 ${!selectedCategoryId ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
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
                  onClick={() => setSelectedCategoryId(cat.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleEditCategory(cat);
                  }}
                  className={`w-full flex items-center py-2 rounded-lg transition-all duration-300 ${selectedCategoryId === cat.id ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
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
            onClick={() => {
              setEditingCategory(null);
              setNewCategoryName('');
              setSelectedIconId('home');
              setIsCategoryModalOpen(true);
            }}
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
              onClick={() => user ? handleSync() : setIsAuthOpen(true)}
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
              onClick={() => setIsSettingsOpen(true)}
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
      )}

      {/* Main Content Area */}
      <div className={`w-full flex flex-row items-start justify-center gap-12 relative z-10 pt-[5vh] pr-8 ${isZenMode ? 'pl-8' : 'pl-24'}`}>
        <main className={`flex-1 flex flex-col items-center justify-start max-w-[1200px] w-full px-4 ${isZenMode ? 'h-[90vh]' : ''}`}>
          {/* Large Clock */}
          <div className="mb-8 flex flex-col items-center relative">
            <div className="relative">
              <h1 className="text-[120px] font-bold text-white leading-none tracking-tighter drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] select-none">
                {currentTime.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit', hour12: false })}
              </h1>
              {/* Weather info at the bottom-right of the time */}
              <div className="absolute left-[calc(100%+0.5rem)] bottom-6 flex items-center gap-2 px-3 py-1 bg-black/20 backdrop-blur-md rounded-full border border-white/10 opacity-90 whitespace-nowrap">
                <div className="flex items-center justify-center text-white animate-pulse">
                  <weather.icon size={14} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">
                    {weather.temp}°C
                  </span>
                  <span className="text-[10px] text-white/80 font-medium">
                    {weather.condition}
                  </span>
                </div>
              </div>
            </div>
            <div 
              className="flex items-center gap-3 mt-2 px-6 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 shadow-lg cursor-pointer hover:bg-black/30 transition-all active:scale-95"
              onClick={() => setIsCalendarOpen(true)}
            >
              <span className="text-lg font-medium text-white/90 tracking-widest uppercase">
                {currentTime.toLocaleDateString(i18n.language, { month: 'long', day: 'numeric', weekday: 'long' })}
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-[700px] mb-12 relative group z-50">
            <div className="relative flex items-center bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 transition-all overflow-visible p-2 group-focus-within:bg-white/80 group-focus-within:border-white/60">
              <div className="relative flex items-center">
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSearchEngineMenuOpen(!isSearchEngineMenuOpen);
                  }}
                  className="flex items-center gap-2 px-1 py-1 hover:bg-black/5 rounded-xl transition-colors shrink-0 z-20"
                >
                  <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-white/20 border border-white/20">
                    <img src={selectedSearchEngine.icon} alt="" className="w-full h-full object-cover pointer-events-none" />
                  </div>
                  <div className={`w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500 transition-transform duration-300 ${isSearchEngineMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isSearchEngineMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setIsSearchEngineMenuOpen(false)} />
                    <div className="absolute left-0 top-[calc(100%+12px)] w-[min(600px,calc(100vw-48px))] bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 p-6 z-[70] animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-6">
                        {SEARCH_ENGINES.map(engine => (
                          <button
                            key={engine.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSearchEngine(engine);
                              setIsSearchEngineMenuOpen(false);
                            }}
                            className="flex flex-col items-center gap-3 group/item"
                          >
                            <div className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-300 overflow-hidden ${selectedSearchEngine.id === engine.id ? 'bg-white shadow-md scale-110 ring-2 ring-blue-500/20' : 'bg-white/40 hover:bg-white/60 group-hover/item:shadow-lg group-hover/item:-translate-y-1'}`}>
                              <img src={engine.icon} alt="" className="w-full h-full object-cover" />
                            </div>
                            <span className={`text-xs font-bold transition-colors ${selectedSearchEngine.id === engine.id ? 'text-blue-600' : 'text-gray-700 group-hover/item:text-gray-900'}`}>
                              {t('search.engines.' + engine.id)}
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
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery) {
                    const query = searchQuery.trim();
                    const isUrl = query.includes('.') && !query.includes(' ');
                    if (isUrl) {
                      const url = query.startsWith('http') ? query : `https://${query}`;
                      window.location.href = url;
                    } else {
                      window.location.href = `${selectedSearchEngine.url}${encodeURIComponent(query)}`;
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Shortcut Grid - Hidden in Zen Mode */}
          {!isZenMode && (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-y-10 gap-x-6 w-full max-w-[1280px] justify-items-center mx-auto">
              {bookmarks?.map(bookmark => (
                <a 
                  key={bookmark.id} 
                  href={bookmark.url}
                  className="flex flex-col items-center group relative cursor-pointer no-underline w-full max-w-[90px]"
                  onContextMenu={(e) => handleContextMenu(e, bookmark)}
                >
                  <div className="w-18 h-18 bg-white rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 group-hover:shadow-xl transition-all duration-300 relative overflow-hidden shadow-lg border border-black/5">
                    {bookmark.icon ? (
                      <img src={bookmark.icon} alt="" className="w-full h-full object-cover" onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=128`;
                        (e.target as HTMLImageElement).className = "w-10 h-10 object-contain";
                      }} />
                    ) : (
                      <Globe size={32} className="text-gray-400" />
                    )}
                  </div>
                  <span className="text-[13px] text-white font-bold w-full truncate text-center px-1 drop-shadow-md">
                    {bookmark.title}
                  </span>
                </a>
              ))}

              <div 
                className="flex flex-col items-center group cursor-pointer w-full max-w-[90px]"
                onClick={() => {
                  setEditingBookmark(undefined);
                  setIsFormOpen(true);
                }}
              >
                <div className="w-18 h-18 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-3 group-hover:bg-white/30 group-hover:scale-105 transition-all duration-300 shadow-lg border border-white/20">
                  <Plus size={36} className="text-white/90" />
                </div>
                <span className="text-[13px] text-white font-bold drop-shadow-md">{t('common.add')}</span>
              </div>
            </div>
          )}

          {/* Zen Mode Bottom Widgets */}
          {isZenMode && (
            <div className="flex flex-col items-center w-full max-w-[1200px] mt-auto pb-12 gap-8">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <TodoWidget />
                <PomodoroWidget />
                <NoteWidget />
                <div className="flex flex-col gap-6">
                  <QuoteWidget />
                  {/* More Zen widgets can go here */}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer & Actions */}
      <div className="fixed bottom-6 right-6 flex items-center gap-3 z-40">
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/30 text-white text-sm font-bold transition-all shadow-lg active:scale-95 group"
        >
          <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
          <span>{t('common.settings')}</span>
        </button>
      </div>

      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
        <div className="flex items-center gap-2 px-4 py-2 bg-black/10 backdrop-blur-sm rounded-full border border-white/5 transition-opacity hover:opacity-100 opacity-60">
          <span className="text-[11px] text-white/80 font-medium tracking-wide">
            © {new Date().getFullYear()} On Tab · 
            <span className="text-white font-bold ml-1">{t('footer.developedBy', { name: t('settings.labels.authorName') })}</span>
          </span>
          <div className="w-[1px] h-3 bg-white/10 mx-1" />
          <button 
            onClick={() => {
              setInitialSettingsTab('contact');
              setIsSettingsOpen(true);
            }}
            className="text-[11px] text-white/60 hover:text-white transition-colors no-underline font-medium"
          >
            {t('common.contact')}
          </button>
          <div className="w-[1px] h-3 bg-white/10 mx-1" />
          <button 
            onClick={() => {
              setInitialSettingsTab('about');
              setIsSettingsOpen(true);
            }}
            className="text-[11px] text-white/60 hover:text-white transition-colors no-underline font-medium"
        >
          {t('common.privacy')}
        </button>
        </div>
      </footer>

      {/* Modals */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white/80 backdrop-blur-2xl rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-white/40">
            <div className="p-6 border-b border-white/20 flex items-center justify-between bg-white/20">
              <h3 className="text-xl font-bold text-gray-800">
                {editingCategory ? t('category.editTitle') : t('category.addTitle')}
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{t('category.nameLabel')}</label>
                <input
                  type="text" autoFocus placeholder={t('category.namePlaceholder')}
                  className="block w-full bg-white/50 border border-white/40 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-gray-800 font-medium"
                  value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveCategory()}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{t('category.iconLabel')}</label>
                <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 no-scrollbar">
                  {CATEGORY_ICONS.map((icon) => {
                    const IconComp = icon.icon;
                    return (
                      <button
                        key={icon.id} onClick={() => setSelectedIconId(icon.id)}
                        className={`p-3 rounded-xl flex items-center justify-center transition-all ${selectedIconId === icon.id ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-white/40 text-gray-500 hover:bg-white/60 border border-white/20'}`}
                        title={t('category.icons.' + icon.id)}
                      >
                        <IconComp size={20} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/30 border-t border-white/20 flex gap-3">
              <button onClick={() => setIsCategoryModalOpen(false)} className="flex-1 px-4 py-3 text-gray-700 font-bold hover:bg-black/5 rounded-xl transition-all">{t('common.cancel')}</button>
              <button onClick={handleSaveCategory} className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95">{t('common.save')}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        type="danger"
      />

      {isFormOpen && (
        <BookmarkForm 
          onClose={() => {
            setIsFormOpen(false);
            setEditingBookmark(undefined);
          }} 
          onSave={() => {}} 
          initialData={editingBookmark}
        />
      )}
      
      {isAuthOpen && (
        <AuthModal onClose={() => setIsAuthOpen(false)} onSuccess={() => handleSync()} />
      )}

      <CalendarModal 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)} 
      />
      
      {isSettingsOpen && (
        <SettingsModal 
          onClose={() => setIsSettingsOpen(false)} 
          user={user}
          onUserUpdate={(updatedUser) => setUser(updatedUser)}
          onAuthOpen={() => { setIsSettingsOpen(false); setIsAuthOpen(true); }}
          currentWallpaper={wallpaper}
          initialTab={initialSettingsTab}
          onWallpaperChange={(url) => {
            setWallpaper(url);
            localStorage.setItem('app-wallpaper', url);
            showToast(t('toast.wallpaperUpdated'), 'success');
          }}
        />
      )}
      
      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} y={contextMenu.y} bookmark={contextMenu.bookmark}
          categories={categories} onClose={() => setContextMenu(null)}
          onEdit={handleEdit} onDelete={handleDelete} onChangeCategory={handleChangeCategory}
        />
      )}
      
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

export default App;

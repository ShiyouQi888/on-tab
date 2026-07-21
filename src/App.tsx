import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { db, type Bookmark, type Category } from './db/db';
import type { AppUser, ConfirmConfig, SearchEngine } from './types';
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
import { SearchBar } from './components/SearchBar';
import { ClockWidget } from './components/ClockWidget';
import { Sidebar } from './components/Sidebar';
import { BookmarkGrid } from './components/BookmarkGrid';
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

const SEARCH_ENGINES: SearchEngine[] = [
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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIconId, setSelectedIconId] = useState('home');
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | undefined>();
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, bookmark: Bookmark } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedSearchEngine, setSelectedSearchEngine] = useState(SEARCH_ENGINES[0]);
  const [isSearchEngineMenuOpen, setIsSearchEngineMenuOpen] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const userAvatar = user?.user_metadata?.avatar_url;

  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
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
    let attempts = 0;
    const maxAttempts = 20;
    while (nextWallpaper === wallpaper && attempts < maxAttempts) {
      nextWallpaper = curatedWallpapers[Math.floor(Math.random() * curatedWallpapers.length)];
      attempts++;
    }
    
    setWallpaper(nextWallpaper);
    localStorage.setItem('app-wallpaper', nextWallpaper);
    showToast(t('toast.wallpaperUpdated'), 'info');
  };

  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>({
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

  const handleEditCategory = (cat: Category) => {
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
      
      {/* Wallpaper Pull Rope (支持鼠标+触屏) */}
      <div 
        className="fixed top-0 right-48 z-[60] flex flex-col items-center cursor-ns-resize group touch-none select-none"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setIsPulling(true);
          const startY = e.clientY;
          const onPointerMove = (moveEvent: PointerEvent) => {
            const dist = Math.max(0, Math.min(150, moveEvent.clientY - startY));
            setPullDistance(dist);
          };
          const onPointerUp = (upEvent: PointerEvent) => {
            const finalDist = upEvent.clientY - startY;
            if (finalDist > 100) {
              changeRandomWallpaper();
            }
            setPullDistance(0);
            setIsPulling(false);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
          };
          window.addEventListener('pointermove', onPointerMove);
          window.addEventListener('pointerup', onPointerUp);
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
        <Sidebar
          user={user}
          userAvatar={userAvatar}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          syncing={syncing}
          onCategorySelect={setSelectedCategoryId}
          onAddCategory={() => {
            setEditingCategory(null);
            setNewCategoryName('');
            setSelectedIconId('home');
            setIsCategoryModalOpen(true);
          }}
          onEditCategory={handleEditCategory}
          onAuthOpen={() => setIsAuthOpen(true)}
          onSettingsOpen={() => setIsSettingsOpen(true)}
          onSync={handleSync}
          getCategoryIcon={getCategoryIcon}
        />
      )}

      {/* Main Content Area */}
      <div className={`w-full flex flex-row items-start justify-center gap-12 relative z-10 pt-[5vh] pr-8 transition-all duration-300 ${isZenMode ? 'pl-8' : 'pl-24'}`}>
        <main className={`flex-1 flex flex-col items-center justify-start max-w-[1200px] w-full px-4 transition-all duration-300 ${isZenMode ? 'h-[90vh]' : ''}`}>
          {/* Large Clock (独立组件，1s 刷新不触发 App 重渲染) */}
          <ClockWidget
            locale={i18n.language}
            weather={weather}
            onCalendarOpen={() => setIsCalendarOpen(true)}
          />

          {/* Search Bar */}
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedEngine={selectedSearchEngine}
            onEngineChange={(engine) => {
              setSelectedSearchEngine(engine);
              setIsSearchEngineMenuOpen(false);
            }}
            isEngineMenuOpen={isSearchEngineMenuOpen}
            onEngineMenuToggle={setIsSearchEngineMenuOpen}
            engines={SEARCH_ENGINES}
          />

          {/* Shortcut Grid - Hidden in Zen Mode */}
          {!isZenMode && (
            <BookmarkGrid
              bookmarks={bookmarks}
              onAdd={() => {
                setEditingBookmark(undefined);
                setIsFormOpen(true);
              }}
              onContextMenu={handleContextMenu}
            />
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

      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 hidden md:block">
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

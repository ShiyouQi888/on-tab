import React, { useRef, useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { migrationService } from '../services/migrationService';
import { bookmarkService } from '../services/bookmarkService';
import { authService } from '../services/authService';
import { ConfirmModal } from './ConfirmModal';
import { AuthModal } from './AuthModal';
import { 
  Download, 
  Upload, 
  Import, 
  X, 
  FolderPlus, 
  Trash2, 
  Tag, 
  Settings, 
  ShieldCheck, 
  Database, 
  Info,
  ChevronRight,
  Monitor,
  User,
  LogOut,
  Mail,
  MessageSquare,
  Handshake,
  ExternalLink,
  GripVertical,
  Palette,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  user: any;
  onAuthOpen: () => void;
  currentWallpaper: string;
  onWallpaperChange: (url: string) => void;
}

const SortableCategoryItem = ({ cat, onDelete }: { cat: any, onDelete: (id: string) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: cat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`flex items-center justify-between p-4 bg-gray-50 rounded-xl group hover:bg-blue-50/50 hover:border-blue-100 border border-transparent transition-all ${isDragging ? 'shadow-lg ring-2 ring-blue-500/20 bg-white opacity-80' : ''}`}
    >
      <div className="flex items-center gap-4 flex-1">
        <div 
          {...attributes} 
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-gray-300 hover:text-gray-500 transition-colors"
        >
          <GripVertical size={18} />
        </div>
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-400 group-hover:text-blue-500 shadow-sm transition-colors">
          <Tag size={18} />
        </div>
        <span className="font-bold text-gray-700 group-hover:text-gray-900">{cat.name}</span>
      </div>
      <button 
        onClick={() => onDelete(cat.id)}
        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        title="删除分类"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, user, onAuthOpen, currentWallpaper, onWallpaperChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wallpaperFileRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [activeTab, setActiveTab] = useState<'categories' | 'appearance' | 'migration' | 'feedback' | 'business' | 'contact' | 'about'>('categories');
  const [customWallpaper, setCustomWallpaper] = useState(currentWallpaper);

  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('图片大小不能超过 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setCustomWallpaper(base64);
        onWallpaperChange(base64);
      };
      reader.readAsDataURL(file);
    }
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const cats = await bookmarkService.getAllCategories();
    setCategories(cats);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id);
      const newIndex = categories.findIndex((cat) => cat.id === over.id);

      const newCategories = arrayMove(categories, oldIndex, newIndex);
      setCategories(newCategories);

      try {
        await bookmarkService.updateCategoriesOrder(newCategories.map(c => c.id));
      } catch (err) {
        console.error('Failed to update categories order:', err);
        loadCategories(); // Rollback on error
      }
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    await bookmarkService.addCategory(newCategoryName.trim());
    setNewCategoryName('');
    loadCategories();
  };

  const handleDeleteCategory = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: '红色警告',
      message: '确定要删除此分类吗？删除后，该分类下的书签将变为“未分类”，此操作不可撤销。',
      onConfirm: async () => {
        await bookmarkService.deleteCategory(id);
        loadCategories();
      }
    });
  };

  const handleBrowserImport = async () => {
    try {
      const count = await migrationService.importFromBrowser();
      alert(`成功导入 ${count} 个书签`);
    } catch (err: any) {
      alert('导入失败: ' + err.message);
    }
  };

  const handleExportJSON = async () => {
    await migrationService.exportToJSON();
  };

  const handleExportHTML = async () => {
    await migrationService.exportToHTML();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const count = await migrationService.importFromJSON(file);
        alert(`成功导入 ${count} 个书签`);
        onClose();
      } catch (err: any) {
        alert('导入失败: ' + err.message);
      }
    }
  };

  const tabs = [
    { id: 'categories', label: '分类管理', icon: Tag },
    { id: 'appearance', label: '外观设置', icon: Palette },
    { id: 'migration', label: '数据迁移', icon: Database },
    { id: 'business', label: '商务合作', icon: Handshake },
    { id: 'contact', label: '联系我们', icon: Mail },
    { id: 'feedback', label: '问题反馈', icon: MessageSquare },
    { id: 'about', label: '关于应用', icon: Info },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col md:flex-row h-[600px]">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <Settings size={22} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">设置中心</h2>
          </div>

          <nav className="flex-1 space-y-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm border border-gray-100'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight size={14} className="ml-auto" />}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-200 px-2">
            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck size={14} />
              数据安全保障
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative">
          {/* Top Auth Header */}
          <div className="pl-8 pr-14 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <User size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">已登录账户</div>
                    <div className="text-sm font-bold text-gray-700 truncate max-w-[200px]">{user.email}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <User size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">未登录</div>
                    <div className="text-sm font-bold text-gray-500">登录后同步数据</div>
                  </div>
                </>
              )}
            </div>
            
            {user ? (
              <button 
                onClick={() => authService.signOut()}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <LogOut size={14} />
                退出登录
              </button>
            ) : (
              <button 
                onClick={onAuthOpen}
                className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
              >
                立即登录
              </button>
            )}
          </div>

          <button 
            onClick={onClose} 
            className="absolute top-3.5 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 z-10"
          >
            <X size={20} />
          </button>

          <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
            {activeTab === 'categories' && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">分类管理</h3>
                <p className="text-gray-500 text-sm mb-8">管理您的书签分类，让导航更有序。</p>

                <div className="flex gap-3 mb-8">
                  <input 
                    type="text" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="输入新分类名称..."
                    className="flex-1 px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <button 
                    onClick={handleAddCategory}
                    className="px-6 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2 active:scale-95"
                  >
                    <FolderPlus size={18} />
                    添加
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext 
                      items={categories.map(c => c.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {categories.map(cat => (
                        <SortableCategoryItem 
                          key={cat.id} 
                          cat={cat} 
                          onDelete={handleDeleteCategory} 
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                  {categories.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <Tag size={32} />
                      </div>
                      <p className="text-gray-400 font-medium">暂无分类，快去添加一个吧</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                    <Palette size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">外观设置</h3>
                    <p className="text-sm text-gray-500">个性化您的浏览器主页外观</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <ImageIcon size={18} className="text-gray-400" />
                      <h4 className="font-bold text-gray-700">背景壁纸</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          value={customWallpaper}
                          onChange={(e) => setCustomWallpaper(e.target.value)}
                          placeholder="输入壁纸图片 URL..."
                          className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                        />
                        <button 
                          onClick={() => onWallpaperChange(customWallpaper)}
                          className="px-6 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-md shadow-purple-100 text-sm"
                        >
                          应用
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button 
                          onClick={() => wallpaperFileRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
                        >
                          <Upload size={16} className="text-purple-600" />
                          上传本地图片
                        </button>
                        <input 
                          type="file" 
                          ref={wallpaperFileRef}
                          onChange={handleWallpaperUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => {
                              // Randomly picked from curated list in App.tsx logic 
                              // we just show a tip here since the logic is in parent
                            }}
                            className="flex items-center gap-2 text-sm text-purple-600 font-bold hover:bg-purple-50 px-3 py-2 rounded-lg transition-all"
                          >
                            <RefreshCw size={16} />
                            提示：点击页面顶部的“拉绳”可随机更换
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-bold">当前预览</p>
                        <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-white shadow-md bg-gray-200">
                          <img 
                            src={customWallpaper} 
                            alt="Wallpaper Preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800';
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'migration' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Database size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">数据迁移</h3>
                    <p className="text-sm text-gray-500">备份、导出或从浏览器导入您的书签数据</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                        <Download size={20} />
                      </div>
                    </div>
                    <h4 className="font-bold text-gray-800 mb-1">导出 JSON</h4>
                    <p className="text-xs text-gray-500 mb-4">将所有书签导出为标准 JSON 文件</p>
                    <button 
                      onClick={handleExportJSON}
                      className="w-full py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                    >
                      立即导出
                    </button>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-green-200 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm group-hover:scale-110 transition-transform">
                        <Upload size={20} />
                      </div>
                    </div>
                    <h4 className="font-bold text-gray-800 mb-1">导入 JSON</h4>
                    <p className="text-xs text-gray-500 mb-4">从备份的 JSON 文件中恢复书签</p>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all"
                    >
                      选择文件
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".json"
                      onChange={handleFileImport}
                    />
                  </div>

                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-purple-200 transition-all group md:col-span-2">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-purple-600 shadow-sm group-hover:scale-110 transition-transform">
                        <Import size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">从浏览器导入</h4>
                        <p className="text-xs text-gray-500">一键同步当前浏览器的收藏夹书签</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleBrowserImport}
                      className="w-full py-3 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all"
                    >
                      开始扫描并导入
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'business' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Handshake size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">商务合作</h3>
                    <p className="text-sm text-gray-500">资源互换、技术合作或商务推广</p>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    如果您有商务推广、资源互换或技术合作意向，欢迎随时联系我们的团队：
                  </p>
                  <div className="p-4 bg-white rounded-xl border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">合作邮箱</span>
                      <span className="font-bold text-gray-800 select-all">biz@example.com</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">响应时间</span>
                      <span className="font-bold text-gray-800">1-3 个工作日</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">联系我们</h3>
                    <p className="text-sm text-gray-500">获取官方支持或加入我们的社区</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm shrink-0">
                          <MessageSquare size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 mb-1">微信客服</p>
                          <p className="text-sm text-gray-500">搜索 ID: <span className="text-gray-800 font-medium select-all">Navigation_Assistant</span></p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                          <Mail size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 mb-1">客服邮箱</p>
                          <p className="text-sm text-gray-500 select-all font-medium text-gray-800">support@example.com</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm shrink-0">
                          <Info size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 mb-1">办公地址</p>
                          <p className="text-sm text-gray-500 leading-relaxed">上海市浦东新区某某科技园 A1 座</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">问题反馈</h3>
                    <p className="text-sm text-gray-500">提交 Bug 或是功能建议</p>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    遇到 Bug 或是想要新功能？我们非常重视每一位用户的建议。请通过以下方式告诉我们：
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a href="mailto:feedback@example.com" className="flex items-center justify-center gap-3 p-4 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-700 hover:border-orange-200 hover:bg-orange-50 transition-all group">
                      <Mail size={18} className="text-orange-500 group-hover:scale-110 transition-transform" />
                      发送邮件
                    </a>
                    <a href="https://github.com/your-repo/issues" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 p-4 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all group">
                      <ExternalLink size={18} className="text-gray-800 group-hover:scale-110 transition-transform" />
                      GitHub Issue
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">关于应用</h3>
                <p className="text-gray-500 text-sm mb-8">了解更多关于导航书签的信息。</p>

                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 text-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-[24px] flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-100">
                    <Monitor size={40} />
                  </div>
                  <h4 className="text-xl font-black text-gray-800 mb-2">导航书签</h4>
                  <p className="text-blue-600 font-bold text-sm mb-6">Version 1.0.0</p>
                  
                  <div className="space-y-4 text-left max-w-sm mx-auto">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck size={12} className="text-white" />
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">支持 IndexedDB 本地存储，您的数据永远保存在本地。</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <Database size={12} className="text-white" />
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">集成 Supabase 云同步，跨设备无缝访问书签。</p>
                    </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-gray-200">
                    <p className="text-xs text-gray-400 font-medium italic">
                      “ 让书签管理变得简单、高效、优雅 ”
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        type="danger"
      />
    </div>
  );
};

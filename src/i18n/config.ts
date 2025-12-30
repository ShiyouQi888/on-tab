import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      common: {
        confirm: 'Confirm',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        loading: 'Loading...',
        success: 'Success',
        error: 'Error',
        info: 'Info',
        warning: 'Warning',
        logout: 'Logout',
        login: 'Login',
        sync: 'Sync',
        settings: 'Settings',
        all: 'All',
        none: 'None',
        back: 'Back',
        home: 'Home',
        privacy: 'Privacy Policy',
        contact: 'Contact Us',
      },
      nav: {
        allBookmarks: 'All Bookmarks',
        addCategory: 'Add Category',
        settings: 'Settings',
        syncNow: 'Sync Now',
        switchLang: 'Switch Language',
      },
      search: {
        placeholder: 'Search bookmarks or enter URL',
        addEngine: 'Add Engine',
      },
      auth: {
        title: 'Cloud Sync',
        email: 'Email',
        password: 'Password',
        signIn: 'Sign In',
        signUp: 'Sign Up',
        syncDescription: 'Sync your bookmarks across all devices',
      },
      calendar: {
        holiday: 'Holiday',
        work: 'Work',
      },
      settings: {
        title: 'Settings Center',
        categories: 'Categories',
        sync: 'Sync',
        wallpaper: 'Wallpaper',
        about: 'About',
        language: 'Language',
        auto: 'Auto (System)',
        tabs: {
          categories: 'Categories',
          sync: 'Sync',
          wallpaper: 'Wallpaper',
          about: 'About',
        }
      },
      bookmark: {
        addTitle: 'Add Bookmark',
        editTitle: 'Edit Bookmark',
        titleLabel: 'Title',
        urlLabel: 'URL',
        categoryLabel: 'Category',
        deleteConfirm: 'Are you sure you want to delete this bookmark?',
        deleteWarning: 'This action cannot be undone.',
      },
      category: {
        addTitle: 'New Category',
        editTitle: 'Edit Category',
        nameLabel: 'Name',
        iconLabel: 'Icon',
        deleteConfirm: 'Are you sure you want to delete this category?',
        deleteWarning: 'Bookmarks in this category will be moved to "Uncategorized".',
      },
      toast: {
        syncSuccess: 'Sync successful, fetched {{count}} updates',
        syncFailed: 'Sync failed, please check your connection',
        bookmarkAdded: 'Bookmark added',
        bookmarkUpdated: 'Bookmark updated',
        bookmarkDeleted: 'Bookmark deleted',
        categoryAdded: 'Category added',
        categoryUpdated: 'Category updated',
        categoryDeleted: 'Category deleted',
        wallpaperUpdated: 'Wallpaper updated',
        swReady: 'Service Worker ready',
        swConnecting: 'Connecting to Service Worker...',
        switchCat: 'Switch to: {{name}}',
      }
    }
  },
  zh: {
    translation: {
      common: {
        confirm: '确定',
        cancel: '取消',
        save: '保存',
        delete: '删除',
        edit: '编辑',
        add: '添加',
        loading: '加载中...',
        success: '成功',
        error: '错误',
        info: '提示',
        warning: '警告',
        logout: '退出',
        login: '登录',
        sync: '同步',
        settings: '设置',
        all: '全部',
        none: '无',
        back: '返回',
        home: '首页',
        privacy: '隐私政策',
        contact: '联系我们',
      },
      nav: {
        allBookmarks: '全部书签',
        addCategory: '添加分类',
        settings: '设置',
        syncNow: '立即同步',
        switchLang: '切换语言',
      },
      search: {
        placeholder: '输入搜索内容或网址',
        addEngine: '添加引擎',
      },
      auth: {
        title: '云端同步',
        email: '邮箱地址',
        password: '密码',
        signIn: '登录',
        signUp: '注册',
        syncDescription: '在所有设备上同步您的书签',
      },
      calendar: {
        holiday: '休',
        work: '班',
      },
      settings: {
        title: '设置中心',
        categories: '分类管理',
        sync: '云端同步',
        wallpaper: '个性壁纸',
        about: '关于应用',
        language: '语言设置',
        auto: '跟随系统',
        tabs: {
          categories: '分类管理',
          sync: '云端同步',
          wallpaper: '个性壁纸',
          about: '关于应用',
        }
      },
      bookmark: {
        addTitle: '添加书签',
        editTitle: '编辑书签',
        titleLabel: '标题',
        urlLabel: '链接',
        categoryLabel: '分类',
        deleteConfirm: '确定要删除这个书签吗？',
        deleteWarning: '删除后将无法恢复。',
      },
      category: {
        addTitle: '新建分类',
        editTitle: '编辑分类',
        nameLabel: '分类名称',
        iconLabel: '选择图标',
        deleteConfirm: '确定要删除此分类吗？',
        deleteWarning: '删除分类后，该分类下的书签将变为“未分类”。',
      },
      toast: {
        syncSuccess: '同步成功，获取了 {{count}} 条更新',
        syncFailed: '同步失败，请检查网络连接',
        bookmarkAdded: '书签已添加',
        bookmarkUpdated: '书签已更新',
        bookmarkDeleted: '已删除书签',
        categoryAdded: '分类已添加',
        categoryUpdated: '分类已更新',
        categoryDeleted: '已删除分类',
        wallpaperUpdated: '壁纸已更换',
        swReady: 'Service Worker 已就绪',
        swConnecting: 'Service Worker 尝试连接中...',
        switchCat: '切换至：{{name}}',
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage'],
    }
  });

export default i18n;

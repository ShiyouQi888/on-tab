import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'placeholder';

// 自定义存储适配器，支持在扩展程序的背景脚本（Service Worker）和页面中共享登录状态
const isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

const chromeStorageAdapter = {
  getItem: async (key: string) => {
    const result = await chrome.storage.local.get([key]);
    const value = result[key];
    return typeof value === 'string' ? value : null;
  },
  setItem: async (key: string, value: string) => {
    await chrome.storage.local.set({ [key]: value });
  },
  removeItem: async (key: string) => {
    await chrome.storage.local.remove(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isExtension ? chromeStorageAdapter : localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

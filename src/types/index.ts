// 用户类型定义
export interface AppUser {
  id: string;
  email?: string;
  user_metadata?: {
    avatar_url?: string;
    [key: string]: unknown;
  };
}

// 同步状态
export type SyncStatus = 'synced' | 'pending' | 'error';

// 确认弹窗配置
export interface ConfirmConfig {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

// 搜索引擎配置
export interface SearchEngine {
  id: string;
  url: string;
  icon: string;
}

// Toast 消息
export interface ToastMessage {
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

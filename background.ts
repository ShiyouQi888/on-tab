import { syncService } from './src/services/syncService';

// Service Worker for DaoHangShuQian

// 监听插件图标点击事件
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'index.html' });
});

// 设置定时同步闹钟 (每 1 小时同步一次)
chrome.alarms.create('periodic-sync', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'periodic-sync') {
    console.log('DaoHangShuQian: 执行定时后台同步...');
    syncService.sync().catch(err => console.error('Background sync failed:', err));
  }
});

// 监听安装事件
chrome.runtime.onInstalled.addListener((details) => {
  console.log('DaoHangShuQian: Service Worker Installed', details.reason);
  // 安装后立即执行一次同步
  syncService.sync().catch(err => console.error('Initial sync failed:', err));
});

// 消息监听器
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PING') {
    sendResponse({ type: 'PONG', timestamp: Date.now() });
    return false;
  }
  
  if (message.type === 'REQUEST_SYNC') {
    console.log('DaoHangShuQian: 收到手动同步请求');
    syncService.sync()
      .then(count => sendResponse({ success: true, pulledCount: count }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // 保持通道开启以进行异步响应
  }
  
  return false;
});

// 捕获未处理的错误
self.addEventListener('error', (event: any) => {
  console.error('DaoHangShuQian: Service Worker Error', event.error);
});

console.log('DaoHangShuQian: Service Worker Initialized');

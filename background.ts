import { syncService } from './src/services/syncService';

// 解决 CRXJS 在 Service Worker 中 HMR 报错 (location.reload is not a function)
if (typeof self !== 'undefined' && self.location) {
  try {
    if (!('reload' in self.location)) {
      Object.defineProperty(self.location, 'reload', {
        value: () => {
          console.log('CRXJS: HMR reload requested, but location.reload is not available in Service Worker.');
        },
        writable: true,
        configurable: true
      });
    }
  } catch (e) {
    // 如果无法定义在 location 上，尝试定义在 self 上作为后备
    if (!('reload' in self)) {
      (self as any).reload = () => {
        console.log('CRXJS: HMR reload requested (fallback), ignoring...');
      };
    }
  }
}

// Service Worker for On Tab

// 监听插件图标点击事件
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'index.html' });
});

// 设置定时同步闹钟 (每 1 小时同步一次)
chrome.alarms.create('periodic-sync', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'periodic-sync') {
    console.log('On Tab: 执行定时后台同步...');
    syncService.sync().catch(err => console.error('Background sync failed:', err));
  }
});

// 监听安装事件
chrome.runtime.onInstalled.addListener((details) => {
  console.log('On Tab: Service Worker Installed', details.reason);
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
    console.log('On Tab: 收到手动同步请求');
    syncService.sync()
      .then(count => sendResponse({ success: true, pulledCount: count }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // 保持通道开启以进行异步响应
  }
  
  return false;
});

// 捕获未处理的错误
self.addEventListener('error', (event: any) => {
  console.error('On Tab: Service Worker Error', event.error);
});

console.log('On Tab: Service Worker Initialized');

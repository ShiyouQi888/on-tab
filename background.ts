// Service Worker for DaoHangShuQian

// 监听安装事件
chrome.runtime.onInstalled.addListener((details) => {
  console.log('DaoHangShuQian: Service Worker Installed', details.reason);
});

// 监听启动事件
chrome.runtime.onStartup.addListener(() => {
  console.log('DaoHangShuQian: Service Worker Starting Up...');
});

// 消息监听器
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('DaoHangShuQian: Message received', message);
  
  if (message.type === 'PING') {
    sendResponse({ type: 'PONG', timestamp: Date.now() });
    return false; // 同步响应
  }
  
  // 如果需要异步响应，返回 true
  return false;
});

// 捕获未处理的错误
self.addEventListener('error', (event: any) => {
  console.error('DaoHangShuQian: Service Worker Error', event.error);
});

console.log('DaoHangShuQian: Service Worker Initialized');

# 导航书签 (DaoHangShuQian)

一个功能完善的现代浏览器书签导航插件，支持本地存储与 Supabase 云端同步。

## 🚀 核心功能

- **本地存储**: 使用 IndexedDB (Dexie.js) 支持海量数据存储，即使离线也能正常使用。
- **云端同步**: 集成 Supabase，支持多端数据实时同步。
- **身份认证**: 支持邮箱/密码登录及注册。
- **智能搜索**: 支持标题、URL、标签和备注的实时防抖搜索。
- **数据迁移**:
  - 一键从浏览器原生书签导入。
  - 支持导出/导入 JSON 格式备份。
- **现代 UI**: 基于 React + Tailwind CSS 构建，提供流畅的交互体验。

## 🛠️ 技术栈

- **Frontend**: React, TypeScript, Tailwind CSS
- **Build Tool**: Vite, CRXJS (Vite Plugin for Chrome Extensions)
- **Database**: IndexedDB (via Dexie.js), Supabase (PostgreSQL)
- **Icons**: Lucide React

## 📦 安装与开发

### 1. 克隆项目
```bash
git clone <repository-url>
cd daohangshuqian
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置
在根目录创建 `.env` 文件：
```env
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名Key
```

### 4. 开发运行
```bash
npm run dev
```

### 5. 构建插件
```bash
npm run build
```
构建完成后，在 Chrome 浏览器打开 `chrome://extensions/`，开启“开发者模式”，选择“加载已解压的扩展程序”，选中 `dist` 目录。

## 📖 API 文档 (核心服务)

### `bookmarkService`
- `addBookmark(data)`: 添加新书签。
- `updateBookmark(id, updates)`: 更新现有书签。
- `deleteBookmark(id)`: 软删除书签（标记为已删除以供同步）。
- `getBookmarks(options)`: 获取书签列表，支持搜索和过滤。

### `syncService`
- `sync()`: 触发手动同步，包含 Push 和 Pull 流程。
- `subscribeToChanges(userId, callback)`: 订阅 Supabase 实时变更。

### `migrationService`
- `importFromBrowser()`: 从浏览器原生书签树导入数据。
- `exportToJSON()`: 导出所有非删除书签为 JSON 文件。
- `importFromJSON(file)`: 从 JSON 文件恢复数据。

## 🔐 安全与优化
- **HTTPS**: 所有云端通信均通过加密通道。
- **防抖处理**: 搜索操作已实现 300ms 防抖，减少数据库查询负担。
- **软删除策略**: 确保在多端同步过程中不会意外丢失数据。

## 📝 许可证
MIT

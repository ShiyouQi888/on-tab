/**
 * 搜索/URL 导航工具
 * 健壮的输入识别：区分真实 URL 和搜索词，避免误判导致 404
 */

/** 常见顶级域名集合，用于识别 domain-like 输入 */
const COMMON_TLDS = new Set([
  'com', 'org', 'net', 'edu', 'gov', 'mil', 'int',
  'io', 'dev', 'app', 'ai', 'co', 'cc', 'me', 'tv', 'gg',
  'cn', 'uk', 'de', 'jp', 'fr', 'ru', 'kr', 'br', 'in',
  'ca', 'au', 'es', 'it', 'nl', 'se', 'no', 'pl', 'ch',
  'xyz', 'top', 'tech', 'online', 'site', 'shop', 'blog',
]);

/** 国际域名后缀（如 co.uk, com.cn 等） */
const MULTI_PART_TLDS = new Set([
  'co.uk', 'co.jp', 'co.kr', 'co.in', 'com.cn', 'com.br',
  'com.au', 'org.uk', 'net.au', 'ac.uk', 'gov.uk',
]);

/**
 * 尝试用 URL 构造函数验证是否为合法 http/https URL
 * 补充一些常见的域名模式检测
 */
function isValidHttpUrl(str: string): boolean {
  // 必须以 http:// 或 https:// 开头
  if (!/^https?:\/\//i.test(str)) return false;

  try {
    const url = new URL(str);
    // 只允许 http/https 协议
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    // 必须有有效的 hostname（至少含一个点或为 localhost）
    if (!url.hostname || url.hostname === '') return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * 检测输入是否像是一个有效的域名（用于不带协议的输入）
 * 例如：github.com → true, v1.2 → false, react.js → false
 */
function looksLikeDomain(str: string): boolean {
  // 去除协议前缀、路径、端口
  const noProtocol = str.replace(/^https?:\/\//i, '');
  const hostPart = noProtocol.split(/[/?#]/)[0];
  const portRemoved = hostPart.split(':')[0];

  // 必须先检测 IP 地址（否则会被下面 TLD 检查误杀）
  if (isIPv4(portRemoved)) return true;

  // 必须包含点
  if (!portRemoved.includes('.')) return false;

  const parts = portRemoved.split('.');

  // 最少 2 段（例如 domain.com）
  if (parts.length < 2) return false;

  // 检查是否至少有一段看起来像 TLD
  const lastPart = parts[parts.length - 1].toLowerCase();
  const lastTwoParts = parts.slice(-2).join('.').toLowerCase();

  const hasValidTLD =
    COMMON_TLDS.has(lastPart) || MULTI_PART_TLDS.has(lastTwoParts);

  if (!hasValidTLD) return false;

  // 检查"域名"部分不以纯数字开头（排除 v1.2 这类版本号）
  const domainPart = parts[parts.length - 2];
  if (/^\d+$/.test(domainPart)) return false;

  // 域名部分长度合理
  if (domainPart.length < 1 || domainPart.length > 63) return false;

  return true;
}

/** 严格 IPv4 校验 */
function isIPv4(host: string): boolean {
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = host.match(ipv4Regex);
  if (!match) return false;
  return match.slice(1).every(octet => {
    const num = parseInt(octet, 10);
    return num >= 0 && num <= 255;
  });
}

/**
 * 检测输入是否为 localhost 或局域网地址
 */
function isLocalhostOrPrivate(str: string): boolean {
  const host = str.replace(/^https?:\/\//i, '').split(/[/?#]/)[0].split(':')[0];
  return host === 'localhost' || host === '127.0.0.1';
}

/**
 * 搜索动作结果
 */
export interface SearchResult {
  /** 最终跳转的 URL */
  targetUrl: string;
  /** 导航方式: 'url' 直接打开 | 'search' 搜索引擎搜索 */
  mode: 'url' | 'search';
}

/**
 * 核心方法：分析用户输入，返回最终跳转 URL
 *
 * 判断优先级：
 * 1. 完整 http/https URL → 直接打开
 * 2. 像域名的字符串（如 github.com）→ 补 https:// 后打开
 * 3. localhost → 补 http:// 后打开
 * 4. 其余一律走搜索引擎搜索（含 encodeURIComponent 编码）
 *
 * @param input   用户输入（未 trim）
 * @param searchEngineUrl  搜索引擎 URL 模板，如 "https://www.bing.com/search?q="
 */
export function resolveSearchInput(input: string, searchEngineUrl: string): SearchResult {
  const query = input.trim();

  if (!query) {
    // 空输入不处理，返回空字符串
    return { targetUrl: '', mode: 'search' };
  }

  // 1. 已经是完整 URL
  if (isValidHttpUrl(query)) {
    return { targetUrl: sanitizeUrl(query), mode: 'url' };
  }

  // 2. 看起来像域名
  if (looksLikeDomain(query)) {
    return { targetUrl: sanitizeUrl(`https://${query}`), mode: 'url' };
  }

  // 3. localhost
  if (isLocalhostOrPrivate(query)) {
    const proto = query.startsWith('http') ? '' : 'http://';
    return { targetUrl: sanitizeUrl(`${proto}${query}`), mode: 'url' };
  }

  // 4. 默认搜索引擎搜索
  return {
    targetUrl: `${searchEngineUrl}${encodeURIComponent(query)}`,
    mode: 'search',
  };
}

/**
 * URL 安全清洗：防止 javascript: / data: 等危险协议
 */
function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const protocol = parsed.protocol.replace(/:$/, '').toLowerCase();

    const allowedProtocols = ['http', 'https'];
    if (!allowedProtocols.includes(protocol)) {
      return `https://${url.replace(/^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//, '')}`;
    }

    return url;
  } catch {
    // URL 解析失败，强制走 https
    return `https://${url.replace(/^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//, '')}`;
  }
}

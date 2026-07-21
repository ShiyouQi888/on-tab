/**
 * searchUtils 行为测试
 * 验证各种输入场景下的正确输出
 */
import { resolveSearchInput } from '../utils/searchUtils';

const ENGINE_URL = 'https://www.bing.com/search?q=';

/** 辅助函数：断言两个值相等 */
function assert(actual: unknown, expected: unknown, label: string) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    console.error(`❌ FAIL: ${label}`);
    console.error(`   expected: ${JSON.stringify(expected)}`);
    console.error(`   actual:   ${JSON.stringify(actual)}`);
  } else {
    console.log(`✅ PASS: ${label}`);
  }
  return ok;
}

let passed = 0;
let failed = 0;

function runTest(label: string, input: string, expectedMode: 'url' | 'search') {
  const result = resolveSearchInput(input, ENGINE_URL);
  const ok = assert(result.mode, expectedMode, `"${input}" → ${expectedMode}`);
  if (ok) passed++; else failed++;
  return result;
}

// ============ 应识别为域名/URL ============
runTest('完整 https URL', 'https://github.com', 'url');
runTest('完整 http URL', 'http://example.com/path', 'url');
runTest('常见域名 .com', 'github.com', 'url');
runTest('常见域名 .io', 'vercel.io', 'url');
runTest('域名带路径', 'github.com/ShiyouQi888/on-tab', 'url');
runTest('localhost', 'localhost:3000', 'url');
runTest('IP 地址', '192.168.1.1', 'url');
runTest('域名 .org', 'example.org', 'url');
runTest('域名 .net', 'something.net', 'url');
runTest('中国域名 .cn', 'baidu.cn', 'url');
runTest('多段 TLD', 'bbc.co.uk', 'url');

// ============ 不应识别为 URL，应走搜索 ============
runTest('版本号风格', 'v1.2.3', 'search');
runTest('文件名风格', 'file.txt', 'search');
runTest('JS 库名', 'react.js', 'search');
runTest('普通搜索词', 'hello world', 'search');
runTest('中文搜索', '你好世界', 'search');
runTest('特殊字符搜索', 'C++ 教程', 'search');
runTest('带空格和点', 'my.file.txt', 'search');
runTest('单段无 TLD', 'something', 'search');
runTest('纯数字', '123', 'search');
runTest('空字符串', '', 'search');

console.log(`\n==========`);
console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
if (failed > 0) {
  console.error('Some tests FAILED!');
  process.exit(1);
} else {
  console.log('All tests passed! 🎉');
}

import fs from 'fs';

// Netlify 的 Supabase 集成通常会自动注入 SUPABASE_URL 和 SUPABASE_ANON_KEY
// 但 Vite 默认只识别以 VITE_ 开头的变量。
// 这个脚本会在构建时将 Netlify 的变量转换为 .env 文件，以便 Vite 识别。

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.SUPABASE_ANON_KEY;

console.log('--- 环境检查 ---');
console.log('SUPABASE_URL exists:', !!process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY exists:', !!process.env.SUPABASE_ANON_KEY);
console.log('VITE_SUPABASE_URL exists:', !!process.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY exists:', !!process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY);

if (supabaseUrl && supabaseKey) {
  const envContent = `VITE_SUPABASE_URL=${supabaseUrl}\nVITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=${supabaseKey}\n`;
  fs.writeFileSync('.env', envContent);
  fs.writeFileSync('.env.local', envContent); // 同时生成 .env.local 确保 Vite 优先级
  console.log('✅ 已成功生成 .env 和 .env.local 文件');
} else {
  console.error('❌ 错误: 未能在环境变量中找到 Supabase 配置！');
  console.log('请确保在 Netlify 后台设置了 VITE_SUPABASE_URL 和 VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY');
}


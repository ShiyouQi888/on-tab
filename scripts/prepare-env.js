import fs from 'fs';

// Netlify 的 Supabase 集成通常会自动注入 SUPABASE_URL 和 SUPABASE_ANON_KEY
// 但 Vite 默认只识别以 VITE_ 开头的变量。
// 这个脚本会在构建时将 Netlify 的变量转换为 .env 文件，以便 Vite 识别。

console.log('--- 环境检查 ---');
Object.keys(process.env).forEach(key => {
  if (key.includes('SUPABASE')) {
    console.log(`${key} exists: true (length: ${process.env[key].length})`);
  }
});

const supabaseUrl = 
  process.env.VITE_SUPABASE_URL || 
  process.env.SUPABASE_URL || 
  process.env.SUPABASE_REST_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL; // 兼容某些 Vercel 预设

const supabaseKey = 
  process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // 兼容某些 Vercel 预设


if (supabaseUrl && supabaseKey) {
  const envContent = `VITE_SUPABASE_URL=${supabaseUrl}\nVITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=${supabaseKey}\n`;
  // 在 Vite 构建时，.env 文件通常由 vite 自己加载
  // 但对于某些构建环境，我们需要直接将变量注入到 process.env 以确保 vite 插件能拿到
  process.env.VITE_SUPABASE_URL = supabaseUrl;
  process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY = supabaseKey;
  
  fs.writeFileSync('.env', envContent);
  fs.writeFileSync('.env.local', envContent);
  fs.writeFileSync('.env.production', envContent); // 增加 production 文件
  console.log('✅ 已成功生成 .env, .env.local 和 .env.production 文件');
} else {
  console.error('❌ 错误: 未能在环境变量中找到 Supabase 配置！');
  console.log('请确保在 Netlify 后台设置了 VITE_SUPABASE_URL 和 VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY');
}


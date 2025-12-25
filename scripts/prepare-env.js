import fs from 'fs';

// Netlify 的 Supabase 集成通常会自动注入 SUPABASE_URL 和 SUPABASE_ANON_KEY
// 但 Vite 默认只识别以 VITE_ 开头的变量。
// 这个脚本会在构建时将 Netlify 的变量转换为 .env 文件，以便 Vite 识别。

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (supabaseUrl && supabaseKey) {
  const envContent = `VITE_SUPABASE_URL=${supabaseUrl}\nVITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=${supabaseKey}\n`;
  fs.writeFileSync('.env', envContent);
  console.log('✅ 已成功根据 Netlify 环境变量生成 .env 文件');
  console.log(`URL: ${supabaseUrl}`);
} else {
  console.log('⚠️ 未检测到 SUPABASE_URL 或 SUPABASE_ANON_KEY 环境变量，跳过 .env 生成');
}

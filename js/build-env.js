const fs = require('fs');

// Đảm bảo lấy đúng các biến có tiền tố VITE_ từ Vercel
const envContent = `export const env = {
  SUPABASE_URL: "${process.env.VITE_SUPABASE_URL || ''}",
  SUPABASE_ANON_KEY: "${process.env.VITE_SUPABASE_ANON_KEY || ''}",
  GEMINI_API_KEY: "${process.env.VITE_GEMINI_API_KEY || ''}"
};`;

// Ghi file vào thư mục js/
fs.writeFileSync('./js/env.js', envContent);
console.log('✅ File js/env.js đã được tạo thành công!');
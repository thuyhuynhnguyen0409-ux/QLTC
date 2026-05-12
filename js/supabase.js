import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { env } from './env.js';

// Các biến này sẽ lấy giá trị VITE_ từ Vercel thông qua file env.js
const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("❌ Thiếu cấu hình Supabase! Kiểm tra lại biến VITE_ trên Vercel.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
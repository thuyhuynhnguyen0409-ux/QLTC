// js/supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Sử dụng giá trị trực tiếp nếu bạn không dùng Build Tool (Vite/Webpack)
const SUPABASE_URL = 'https://mojulicyvkrwoxbjpsem.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UPZNbtGZ7VnWzBtl7wyEmg_uyufvl-G'; // Kiểm tra lại key này trong Supabase Dashboard

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
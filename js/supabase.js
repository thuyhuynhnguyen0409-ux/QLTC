import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { env } from './env.js';

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("❌ Không tìm thấy thông tin cấu hình Supabase trong env.js");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
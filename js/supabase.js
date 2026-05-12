import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
// Sửa dòng này để đảm bảo luôn trỏ về đúng thư mục js ở gốc website
import { env } from '/js/env.js'; 

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
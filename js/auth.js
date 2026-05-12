// js/auth.js
import { supabase } from './supabase.js'; // Vì cùng nằm trong thư mục js/

export async function loginWithEmail(email) {
    try {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                // Đảm bảo URL này đã được thêm vào Redirect URLs trong Supabase Dashboard
                emailRedirectTo: window.location.origin + '/index.html'
            }
        });

        if (error) throw error;
        alert('Đã gửi link đăng nhập thành công! Vui lòng kiểm tra hộp thư đến (hoặc Spam).');
    } catch (err) {
        console.error("Lỗi đăng nhập:", err);
        alert('Lỗi: ' + err.message);
    }
}

export async function logout() {
    await supabase.auth.signOut();
    window.location.href = './auth.html';
}

export async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = './auth.html';
        return null;
    }
    return session.user;
}
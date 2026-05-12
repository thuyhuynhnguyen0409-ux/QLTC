// js/auth.js
import { supabase } from './supabase.js'; // Vì cùng nằm trong thư mục js/

export async function loginWithEmail(email) {
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            // Đảm bảo đường dẫn này khớp với URL Production của bạn
            emailRedirectTo: window.location.origin + '/index.html'
        }
    });

    if (error) {
        alert('Lỗi: ' + error.message);
        return;
    }
    alert('Đã gửi link đăng nhập thành công! Hãy kiểm tra Email của bạn.');
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
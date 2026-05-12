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

    // đợi Supabase restore session

    await new Promise(resolve =>
        setTimeout(resolve, 1000)
    )

    const {
        data: { session },
        error
    } =
        await supabase.auth.getSession()

    if (error) {
        console.error(error)
    }

    if (!session?.user) {

        window.location.replace(
            './auth.html'
        )

        return null
    }

    return session.user
}
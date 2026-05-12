import { supabase }
from './supabase.js'

export async function loginWithEmail(email) {

    try {

        const { error } =
            await supabase.auth.signInWithOtp({

                email,

                options: {

                    emailRedirectTo:
                        'https://qltc-tawny.vercel.app/index.html'
                }
            })

        if (error) {

            console.error(error)

            alert(error.message)

            return
        }

        alert(
            'Đã gửi link đăng nhập.\nVui lòng kiểm tra email.'
        )

    } catch (err) {

        console.error(err)

        alert('Không thể gửi email')
    }
}

export async function logout() {

    await supabase.auth.signOut()

    window.location.href =
        './auth.html'
}

export async function checkAuth() {

    const {
        data: { session }
    } =
        await supabase.auth.getSession()

    if (!session) {

        window.location.href =
            './auth.html'

        return null
    }

    return session.user
}
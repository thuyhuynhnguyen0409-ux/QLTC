import { supabase } from './supabase.js'
import { setUser } from './state.js'

window.logout = async () => {

    await supabase.auth.signOut()

    localStorage.clear()
    sessionStorage.clear()

    window.location.replace('/auth.html')
}

export async function loginWithEmail(email) {

    const { error } =
        await supabase.auth.signInWithOtp({

            email,

            options: {

                emailRedirectTo:
                    'https://qltc-tawny.vercel.app'
            }
        })

    if (error) {

        alert(error.message)
        return false
    }

    alert(
        'Đã gửi link đăng nhập tới email'
    )

    return true
}

export async function checkAuth() {

    const {
        data: { session }
    } =
        await supabase.auth.getSession()

    if (!session?.user) {

        if (
            !window.location.pathname
                .includes('auth.html')
        ) {

            window.location.replace(
                '/auth.html'
            )
        }

        return false
    }

    setUser(session.user)

    return true
}
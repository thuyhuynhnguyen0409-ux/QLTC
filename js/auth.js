import { supabase } from './supabase.js'

export async function loginWithEmail(email) {

    const { error } =
        await supabase.auth.signInWithOtp({

            email,

            options: {

                emailRedirectTo:
                    window.location.origin
                    + '/index.html'
            }
        })

    if (error) {

        console.error(error)

        alert(
            'Lỗi: ' + error.message
        )

        return false
    }

    alert(
        'Đã gửi link đăng nhập.\nHãy kiểm tra email.'
    )

    return true
}

export async function logout() {

    await supabase.auth.signOut()

    localStorage.clear()

    sessionStorage.clear()

    window.location.replace(
        './auth.html'
    )
}

export async function checkAuth() {

    try {

        // Đợi supabase restore session
        await new Promise(resolve =>
            setTimeout(resolve, 1500)
        )

        const {
            data: { session },
            error
        } =
            await supabase.auth.getSession()

        if (error) {

            console.error(error)

            window.location.replace(
                './auth.html'
            )

            return null
        }

        if (!session?.user) {

            window.location.replace(
                './auth.html'
            )

            return null
        }

        return session.user

    } catch (err) {

        console.error(err)

        window.location.replace(
            './auth.html'
        )

        return null
    }
}
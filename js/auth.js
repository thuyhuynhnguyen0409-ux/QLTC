import { supabase }
from './supabase.js'

import {
    setUser
}
from './state.js'

export async function loginWithEmail(
    email
) {

    const { error } =
        await supabase.auth.signInWithOtp({

            email,

            options: {

                emailRedirectTo:
                    window.location.origin +
                    '/index.html'
            }
        })

    if (error) {

        alert(
            'Lỗi: ' + error.message
        )

        return
    }

    alert(
        'Đã gửi link đăng nhập, hãy kiểm tra email'
    )
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

    setUser(session.user)

    return session.user
}
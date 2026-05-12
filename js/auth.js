
import { supabase }
from './supabase.js'

import { setUser }
from './state.js'

export async function loginWithEmail(email) {

    try {

        const { error } =
            await supabase.auth.signInWithOtp({

                email,

                options: {

                    emailRedirectTo:
                        'https://qltc-tawny.vercel.app'
                }
            })

        if (error) {

            console.error(error)

            alert(error.message)

            return false
        }

        return true

    } catch (err) {

        console.error(err)

        alert('Không thể gửi email')

        return false
    }
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
                './auth.html'
            )
        }

        return null
    }

    setUser(session.user)

    return session.user
}


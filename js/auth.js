
import { supabase } from './supabase.js'
import { setUser } from './state.js'

export async function logout() {

    const confirmLogout =
        confirm('Bạn muốn đăng xuất?')

    if (!confirmLogout) return

    const { error } =
        await supabase.auth.signOut()

    if (error) {

        console.error(error)

        alert('Logout thất bại')

        return
    }

    localStorage.clear()

    sessionStorage.clear()

    window.location.replace('./auth.html')
}

export async function checkAuth() {

    try {

        const {
            data: { session }
        } =
            await supabase.auth.getSession()

        if (!session?.user) {

            if (
                !window.location.pathname.includes('auth.html')
            ) {

                window.location.replace('./auth.html')
            }

            return null
        }

        setUser(session.user)

        return session.user

    } catch (err) {

        console.error(err)

        window.location.replace('./auth.html')

        return null
    }
}

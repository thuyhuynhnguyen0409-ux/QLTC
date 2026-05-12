import { supabase }
    from './supabase.js'

import {
    setUser
} from './state.js'


window.logout = async () => {

    const confirmLogout =
        confirm('Bạn muốn đăng xuất?')

    if (!confirmLogout) return

    const { error } =
        await supabase.auth.signOut()

    if (error) {

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
            data: { session },
            error
        } =
            await supabase.auth.getSession()

        if (error) {
            console.error(error)
        }

        // CHƯA LOGIN

        if (!session?.user) {

            // tránh loop nếu đang ở auth

            if (
                !window.location.pathname
                    .includes('auth.html')
            ) {

                window.location.href =
                    './auth.html'
            }

            return false
        }

        setUser(session.user)

        return true

    } catch (err) {

        console.error(err)

        window.location.href =
            './auth.html'

        return false
    }
}
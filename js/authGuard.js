import { supabase } from './supabase.js'

export async function requireAuth() {

    const {
        data: { session }
    } = await supabase.auth.getSession()

    if (!session) {

        window.location.replace('./auth.html')

        return null
    }

    return session.user
}

export async function redirectIfLoggedIn() {

    const {
        data: { session }
    } = await supabase.auth.getSession()

    if (session) {

        window.location.replace('./index.html')
    }
}
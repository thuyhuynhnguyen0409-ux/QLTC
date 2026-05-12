import { supabase }
from './supabase.js'

import {
    setUser
} from './state.js'

export async function checkAuth() {

    const {
        data: { session }
    } =
    await supabase.auth.getSession()

    if (!session?.user) {

        window.location.href =
            'auth.html'

        return
    }

    setUser(session.user)
}
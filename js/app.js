import {
    checkAuth
} from './auth.js'

import {
    loadSettings
} from './settings.js'

import {
    loadTodayBudget
} from './budget.js'

import {
    updateHomeUI
} from './ui.js'

async function init() {

    const loggedIn =
        await checkAuth()

    if (!loggedIn) return

    await loadSettings()

    await loadTodayBudget()

    updateHomeUI()
}

init()
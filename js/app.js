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

    await checkAuth()

    await loadSettings()

    await loadTodayBudget()

    updateHomeUI()
}

init()
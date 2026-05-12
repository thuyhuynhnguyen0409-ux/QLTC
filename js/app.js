import {
    checkAuth,
    logout
}
from './auth.js'

import {
    loadSettings
}
from './settings.js'

import {
    loadTodayBudget
}
from './budget.js'

import {
    updateHomeUI
}
from './ui.js'

import {
    addExpense,
    transferSavingsToBudget
}
from './expenses.js'

import {
    suggestFood
}
from './ai.js'

import {
    closeDay
}
from './day.js'

import * as state
from './state.js'

// GLOBAL FUNCTIONS

window.logout = logout

window.suggestFood =
suggestFood

window.closeDay =
closeDay

window.transferSavingsToBudget =
transferSavingsToBudget

window.toggleConfigModal =
(show) => {

    document
    .getElementById(
        'configModal'
    )
    .classList.toggle(
        'hidden',
        !show
    )
}

window.addExpense =
async () => {

    const name =

        document
        .getElementById(
            'expName'
        )
        .value

    const amount =

        document
        .getElementById(
            'expAmount'
        )
        .value

    const category =

        document
        .getElementById(
            'expCategory'
        )
        .value

    await addExpense(
        name,
        amount,
        category
    )
}

async function init() {

    const user =
        await checkAuth()

    if (!user)
        return

    state.setUser(user)

    await loadSettings()

    loadTodayBudget()

    updateHomeUI()
}

init()
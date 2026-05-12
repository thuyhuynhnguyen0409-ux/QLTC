
import { checkAuth, logout }
from './auth.js'

import {
    loadSettings,
    toggleConfigModal,
    initBudget,
    addFixedCostRow
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
    addExpense
}
from './expenses.js'

import {
    suggestFood
}
from './ai.js'

import {
    loadExpenses
}
from './expenses.js'

async function init() {

    const user =
        await checkAuth()

    if (!user) return

    await loadSettings()

    await loadTodayBudget()

    await loadExpenses()

    updateHomeUI()

    const emailEl =
        document.getElementById(
            'userEmailDisplay'
        )

    if (emailEl) {

        emailEl.innerText =
            user.email
    }
}

window.logout = logout

window.addExpense =
    addExpense

window.toggleConfigModal =
    toggleConfigModal

window.initBudget =
    initBudget

window.addFixedCostRow =
    addFixedCostRow

window.suggestFood =
    suggestFood

init()

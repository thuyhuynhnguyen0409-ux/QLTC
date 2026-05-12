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

import './expenses.js'

window.logout =
    logout

window.toggleConfigModal =
function(show) {

    document
        .getElementById(
            'configModal'
        )
        .classList
        .toggle(
            'hidden',
            !show
        )
}
window.addFixedCostRow =
function () {

    const wrap =
        document.getElementById(
            'fixedCostsList'
        )

    const div =
        document.createElement('div')

    div.className =
        'flex gap-2 mb-2'

    div.innerHTML = `

        <input
            class="fixed-name flex-1 p-3 border rounded-xl"
            placeholder="Tên"
        >

        <input
            class="fixed-amount w-32 p-3 border rounded-xl"
            placeholder="Tiền"
        >

        <button
            class="bg-red-500 text-white px-4 rounded-xl"
            onclick="this.parentElement.remove()"
        >
            X
        </button>
    `

    wrap.appendChild(div)
}
async function init() {

    const user =
        await checkAuth()

    if (!user)
        return

    await loadSettings()

    loadTodayBudget()

    updateHomeUI()
}

init()
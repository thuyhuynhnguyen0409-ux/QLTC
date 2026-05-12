import {
    formatMoney
} from './utils.js'

import {
    todayBudget
} from './state.js'

export function updateHomeUI() {

    document.getElementById(
        'dailyBudget'
    ).innerText =
        formatMoney(
            todayBudget.remaining
        )
}

export async function rebalanceFutureBudget(overSpent) {

    console.log(
        'Rebalance:',
        overSpent
    )
}
window.toggleConfigModal = function(show) {

    const modal =
        document.getElementById('configModal')

    if (!modal) return

    modal.classList.toggle(
        'hidden',
        !show
    )
}
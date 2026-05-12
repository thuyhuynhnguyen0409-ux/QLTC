import * as state
from './state.js'

import {
    formatMoney
}
from './utils.js'

import {
    renderChart
}
from './charts.js'

export function updateHomeUI() {

    if (!state.todayBudget)
        return

    document
        .getElementById(
            'dailyBudget'
        )
        .innerText =
        formatMoney(
            state.todayBudget.remaining
        )

    document
        .getElementById(
            'remainingCycle'
        )
        .innerText =
        formatMoney(
            state.currentCycle
            .remaining_money
        )

    document
        .getElementById(
            'currentSavings'
        )
        .innerText =
        formatMoney(
            state.currentSavings
        )

    renderChart(

        state.currentCycle
        .total_fixed,

        state.currentCycle
        .total_spent,

        state.currentCycle
        .remaining_money,

        state.currentSavings
    )
}
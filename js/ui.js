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

    document.getElementById(
        'dailyBudget'
    ).innerText =
        formatMoney(
            state.todayBudget.remaining
        )

    document.getElementById(
        'remainingCycle'
    ).innerText =
        formatMoney(
            state.currentCycle.remaining_money
        )

    document.getElementById(
        'currentSavings'
    ).innerText =
        formatMoney(
            state.currentSavings
        )

    renderExpenseList()

    renderChart(

        state.currentCycle.total_fixed || 0,

        state.currentCycle.total_spent || 0,

        state.currentCycle.remaining_money || 0,

        state.currentSavings || 0
    )
}

function renderExpenseList() {

    const wrap =
        document.getElementById(
            'expenseList'
        )

    if (!wrap) return

    wrap.innerHTML = ''

    state.expenses.forEach(exp => {

        wrap.innerHTML += `

        <div class="p-3 border rounded-2xl mb-2 bg-slate-50">

            <div class="flex justify-between">

                <div>

                    <h4 class="font-bold">
                        ${exp.name}
                    </h4>

                    <p class="text-sm text-slate-500">
                        ${exp.category}
                    </p>

                </div>

                <b class="text-red-500">
                    ${formatMoney(exp.amount)}
                </b>

            </div>

        </div>
        `
    })
}
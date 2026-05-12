import * as state
from './state.js'

import {
    getDaysRemaining
}
from './utils.js'

export function loadTodayBudget() {

    if (!state.currentCycle)
        return null

    const daysLeft =
        getDaysRemaining(
            state.currentCycle.cycle_end
        )

    const remainingMoney =
        Number(
            state.currentCycle.remaining_money || 0
        )

    const dailyAllocation =
        remainingMoney / daysLeft

    const todayStr =
        new Date()
            .toISOString()
            .split('T')[0]

    const spentToday =
        state.expenses
            .filter(
                exp =>
                    exp.expense_date === todayStr
            )
            .reduce(
                (
                    sum,
                    exp
                ) =>
                    sum + Number(exp.amount),
                0
            )

    const budgetData = {

        allocated:
            dailyAllocation,

        spent:
            spentToday,

        remaining:
            dailyAllocation - spentToday,

        daysLeft
    }

    state.setTodayBudget(
        budgetData
    )

    return budgetData
}
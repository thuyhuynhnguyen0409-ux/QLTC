import * as state
from './state.js'

export function getDaysLeft() {

    const today =
        new Date()

    const end =
        new Date(
            state.currentCycle.cycle_end
        )

    const diff =

        Math.ceil(

            (
                end - today
            )

            /

            (
                1000 *
                60 *
                60 *
                24
            )
        )

    return Math.max(diff, 1)
}

export function loadTodayBudget() {

    if (!state.currentCycle)
        return

    const daysLeft =
        getDaysLeft()

    const remainMoney =

        Number(
            state.currentCycle
            .remaining_money
        )

    // budget mới chia đều
    const dailyBudget =

        remainMoney / daysLeft

    // chi hôm nay

    const today =
        new Date()
        .toISOString()
        .split('T')[0]

    const spentToday =

        state.expenses
        .filter(
            e =>
            e.expense_date === today
        )
        .reduce(
            (sum, e) =>
            sum + Number(e.amount),
            0
        )

    // còn lại hôm nay
    const remainToday =

        dailyBudget -
        spentToday

    const result = {

        allocated:
            dailyBudget,

        spent:
            spentToday,

        remaining:
            remainToday,

        daysLeft
    }

    state.setTodayBudget(
        result
    )

    return result
}
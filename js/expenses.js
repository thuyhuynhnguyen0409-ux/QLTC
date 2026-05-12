import { supabase }
from './supabase.js'

import * as state
from './state.js'

import {
    loadTodayBudget
}
from './budget.js'

import {
    updateHomeUI
}
from './ui.js'

export async function addExpense(
    name,
    amount,
    category
) {

    const val =
        Number(amount)

    if (
        !name ||
        isNaN(val) ||
        val <= 0
    ) {

        alert(
            'Dữ liệu không hợp lệ'
        )

        return
    }

    const today =
        new Date()
            .toISOString()
            .split('T')[0]

    const {
        data,
        error
    } =
        await supabase
            .from('expenses')
            .insert([
                {
                    user_id:
                        state.user.id,

                    name,

                    amount: val,

                    category,

                    expense_date:
                        today
                }
            ])
            .select()

    if (error) {

        console.error(error)

        alert(
            'Không thể thêm chi tiêu'
        )

        return
    }

    const newRemaining =
        Number(
            state.currentCycle
                .remaining_money
        ) - val

    const {
        error: cycleError
    } =
        await supabase
            .from('monthly_cycles')
            .update({
                remaining_money:
                    newRemaining,

                total_spent:
                    Number(
                        state.currentCycle
                            .total_spent || 0
                    ) + val
            })
            .eq(
                'id',
                state.currentCycle.id
            )

    if (cycleError) {

        console.error(cycleError)
    }

    state.setExpenses([
        data[0],
        ...state.expenses
    ])

    state.currentCycle.remaining_money =
        newRemaining

    state.currentCycle.total_spent =
        Number(
            state.currentCycle.total_spent || 0
        ) + val

    loadTodayBudget()

    updateHomeUI()

    document.getElementById(
        'expName'
    ).value = ''

    document.getElementById(
        'expAmount'
    ).value = ''
}

window.addExpense =
async function () {

    const name =
        document
            .getElementById(
                'expName'
            )
            .value
            .trim()

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
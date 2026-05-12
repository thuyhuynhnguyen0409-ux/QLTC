import { supabase }
from './supabase.js'

import {
    user,
    todayBudget,
    currentCycle
} from './state.js'

import {
    parseCurrency
} from './utils.js'

import {
    rebalanceFutureBudget
} from './ui.js'

export async function addExpense() {

    const name =
        document.getElementById('expName')
            .value

    const amount =
        parseCurrency(
            document.getElementById('expAmount')
                .value
        )

    const category =
        document.getElementById('expCategory')
            .value

    await supabase
        .from('expenses')
        .insert({
            user_id: user.id,
            daily_budget_id: todayBudget.id,
            name,
            amount,
            category
        })

    const newSpent =
        todayBudget.spent + amount

    const newRemaining =
        todayBudget.allocated - newSpent

    await supabase
        .from('daily_budgets')
        .update({
            spent: newSpent,
            remaining: newRemaining
        })
        .eq('id', todayBudget.id)

    await supabase
        .from('monthly_cycles')
        .update({
            total_spent:
                currentCycle.total_spent
                + amount,

            remaining_money:
                currentCycle.remaining_money
                - amount
        })
        .eq('id', currentCycle.id)

    if (newRemaining < 0) {

        await rebalanceFutureBudget(
            Math.abs(newRemaining)
        )
    }
}
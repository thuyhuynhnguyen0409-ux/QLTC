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

export async function transferSavingsToBudget() {

    const val =
        Number(
            prompt(
                'Chuyển bao nhiêu?'
            )
        )

    if (!val || val <= 0)
        return

    if (
        val >
        state.currentSavings
    ) {

        alert(
            'Không đủ tiền'
        )

        return
    }

    const newSaving =
        state.currentSavings
        - val

    const newRemain =
        state.currentCycle
        .remaining_money
        + val

    await supabase
        .from('settings')
        .update({

            current_savings:
                newSaving
        })
        .eq(
            'user_id',
            state.user.id
        )

    await supabase
        .from('monthly_cycles')
        .update({

            remaining_money:
                newRemain
        })
        .eq(
            'id',
            state.currentCycle.id
        )

    state.setCurrentSavings(
        newSaving
    )

    state.currentCycle
        .remaining_money =
        newRemain

    loadTodayBudget()

    updateHomeUI()
}
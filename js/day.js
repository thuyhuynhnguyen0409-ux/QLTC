import { supabase }
from './supabase.js'

import * as state
from './state.js'

import {
    loadTodayBudget
}
from './budget.js'

export async function closeDay() {

    if (
        !state.todayBudget
    ) return

    const remain =

        Number(
            state.todayBudget
            .remaining
        )

    // âm tiền -> không save
    if (remain <= 0) {

        alert(
            'Hôm nay không dư tiền'
        )

        return
    }

    // cộng savings

    const newSaving =

        Number(
            state.currentSavings
        ) + remain

    // trừ khỏi remaining cycle

    const newRemainCycle =

        Number(
            state.currentCycle
            .remaining_money
        ) - remain

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
                newRemainCycle,

            total_saved_extra:

                Number(
                    state.currentCycle
                    .total_saved_extra
                ) + remain
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
        newRemainCycle

    loadTodayBudget()

    alert(
        `Đã tiết kiệm ${remain.toLocaleString('vi-VN')}đ`
    )
}
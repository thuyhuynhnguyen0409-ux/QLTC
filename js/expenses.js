export async function transferSavingsToBudget() {

    const amount =
        prompt(
            'Nhập số tiền muốn chuyển'
        )

    if (!amount)
        return

    const val =
        Number(amount)

    if (
        val <= 0
    ) return

    if (
        val >
        state.currentSavings
    ) {

        alert(
            'Không đủ tiền tiết kiệm'
        )

        return
    }

    const newSavings =

        state.currentSavings -
        val

    const newRemain =

        state.currentCycle
        .remaining_money +
        val

    await supabase
        .from('settings')
        .update({

            current_savings:
                newSavings
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
        newSavings
    )

    state.currentCycle
        .remaining_money =
        newRemain

    loadTodayBudget()

    updateHomeUI()
}
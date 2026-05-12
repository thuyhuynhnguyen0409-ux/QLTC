import { supabase } from './supabase.js'

import {
    user,
    currentCycle,
    todayBudget,
    settings,
    fixedCosts,
    setCurrentCycle,
    setTodayBudget
} from './state.js'

export async function generateCycle() {

    const totalFixed =
        fixedCosts.reduce(
            (sum, item) =>
                sum + item.amount,
            0
        )

    const usableMoney =
        settings.salary
        - totalFixed
        - settings.base_savings

    const start =
        new Date()

    const end =
        new Date(
            start.getFullYear(),
            start.getMonth(),
            settings.cycle_end_day
        )

    const totalDays =
        Math.ceil(
            (end - start) / 86400000
        ) + 1

    const dailyBudget =
        Math.floor(
            usableMoney / totalDays
        )

    const { data: cycle } =
        await supabase
            .from('monthly_cycles')
            .insert({
                user_id: user.id,
                cycle_start: start,
                cycle_end: end,
                total_income: settings.salary,
                total_fixed: totalFixed,
                total_savings: settings.base_savings,
                usable_money: usableMoney,
                remaining_money: usableMoney
            })
            .select()
            .single()

    for (let i = 0; i < totalDays; i++) {

        const date =
            new Date(start)

        date.setDate(
            start.getDate() + i
        )

        await supabase
            .from('daily_budgets')
            .insert({
                user_id: user.id,
                cycle_id: cycle.id,
                budget_date:
                    date.toISOString()
                        .split('T')[0],
                allocated: dailyBudget,
                remaining: dailyBudget
            })
    }
}

export async function loadTodayBudget() {

    const today =
        new Date()
            .toISOString()
            .split('T')[0]

    const { data } =
        await supabase
            .from('daily_budgets')
            .select('*')
            .eq('user_id', user.id)
            .eq('budget_date', today)
            .single()

    setTodayBudget(data)
}
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

const today =
    new Date()
    .toISOString()
    .split('T')[0]

export async function addExpense(
    name,
    amount,
    category
) {

    const val = Number(amount)

    if (!val || val <= 0) {

        alert('Số tiền không hợp lệ')
        return
    }

    const {
        data,
        error
    } =
        await supabase
        .from('expenses')
        .insert([{

            user_id:
                state.user.id,

            name,

            amount: val,

            category,

            expense_date: today
        }])
        .select()

    if (error) {

        alert(error.message)
        return
    }

    state.setExpenses([
        data[0],
        ...state.expenses
    ])

    // update cycle

    const newRemain =

        Number(
            state.currentCycle
            .remaining_money
        ) - val

    await supabase
        .from('monthly_cycles')
        .update({

            remaining_money:
                newRemain,

            total_spent:

                Number(
                    state.currentCycle
                    .total_spent
                ) + val
        })
        .eq(
            'id',
            state.currentCycle.id
        )

    state.currentCycle
        .remaining_money =
        newRemain

    state.currentCycle
        .total_spent += val

    loadTodayBudget()

    updateHomeUI()

    renderExpenseList()
}

export async function deleteExpense(id) {

    const expense =
        state.expenses.find(
            e => e.id === id
        )

    if (!expense) return

    const confirmDelete =
        confirm(
            'Xóa khoản chi này?'
        )

    if (!confirmDelete)
        return

    const {
        error
    } =
        await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

    if (error) {

        alert(error.message)
        return
    }

    state.setExpenses(

        state.expenses.filter(
            e => e.id !== id
        )
    )

    // cộng tiền lại

    const newRemain =

        Number(
            state.currentCycle
            .remaining_money
        ) +

        Number(expense.amount)

    await supabase
        .from('monthly_cycles')
        .update({

            remaining_money:
                newRemain,

            total_spent:

                Number(
                    state.currentCycle
                    .total_spent
                ) -

                Number(
                    expense.amount
                )
        })
        .eq(
            'id',
            state.currentCycle.id
        )

    state.currentCycle
        .remaining_money =
        newRemain

    state.currentCycle
        .total_spent -=
        Number(expense.amount)

    loadTodayBudget()

    updateHomeUI()

    renderExpenseList()
}

export async function editExpense(
    id
) {

    const expense =
        state.expenses.find(
            e => e.id === id
        )

    if (!expense) return

    const newAmount =
        prompt(
            'Sửa số tiền',
            expense.amount
        )

    if (!newAmount) return

    const val =
        Number(newAmount)

    if (!val || val <= 0)
        return

    const diff =
        val -
        Number(expense.amount)

    const {
        error
    } =
        await supabase
        .from('expenses')
        .update({

            amount: val
        })
        .eq(
            'id',
            id
        )

    if (error) {

        alert(error.message)
        return
    }

    expense.amount = val

    state.currentCycle
        .remaining_money -= diff

    state.currentCycle
        .total_spent += diff

    await supabase
        .from('monthly_cycles')
        .update({

            remaining_money:

                state.currentCycle
                .remaining_money,

            total_spent:

                state.currentCycle
                .total_spent
        })
        .eq(
            'id',
            state.currentCycle.id
        )

    loadTodayBudget()

    updateHomeUI()

    renderExpenseList()
}

export function renderExpenseList() {

    const box =
        document.getElementById(
            'expenseList'
        )

    if (!box) return

    box.innerHTML = ''

    state.expenses.forEach(
        exp => {

            const div =
                document
                .createElement('div')

            div.className =
                'p-4 border rounded-2xl mb-3'

            div.innerHTML = `

            <div class="flex justify-between">

                <div>

                    <h4 class="font-bold">
                        ${exp.name}
                    </h4>

                    <p class="text-sm text-slate-500">
                        ${exp.category}
                    </p>

                </div>

                <div class="text-right">

                    <p class="font-black text-red-500">
                        ${Number(exp.amount)
                            .toLocaleString('vi-VN')}đ
                    </p>

                    <div class="flex gap-2 mt-2">

                        <button
                            class="text-xs bg-indigo-500 text-white px-2 py-1 rounded-xl edit-btn"
                            data-id="${exp.id}"
                        >
                            Sửa
                        </button>

                        <button
                            class="text-xs bg-red-500 text-white px-2 py-1 rounded-xl del-btn"
                            data-id="${exp.id}"
                        >
                            Xóa
                        </button>

                    </div>

                </div>

            </div>
            `

            box.appendChild(div)
        }
    )

    document
    .querySelectorAll('.del-btn')
    .forEach(btn => {

        btn.onclick = () =>
            deleteExpense(
                btn.dataset.id
            )
    })

    document
    .querySelectorAll('.edit-btn')
    .forEach(btn => {

        btn.onclick = () =>
            editExpense(
                btn.dataset.id
            )
    })
}
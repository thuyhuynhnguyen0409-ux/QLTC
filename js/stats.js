import { supabase }
from './supabase.js'

import * as state
from './state.js'

export async function loadStats(
    year
) {

    const {
        data,
        error
    } =
        await supabase
        .from('expenses')
        .select('*')
        .eq(
            'user_id',
            state.user.id
        )
        .gte(
            'expense_date',
            `${year}-01-01`
        )
        .lte(
            'expense_date',
            `${year}-12-31`
        )
        .order(
            'expense_date',
            {
                ascending: false
            }
        )

    if (error) {

        console.error(error)
        return
    }

    renderStats(data)
}

function renderStats(
    expenses
) {

    const box =
        document.getElementById(
            'statsList'
        )

    if (!box) return

    box.innerHTML = ''

    let total = 0

    expenses.forEach(
        exp => {

            total +=
                Number(exp.amount)

            const div =
                document
                .createElement('div')

            div.className =
                'bg-white p-4 rounded-2xl mb-3'

            div.innerHTML = `

            <div class="flex justify-between">

                <div>

                    <h4 class="font-bold">
                        ${exp.name}
                    </h4>

                    <p class="text-sm text-slate-500">
                        ${exp.expense_date}
                    </p>

                </div>

                <div class="font-black text-red-500">

                    ${Number(exp.amount)
                        .toLocaleString('vi-VN')}đ

                </div>

            </div>
            `

            box.appendChild(div)
        }
    )

    document
    .getElementById(
        'yearTotal'
    )
    .innerText =

        total.toLocaleString(
            'vi-VN'
        ) + 'đ'
}
export function getMonthlyData(
    expenses
) {

    const months =
        Array(12).fill(0)

    expenses.forEach(
        e => {

            const month =

                new Date(
                    e.expense_date
                )
                .getMonth()

            months[month] +=
                Number(e.amount)
        }
    )

    return months
}
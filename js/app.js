import {
    checkAuth,
    logout
}
from './auth.js'

import {
    addExpense,
    renderExpenseList
}
from './expenses.js'

import {
    transferSavingsToBudget
}
from './savings.js'

import {
    closeDay
}
from './day.js'

window.logout = logout

window.transferSavingsToBudget =
    transferSavingsToBudget

window.closeDay =
    closeDay

window.addExpense =
async function () {

    const name =
        document
        .getElementById(
            'expName'
        )
        .value

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

async function init() {

    const user =
        await checkAuth()

    if (!user)
        return

    renderExpenseList()
}
window.addFixedCostRow =
function () {

    const box =
        document.getElementById(
            'fixedCostsList'
        )

    const div =
        document.createElement(
            'div'
        )

    div.className =
        'flex gap-2'

    div.innerHTML = `

    <input
        class="fixed-name flex-1 p-3 border rounded-2xl"
        placeholder="Tên phí"
    />

    <input
        class="fixed-amount w-32 p-3 border rounded-2xl"
        placeholder="Số tiền"
    />

    <button
        class="bg-red-500 text-white px-4 rounded-2xl del-fixed"
    >
        X
    </button>
    `

    box.appendChild(div)

    div
    .querySelector('.del-fixed')
    .onclick = () =>
        div.remove()
}
init()
// js/app.js

import { checkAuth, logout } from './auth.js'

window.logout = logout

// TEST FUNCTION
window.addExpense = () => {

    alert('Add expense chạy OK')
}

window.suggestFood = () => {

    alert('AI chạy OK')
}

window.toggleConfigModal = (show) => {

    const modal =
        document.getElementById(
            'configModal'
        )

    if (!modal) return

    modal.classList.toggle(
        'hidden',
        !show
    )
}

async function init() {

    const user =
        await checkAuth()

    if (!user) return

    console.log(
        'Đăng nhập:',
        user.email
    )

    const userDisplay =
        document.getElementById(
            'userEmailDisplay'
        )

    if (userDisplay) {

        userDisplay.innerText =
            user.email
    }
}

init()
// js/app.js
import { checkAuth, logout } from './auth.js';
import { loadSettings } from './settings.js';
import { loadTodayBudget } from './budget.js';
import { updateHomeUI } from './ui.js';
// Import thêm addExpense nếu bạn có file đó
// import { addExpense } from './expenses.js'; 
import {
    checkAuth
} from './auth.js'
// Gán vào window để gọi được từ HTML
window.logout = logout;
window.toggleConfigModal = (show) => {
    document.getElementById('configModal').classList.toggle('hidden', !show);
};

// Khởi tạo app
async function init() {

    const user =
        await checkAuth()

    if (!user) return

    console.log(
        'LOGIN:',
        user.email
    )

    // load app
}

init();
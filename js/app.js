// js/app.js
import { checkAuth, logout } from './auth.js';
import { loadSettings } from './settings.js';
import { loadTodayBudget } from './budget.js';
import { updateHomeUI } from './ui.js';
// Import thêm addExpense nếu bạn có file đó
// import { addExpense } from './expenses.js'; 

// Gán vào window để gọi được từ HTML
window.logout = logout;
window.toggleConfigModal = (show) => {
    document.getElementById('configModal').classList.toggle('hidden', !show);
};

// Khởi tạo app
async function init() {
    const user = await checkAuth();
    if (!user) return;

    if (document.getElementById('userEmailDisplay')) {
        document.getElementById('userEmailDisplay').innerText = user.email;
    }

    await loadSettings();
    await loadTodayBudget();
    updateHomeUI();
}

init();
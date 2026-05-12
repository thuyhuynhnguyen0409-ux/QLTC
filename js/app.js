import { checkAuth, logout } from './auth.js';
import { loadSettings } from './settings.js';
import { loadTodayBudget } from './budget.js';
import { updateHomeUI } from './ui.js';
import { addExpense } from './expenses.js';

async function init() {
    const user = await checkAuth();
    if (!user) return;

    await loadSettings();
    loadTodayBudget();
    updateHomeUI();
}

// Gán hàm vào window để gọi được từ HTML onclick
window.logout = logout;
window.addExpense = async () => {
    const name = document.getElementById('expName').value;
    const amount = document.getElementById('expAmount').value;
    const cat = document.getElementById('expCategory').value;
    if(name && amount) {
        await addExpense(name, amount, cat);
        document.getElementById('expName').value = '';
        document.getElementById('expAmount').value = '';
    }
};

window.toggleConfigModal = (show) => {
    document.getElementById('configModal').classList.toggle('hidden', !show);
};

init();
// js/app.js
import { checkAuth, logout } from './auth.js';
import { loadSettings } from './settings.js';
import { loadTodayBudget } from './budget.js';
import { updateHomeUI } from './ui.js';

// Gán hàm vào window để HTML có thể gọi được qua onclick
window.logout = logout;
window.toggleConfigModal = (show) => {
    const modal = document.getElementById('configModal');
    if (show) modal.classList.remove('hidden');
    else modal.classList.add('hidden');
};

async function init() {
    const user = await checkAuth();
    if (!user) return;

    // Hiển thị email user ngay lập tức
    const emailDisplay = document.getElementById('userEmailDisplay');
    if (emailDisplay) emailDisplay.innerText = user.email;

    try {
        await loadSettings();
        await loadTodayBudget();
        updateHomeUI();
    } catch (error) {
        console.error("Lỗi khởi tạo dữ liệu:", error);
    }
}

init();
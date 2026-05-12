import * as state from './state.js';
import { formatMoney } from './utils.js';

export function updateHomeUI() {
    const budget = state.todayBudget;
    if (!budget) return;

    // Số tiền hôm nay (Có thể âm)
    const dailyElem = document.getElementById('dailyBudget');
    dailyElem.innerText = formatMoney(budget.remaining);
    dailyElem.className = budget.remaining < 0 ? "text-4xl font-black mt-2 text-red-500" : "text-4xl font-black mt-2 text-slate-900";

    // Số tiền định mức cho các ngày tới
    const nextDaysElem = document.getElementById('remainingCycle');
    if (nextDaysElem) {
        nextDaysElem.innerText = formatMoney(budget.allocated);
    }

    // Hũ tiết kiệm
    document.getElementById('currentSavings').innerText = formatMoney(state.currentSavings);
    document.getElementById('userEmailDisplay').innerText = state.user.email;

    renderExpenseList();
}

function renderExpenseList() {
    const container = document.getElementById('expenseList');
    container.innerHTML = state.expenses.map(exp => `
        <div class="flex justify-between items-center p-4 bg-slate-50 rounded-2xl mb-2">
            <div>
                <p class="font-bold">${exp.name}</p>
                <p class="text-xs text-slate-500">${exp.expense_date}</p>
            </div>
            <p class="font-bold text-red-500">-${formatMoney(exp.amount)}</p>
        </div>
    `).join('');
}
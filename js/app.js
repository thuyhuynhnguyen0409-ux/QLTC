import { checkAuth } from './auth.js';
import { loadSettings, fillSettingsForm } from './settings.js';
import { ensureCurrentCycle, loadTodayBudget } from './budget.js';
import { loadExpenses } from './expenses.js';
import { updateHomeUI } from './ui.js';
import { formatCurrencyInput } from './utils.js';
import './day.js';
import './ai.js';
import {
    addExpense,
    openEditExpense,
    submitEditExpense,
    toggleEditExpenseModal
} from './expenses.js'
import './settings.js';
import * as state from './state.js'
import { initBillScanner } from './billScanner.js'
window.formatCurrencyInput = formatCurrencyInput;

window.toggleConfigModal = function (show) {
  const modal = document.getElementById('configModal');
  if (!modal) return;

  if (show) {
    fillSettingsForm();
  }

  modal.classList.toggle('hidden', !show);
};

async function init() {
  const user = await checkAuth();
  if (!user) return;

  await loadSettings();

  const setupPrompt = document.getElementById('setupPrompt');
  const dashboard = document.getElementById('dashboard');

  if (!Number(state.settings?.salary || 0)) {
    if (setupPrompt) setupPrompt.classList.remove('hidden');
    if (dashboard) dashboard.classList.add('hidden');
    return;
  }

  if (setupPrompt) setupPrompt.classList.add('hidden');
  if (dashboard) dashboard.classList.remove('hidden');

  await ensureCurrentCycle();
  await loadExpenses();
  await loadTodayBudget();
  updateHomeUI();
  initBillScanner()
}

window.__refreshApp = init;

init();
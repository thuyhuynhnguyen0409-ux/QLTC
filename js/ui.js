import * as state from './state.js';
import { formatMoney, getTodayString } from './utils.js';
import { renderHomeChart } from './charts.js';

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

export function updateHomeUI() {

  console.log('STATE:', {
    cycle: state.currentCycle,
    expenses: state.expenses,
    budget: state.todayBudget
  });

  const daily = Number(state.todayBudget?.remaining || 0);

  const spentToday = Number(
    state.todayBudget?.spent || 0
  );

  const cycleRemaining = Number(
    state.currentCycle?.remaining_money || 0
  );

  const savings = Number(
    state.currentSavings || 0
  );

  setText(
    'dailyBudget',
    formatMoney(daily)
  );

  setText(
    'todaySpentDisplay',
    formatMoney(spentToday)
  );

  setText(
    'remainingCycle',
    formatMoney(cycleRemaining)
  );

  setText(
    'nextDailyBudgetSummary',
    formatMoney(
      state.todayBudget?.nextDailyBudgetSummary || 0
    )
  );

  setText(
    'nextDailyBudget',
    formatMoney(
      state.todayBudget?.nextDailyBudget || 0
    )
  );
  setText(
    'currentSavingsDisplay',
    formatMoney(savings)
  );

  setText(
    'salaryDisplay',
    formatMoney(state.settings?.salary || 0)
  );

  setText(
    'fixedCostsDisplay',
    formatMoney(
      state.currentCycle?.total_fixed || 0
    )
  );

  const dailyEl =
    document.getElementById('dailyBudget');

  if (dailyEl) {

    dailyEl.classList.toggle(
      'text-rose-500',
      daily < 0
    );

    dailyEl.classList.toggle(
      'text-indigo-600',
      daily >= 0
    );
  }

  renderExpenseList();

  renderHomeChart(
    state.currentCycle?.total_fixed || 0,
    state.currentCycle?.total_spent || 0,
    cycleRemaining,
    savings
  );

  // ===== TỔNG KẾT NHANH =====

  const income =
    Number(state.settings?.salary || 0);

  const fixed =
    state.fixedCosts.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );

  const saving =
    Number(state.currentSavings || 0);

  const nextBudget =
    Number(
      state.todayBudget?.nextDailyBudget || 0
    );

  setText(
    'summarySalary',
    formatMoney(income)
  );

  setText(
    'summaryFixed',
    formatMoney(fixed)
  );

  setText(
    'summarySpent',
    formatMoney(spentToday)
  );

  setText(
    'summarySavings',
    formatMoney(saving)
  );

  setText(
    'nextDailyBudgetSummary',
    formatMoney(nextBudget)
  );
  setText(
    'nextDailyBudget',
    formatMoney(nextBudget)
  );
} // <- PHẢI CÓ DẤU NÀY

export function renderExpenseList() {

  const wrap =
    document.getElementById(
      'expenseList'
    );

  if (!wrap) return;

  const today = getTodayString();

  const list =
    (state.expenses || [])
      .filter(
        e =>
          e.expense_date === today &&
          !e.deleted_at
      )
      .sort(
        (a, b) =>
          String(b.created_at || '')
            .localeCompare(
              String(a.created_at || '')
            )
      );

  if (!list.length) {

    wrap.innerHTML = `
      <div class="text-center py-12 text-slate-400">
        Chưa có chi tiêu hôm nay
      </div>
    `;

    return;
  }

  wrap.innerHTML =
    list.map(exp => `
      <div class="expense-row bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-3">

        <div class="flex justify-between gap-3">

          <div>

            <div class="font-bold text-slate-900">
              ${exp.name}
            </div>

            <div class="text-[10px] uppercase tracking-widest text-slate-400 mt-1">
              ${exp.category || 'other'}
            </div>

          </div>

          <div class="text-right">

            <div class="font-black text-rose-500">
              ${Number(exp.amount || 0).toLocaleString('vi-VN')}đ
            </div>

            <div class="flex gap-2 mt-3 justify-end">

              <button
                class="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-500 text-white"
                onclick="openEditExpense('${exp.id}')"
              >
                Sửa
              </button>

              <button
                class="px-3 py-1 rounded-xl text-xs font-bold bg-rose-500 text-white"
                onclick="deleteExpense('${exp.id}')"
              >
                Xóa
              </button>

            </div>

          </div>

        </div>

      </div>
    `).join('');
}
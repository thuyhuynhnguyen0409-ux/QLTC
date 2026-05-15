import { supabase } from './supabase.js';
import { checkAuth, logout } from './auth.js';
import * as state from './state.js';
import { formatMoney } from './utils.js';
import { renderBarChart, renderDoughnutChart } from './charts.js';

let yearExpenses = [];
let currentYear = new Date().getFullYear();

window.logout = logout;

function getEl(id) {
  return document.getElementById(id);
}

function populateYearOptions() {
  const yearFilter = getEl('yearFilter');
  if (!yearFilter) return;

  const years = [];
  for (let i = 0; i < 5; i++) years.push(currentYear - i);

  yearFilter.innerHTML = years
    .map(y => `<option value="${y}">${y}</option>`)
    .join('');

  yearFilter.value = String(currentYear);
}

function populateMonthOptions() {
  const monthFilter = getEl('monthFilter');
  if (!monthFilter) return;

  monthFilter.innerHTML = `
    <option value="all">Tất cả tháng</option>
    ${Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}">Tháng ${i + 1}</option>`).join('')}
  `;

  monthFilter.value = 'all';
}

async function loadExpensesByYear(year) {
  currentYear = year;

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', state.user.id)
    .is('deleted_at', null)
    .gte('expense_date', `${year}-01-01`)
    .lte('expense_date', `${year}-12-31`)
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    yearExpenses = [];
  } else {
    yearExpenses = data || [];
  }

  state.setExpenses(yearExpenses);
  renderStatsPage();
}

function getFilteredExpenses() {
  const monthValue = getEl('monthFilter')?.value || 'all';

  if (monthValue === 'all') return yearExpenses;

  const month = Number(monthValue);
  return yearExpenses.filter(e => {
    const m = Number(String(e.expense_date).split('-')[1]);
    return m === month;
  });
}

function renderHistory(list) {
  const box = getEl('historyList');
  if (!box) return;

  if (!list.length) {
    box.innerHTML = `
      <div class="text-center py-10 text-slate-400">
        Không có dữ liệu
      </div>
    `;
    return;
  }

  const grouped = {};
  list.forEach(exp => {
    const day = exp.expense_date;
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(exp);
  });

  const days = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  box.innerHTML = days.map(day => `
    <div class="mb-4">
      <div class="text-xs uppercase tracking-widest text-slate-400 font-black mb-2">${day}</div>
      <div class="space-y-2">
        ${grouped[day].map(exp => `
          <div class="bg-white border border-slate-100 rounded-2xl p-4">
            <div class="flex justify-between gap-3">
              <div>
                <div class="font-bold">${exp.name}</div>
                <div class="text-xs uppercase tracking-widest text-slate-400 mt-1">${exp.category || 'other'}</div>
              </div>
              <div class="font-black text-rose-500">${formatMoney(exp.amount)}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function renderStatsPage() {
  const filtered = getFilteredExpenses();

  const total = filtered.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const count = filtered.length;
  const avg = count ? Math.trunc(total / count) : 0;

  setText('statsTotal', formatMoney(total));
  setText('statsCount', String(count));
  setText('statsAverage', formatMoney(avg));

  renderHistory(filtered);
  renderCharts(filtered);
}

function renderCharts(filtered) {
  const monthly = Array(12).fill(0);
  yearExpenses.forEach(exp => {
    const month = Number(String(exp.expense_date).split('-')[1]) - 1;
    if (month >= 0 && month < 12) {
      monthly[month] += Number(exp.amount || 0);
    }
  });

  renderBarChart(
    'monthlyChart',
    ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    monthly,
    'Chi tiêu theo tháng'
  );

  const categories = {};
  filtered.forEach(exp => {
    const key = exp.category || 'other';
    categories[key] = (categories[key] || 0) + Number(exp.amount || 0);
  });

  const labels = Object.keys(categories);
  const values = labels.map(key => categories[key]);

  renderDoughnutChart('categoryChart', labels.length ? labels : ['Không có dữ liệu'], values.length ? values : [1], 'Theo danh mục');
}

function setText(id, value) {
  const el = getEl(id);
  if (el) el.innerText = value;
}

async function initStatsPage() {
  const user = await checkAuth();
  if (!user) return;

  populateYearOptions();
  populateMonthOptions();

  const yearFilter = getEl('yearFilter');
  const monthFilter = getEl('monthFilter');

  if (yearFilter) {
    yearFilter.addEventListener('change', async () => {
      await loadExpensesByYear(Number(yearFilter.value));
    });
  }

  if (monthFilter) {
    monthFilter.addEventListener('change', renderStatsPage);
  }

  await loadExpensesByYear(currentYear);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStatsPage);
} else {
  initStatsPage();
}
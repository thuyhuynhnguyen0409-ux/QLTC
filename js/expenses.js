import { supabase } from './supabase.js';
import * as state from './state.js';
import { parseCurrency, getTodayString } from './utils.js';
import { loadTodayBudget, syncTodayBudgetRow, recalcFutureBudgetsFromToday } from './budget.js';
import { updateHomeUI } from './ui.js';
let editingExpenseId = null
function isTodayExpense(expense) {
  return expense?.expense_date === getTodayString();
}

export async function loadExpenses() {
  if (!state.user) return [];

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', state.user.id)
    .is('deleted_at', null)
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    state.setExpenses([]);
    return [];
  }

  state.setExpenses(data || []);
  return state.expenses;
}

export async function addExpense(name, amount, category) {
  if (!state.user || !state.currentCycle) {
    alert('Hãy thiết lập ngân sách trước');
    return false;
  }

  const val = parseCurrency(amount);
  const cleanName = String(name || '').trim();
  const cleanCategory = String(category || 'other').trim();
  const today = getTodayString();

  if (!cleanName || !val || val <= 0) {
    alert('Tên hoặc số tiền không hợp lệ');
    return false;
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert([{
      user_id: state.user.id,
      name: cleanName,
      amount: val,
      category: cleanCategory,
      expense_date: today
    }])
    .select()
    .single();

  if (error) {
    console.error(error);
    alert('Không thể thêm chi tiêu');
    return false;
  }

  state.setExpenses([data, ...state.expenses]);

  state.currentCycle.total_spent = Number(state.currentCycle.total_spent || 0) + val;
  state.currentCycle.remaining_money = Number(state.currentCycle.remaining_money || 0) - val;

  const newSpentToday = Number(state.todayBudget?.spent || 0) + val;
  const newRemainingToday = Number(state.todayBudget?.allocated || 0) - newSpentToday;

  state.setTodayBudget({
    ...(state.todayBudget || {}),
    spent: newSpentToday,
    remaining: newRemainingToday
  });

  const { error: cycleError } = await supabase
    .from('monthly_cycles')
    .update({
      total_spent: state.currentCycle.total_spent,
      remaining_money: state.currentCycle.remaining_money
    })
    .eq('id', state.currentCycle.id);

  if (cycleError) console.error(cycleError);

  await syncTodayBudgetRow();
  await recalcFutureBudgetsFromToday();
  await loadTodayBudget();
  updateHomeUI();

  return true;
}

export async function deleteExpense(id) {
  if (!state.user || !state.currentCycle) return false;

  const expense = state.expenses.find(e => e.id === id);
  if (!expense) return false;

  if (!isTodayExpense(expense)) {
    alert('Bản này chỉ xóa khoản chi hôm nay');
    return false;
  }

  if (!confirm('Xóa khoản chi này?')) return false;

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(error);
    alert('Không thể xóa');
    return false;
  }

  const amount = Number(expense.amount || 0);

  state.setExpenses(state.expenses.filter(e => e.id !== id));

  state.currentCycle.total_spent = Number(state.currentCycle.total_spent || 0) - amount;
  state.currentCycle.remaining_money = Number(state.currentCycle.remaining_money || 0) + amount;

  const newSpentToday = Math.max(0, Number(state.todayBudget?.spent || 0) - amount);
  const newRemainingToday = Number(state.todayBudget?.allocated || 0) - newSpentToday;

  state.setTodayBudget({
    ...(state.todayBudget || {}),
    spent: newSpentToday,
    remaining: newRemainingToday
  });

  const { error: cycleError } = await supabase
    .from('monthly_cycles')
    .update({
      total_spent: state.currentCycle.total_spent,
      remaining_money: state.currentCycle.remaining_money
    })
    .eq('id', state.currentCycle.id);

  if (cycleError) console.error(cycleError);

  await syncTodayBudgetRow();
  await recalcFutureBudgetsFromToday();
  await loadTodayBudget();
  updateHomeUI();
  return true;
}

export async function editExpense(id) {
  if (!state.user || !state.currentCycle) return false;

  const expense = state.expenses.find(e => e.id === id);
  if (!expense) return false;

  if (!isTodayExpense(expense)) {
    alert('Bản này chỉ sửa khoản chi hôm nay');
    return false;
  }

  const newName = prompt('Tên khoản chi', expense.name);
  if (newName === null) return false;

  const newAmountRaw = prompt('Số tiền', String(expense.amount));
  if (newAmountRaw === null) return false;

  const newCategory = prompt('Danh mục', expense.category) ?? expense.category;

  const newNameClean = String(newName || '').trim();
  const newAmount = parseCurrency(newAmountRaw);

  if (!newNameClean || !newAmount || newAmount <= 0) {
    alert('Dữ liệu không hợp lệ');
    return false;
  }

  const oldAmount = Number(expense.amount || 0);
  const diff = newAmount - oldAmount;

  const { error } = await supabase
    .from('expenses')
    .update({
      name: newNameClean,
      amount: newAmount,
      category: String(newCategory || 'other').trim()
    })
    .eq('id', id);

  if (error) {
    console.error(error);
    alert('Không thể cập nhật');
    return false;
  }

  state.setExpenses(
    state.expenses.map(e =>
      e.id === id
        ? { ...e, name: newNameClean, amount: newAmount, category: String(newCategory || 'other').trim() }
        : e
    )
  );

  state.currentCycle.total_spent = Number(state.currentCycle.total_spent || 0) + diff;
  state.currentCycle.remaining_money = Number(state.currentCycle.remaining_money || 0) - diff;

  const newSpentToday = Number(state.todayBudget?.spent || 0) + diff;
  const newRemainingToday = Number(state.todayBudget?.allocated || 0) - newSpentToday;

  state.setTodayBudget({
    ...(state.todayBudget || {}),
    spent: newSpentToday,
    remaining: newRemainingToday
  });

  const { error: cycleError } = await supabase
    .from('monthly_cycles')
    .update({
      total_spent: state.currentCycle.total_spent,
      remaining_money: state.currentCycle.remaining_money
    })
    .eq('id', state.currentCycle.id);

  if (cycleError) console.error(cycleError);

  await syncTodayBudgetRow();
  await recalcFutureBudgetsFromToday();
  await loadTodayBudget();
  updateHomeUI();
  return true;
}

export async function transferSavingsToBudget() {
  if (!state.user || !state.currentCycle) {
    alert('Chưa có chu kỳ ngân sách');
    return false;
  }

  const raw = prompt('Nhập số tiền muốn chuyển từ hũ tiết kiệm sang chi tiêu', '100000');
  if (raw === null) return false;

  const val = parseCurrency(raw);
  if (!val || val <= 0) {
    alert('Số tiền không hợp lệ');
    return false;
  }

  if (val > Number(state.currentSavings || 0)) {
    alert('Không đủ tiền trong hũ tiết kiệm');
    return false;
  }

  const newSavings = Number(state.currentSavings || 0) - val;
  const newRemainingCycle = Number(state.currentCycle.remaining_money || 0) + val;

  state.setCurrentSavings(newSavings);
  state.currentCycle.remaining_money = newRemainingCycle;

  if (state.todayBudget) {
    state.todayBudget.allocated = Number(state.todayBudget.allocated || 0) + val;
    state.todayBudget.remaining = Number(state.todayBudget.remaining || 0) + val;
  }

  const { error: settingsError } = await supabase
    .from('settings')
    .update({ current_savings: newSavings })
    .eq('user_id', state.user.id);

  if (settingsError) console.error(settingsError);

  const { error: cycleError } = await supabase
    .from('monthly_cycles')
    .update({ remaining_money: newRemainingCycle })
    .eq('id', state.currentCycle.id);

  if (cycleError) console.error(cycleError);

  await syncTodayBudgetRow();
  await recalcFutureBudgetsFromToday();
  await loadTodayBudget();
  updateHomeUI();
  return true;
}

export async function renderExpenseList() {
  const wrap = document.getElementById('expenseList');
  if (!wrap) return;

  const today = getTodayString();
  const list = (state.expenses || [])
    .filter(e => e.expense_date === today && !e.deleted_at)
    .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));

  if (!list.length) {
    wrap.innerHTML = `
      <div class="text-center py-10 text-slate-400">
        Chưa có chi tiêu hôm nay
      </div>
    `;
    return;
  }

  wrap.innerHTML = list.map(exp => `
    <div class="expense-row bg-white p-4 rounded-2xl border border-slate-100 mb-3 card-soft">
      <div class="flex justify-between gap-3">
        <div>
          <h4 class="font-bold text-slate-900">${exp.name}</h4>
          <p class="text-xs uppercase tracking-widest text-slate-400 mt-1">${exp.category || 'other'}</p>
        </div>
        <div class="text-right">
          <div class="font-black text-rose-500">${Number(exp.amount || 0).toLocaleString('vi-VN')}đ</div>
          <div class="flex gap-2 mt-3 justify-end">
            <button
              class="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-500 text-white"
              onclick='openEditExpense(${JSON.stringify(exp)})'
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
window.openEditExpense =
    openEditExpense

window.submitEditExpense =
    submitEditExpense

window.toggleEditExpenseModal =
    toggleEditExpenseModal
window.addExpense = async function () {
  const name = document.getElementById('expName')?.value || '';
  const amount = document.getElementById('expAmount')?.value || '';
  const category = document.getElementById('expCategory')?.value || 'other';
  await addExpense(name, amount, category);
};

window.deleteExpense = deleteExpense;
window.editExpense = editExpense;
window.transferSavingsToBudget = transferSavingsToBudget;
window.renderExpenseList = renderExpenseList;

export function toggleEditExpenseModal(show) {

  document
    .getElementById('editExpenseModal')
    .classList.toggle(
      'hidden',
      !show
    )
}

export function openEditExpense(expense) {

  editingExpenseId = expense.id

  document
    .getElementById('editExpenseName')
    .value = expense.name

  document
    .getElementById('editExpenseAmount')
    .value = expense.amount

  document
    .getElementById('editExpenseCategory')
    .value = expense.category

  toggleEditExpenseModal(true)
}

export async function submitEditExpense() {

  const name =
    document
      .getElementById('editExpenseName')
      .value

  const amount =
    Number(
      document
        .getElementById('editExpenseAmount')
        .value
    )

  const category =
    document
      .getElementById('editExpenseCategory')
      .value

  const oldExpense =
    state.expenses.find(
      exp => exp.id === editingExpenseId
    )

  if (!oldExpense) return

  const diff =
    amount - Number(oldExpense.amount)

  const {
    error
  } = await supabase
    .from('expenses')
    .update({
      name,
      amount,
      category
    })
    .eq(
      'id',
      editingExpenseId
    )

  if (error) {

    alert('Lỗi cập nhật')
    return
  }

  state.currentCycle.remaining_money -= diff

  await supabase
    .from('monthly_cycles')
    .update({
      remaining_money:
        state.currentCycle.remaining_money
    })
    .eq(
      'id',
      state.currentCycle.id
    )

  oldExpense.name = name
  oldExpense.amount = amount
  oldExpense.category = category

  loadTodayBudget()

  updateHomeUI()

  toggleEditExpenseModal(false)
}
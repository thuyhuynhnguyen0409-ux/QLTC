import { supabase } from './supabase.js';
import * as state from './state.js';
import { getTodayString } from './utils.js';
import { loadTodayBudget, recalcFutureBudgetsFromToday, syncTodayBudgetRow } from './budget.js';
import { updateHomeUI } from './ui.js';

export async function closeDay() {
  if (!state.user || !state.currentCycle) {
    alert('Chưa có chu kỳ ngân sách');
    return false;
  }

  if (!state.todayBudget) {
    await loadTodayBudget();
  }

  if (!state.todayBudget) return false;

  if (state.todayBudget.is_closed) {
    alert('Ngày hôm nay đã được chốt');
    return false;
  }

  const remain = Number(state.todayBudget.remaining || 0);
  let addedToSavings = 0;

  if (remain > 0) {
    addedToSavings = remain;
  }

  const newSavings = Number(state.currentSavings || 0) + addedToSavings;
  const newRemainCycle = Number(state.currentCycle.remaining_money || 0) - addedToSavings;

  state.setCurrentSavings(newSavings);
  state.currentCycle.remaining_money = newRemainCycle;
  state.currentCycle.total_saved_extra = Number(state.currentCycle.total_saved_extra || 0) + addedToSavings;

  state.todayBudget.is_closed = true;
  state.todayBudget.is_processed = true;
  state.todayBudget.saved_to_savings = addedToSavings;
  state.todayBudget.remaining = remain > 0 ? 0 : remain;

  const { error: settingsError } = await supabase
    .from('settings')
    .update({ current_savings: newSavings })
    .eq('user_id', state.user.id);

  if (settingsError) console.error(settingsError);

  const { error: cycleError } = await supabase
    .from('monthly_cycles')
    .update({
      remaining_money: newRemainCycle,
      total_saved_extra: state.currentCycle.total_saved_extra
    })
    .eq('id', state.currentCycle.id);

  if (cycleError) console.error(cycleError);

  await syncTodayBudgetRow();
  await recalcFutureBudgetsFromToday();
  await loadTodayBudget();
  updateHomeUI();

  if (addedToSavings > 0) {
    alert(`Đã chuyển ${addedToSavings.toLocaleString('vi-VN')}đ vào hũ tiết kiệm`);
  } else {
    alert('Đã chốt ngày hôm nay');
  }

  return true;
}

window.closeDay = closeDay;
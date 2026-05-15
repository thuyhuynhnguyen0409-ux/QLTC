import { supabase } from './supabase.js';
import * as state from './state.js';
import { buildCycleRange, daysBetweenInclusive, getTodayString } from './utils.js';

function getTotalFixed() {
  return (state.fixedCosts || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
}

function getCyclePayload() {
  const salary = Number(state.settings.salary || 0);
  const baseSavings = Number(state.settings.base_savings || 0);
  const totalFixed = getTotalFixed();
  const usableMoney = salary - totalFixed - baseSavings;

  const { start, end } = buildCycleRange(
    Number(state.settings.payday || 1),
    Number(state.settings.cycle_end_day || 30),
    new Date()
  );

  const cycleStart = getTodayString(start);
  const cycleEnd = getTodayString(end);

  return {
    cycleStart,
    cycleEnd,
    salary,
    baseSavings,
    totalFixed,
    usableMoney
  };
}

export async function ensureDailyBudgetRows(cycle) {
  const { data: rows, error } = await supabase
    .from('daily_budgets')
    .select('id')
    .eq('cycle_id', cycle.id);

  if (error) {
    console.error(error);
    return [];
  }

  if (rows && rows.length) return rows;

  const totalDays = daysBetweenInclusive(cycle.cycle_start, cycle.cycle_end);
  const perDay = Math.trunc(Number(cycle.usable_money || 0) / totalDays);

  const inserts = [];
  const start = new Date(`${cycle.cycle_start}T00:00:00`);

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    inserts.push({
      user_id: state.user.id,
      cycle_id: cycle.id,
      budget_date: getTodayString(d),
      allocated: perDay,
      custom_allocated: perDay,
      spent: 0,
      remaining: perDay,
      carry_over: 0,
      saved_to_savings: 0,
      is_closed: false,
      is_processed: false
    });
  }

  const { error: insertError } = await supabase.from('daily_budgets').insert(inserts);
  if (insertError) console.error(insertError);

  return inserts;
}

export async function ensureCurrentCycle() {
  if (!state.user) return null;

  const today = getTodayString();
  const { cycleStart, cycleEnd, salary, baseSavings, totalFixed, usableMoney } = getCyclePayload();

  const { data: existing, error } = await supabase
    .from('monthly_cycles')
    .select('*')
    .eq('user_id', state.user.id)
    .eq('is_closed', false)
    .lte('cycle_start', today)
    .gte('cycle_end', today)
    .maybeSingle();

  if (error) console.error(error);

  if (existing) {
    state.setCurrentCycle(existing);
    await ensureDailyBudgetRows(existing);
    return existing;
  }

  const payload = {
    user_id: state.user.id,
    cycle_start: cycleStart,
    cycle_end: cycleEnd,
    total_income: salary,
    total_fixed: totalFixed,
    total_savings: baseSavings,
    usable_money: usableMoney,
    remaining_money: usableMoney,
    total_spent: 0,
    total_saved_extra: 0,
    is_closed: false
  };

  const { data: cycle, error: insertError } = await supabase
    .from('monthly_cycles')
    .insert(payload)
    .select()
    .single();

  if (insertError) {
    console.error(insertError);
    return null;
  }

  state.setCurrentCycle(cycle);
  await ensureDailyBudgetRows(cycle);
  return cycle;
}

export async function refreshCurrentCycleFromSettings() {
  if (!state.currentCycle) return null;

  const totalFixed = getTotalFixed();
  const salary = Number(state.settings.salary || 0);
  const baseSavings = Number(state.settings.base_savings || 0);
  const newUsableMoney = salary - totalFixed - baseSavings;
  const oldUsableMoney = Number(state.currentCycle.usable_money || 0);
  const diff = newUsableMoney - oldUsableMoney;
  const newRemainingMoney = Number(state.currentCycle.remaining_money || 0) + diff;

  const payload = {
    total_income: salary,
    total_fixed: totalFixed,
    total_savings: baseSavings,
    usable_money: newUsableMoney,
    remaining_money: newRemainingMoney
  };

  const { error } = await supabase
    .from('monthly_cycles')
    .update(payload)
    .eq('id', state.currentCycle.id);

  if (error) console.error(error);

  state.setCurrentCycle({
    ...state.currentCycle,
    ...payload
  });

  await recalcFutureBudgetsFromToday();
  return state.currentCycle;
}

export async function loadTodayBudget() {
  if (!state.currentCycle) return null;

  const today = getTodayString();

  let { data: row, error } = await supabase
    .from('daily_budgets')
    .select('*')
    .eq('cycle_id', state.currentCycle.id)
    .eq('budget_date', today)
    .maybeSingle();

  if (error) console.error(error);

  if (!row) {
    const daysLeft = Math.max(1, daysBetweenInclusive(today, state.currentCycle.cycle_end));
    const perDay = Math.trunc(Number(state.currentCycle.remaining_money || 0) / daysLeft);

    const { data: inserted, error: insertError } = await supabase
      .from('daily_budgets')
      .insert({
        user_id: state.user.id,
        cycle_id: state.currentCycle.id,
        budget_date: today,
        allocated: perDay,
        custom_allocated: perDay,
        spent: 0,
        remaining: perDay,
        carry_over: 0,
        saved_to_savings: 0,
        is_closed: false,
        is_processed: false
      })
      .select()
      .single();

    if (insertError) {
      console.error(insertError);
      return null;
    }

    row = inserted;
  }

  const budget = {
    ...row,
    allocated: Number(row.allocated || 0),
    spent: Number(row.spent || 0),
    remaining: Number(row.remaining || 0),
    saved_to_savings: Number(row.saved_to_savings || 0),
    daysLeft: Math.max(1, daysBetweenInclusive(today, state.currentCycle.cycle_end))
  };

  state.setTodayBudget(budget);
  return budget;
}

export async function syncTodayBudgetRow() {
  if (!state.todayBudget || !state.currentCycle) return;

  const { error } = await supabase
    .from('daily_budgets')
    .update({
      allocated: state.todayBudget.allocated,
      custom_allocated: state.todayBudget.custom_allocated ?? state.todayBudget.allocated,
      spent: state.todayBudget.spent,
      remaining: state.todayBudget.remaining,
      carry_over: state.todayBudget.carry_over || 0,
      saved_to_savings: state.todayBudget.saved_to_savings || 0,
      is_closed: !!state.todayBudget.is_closed,
      is_processed: !!state.todayBudget.is_processed
    })
    .eq('id', state.todayBudget.id);

  if (error) console.error(error);
}

export async function recalcFutureBudgetsFromToday() {
  if (!state.currentCycle) return;

  const today = getTodayString();

  const { data: futureRows, error } = await supabase
    .from('daily_budgets')
    .select('*')
    .eq('cycle_id', state.currentCycle.id)
    .gt('budget_date', today)
    .order('budget_date', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  if (!futureRows || !futureRows.length) return;

  const perDay = Math.trunc(Number(state.currentCycle.remaining_money || 0) / futureRows.length);

  await Promise.all(
    futureRows.map(row =>
      supabase
        .from('daily_budgets')
        .update({
          allocated: perDay,
          custom_allocated: perDay,
          remaining: perDay
        })
        .eq('id', row.id)
    )
  );
}
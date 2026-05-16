import { supabase } from './supabase.js';
import * as state from './state.js';
import {
  parseCurrency,
  formatCurrencyInput
} from './utils.js';

import {
  refreshCurrentCycleFromSettings
} from './budget.js';

function getEl(id) {
  return document.getElementById(id);
}

export function addFixedCostRow(
  name = '',
  amount = ''
) {

  const box =
    getEl('fixedCostsList');

  if (!box) return;

  const row =
    document.createElement('div');

  row.className =
    'fixed-cost-row grid grid-cols-[1fr_140px_auto] gap-2 items-center';

  row.innerHTML = `
    <input
      type="text"
      class="fixed-name w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none"
      placeholder="Tên chi phí cố định"
      value="${name}"
    />

    <input
      type="text"
      class="fixed-amount w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-right"
      placeholder="0"
      value="${
        amount
          ? Number(amount)
              .toLocaleString('vi-VN')
          : ''
      }"
    />

    <button
      type="button"
      class="w-11 h-11 rounded-2xl bg-rose-500 text-white font-black"
      title="Xóa"
    >
      ×
    </button>
  `;

  row
    .querySelector('.fixed-amount')
    .addEventListener(
      'input',
      function () {
        formatCurrencyInput(this);
      }
    );

  row
    .querySelector('button')
    .addEventListener(
      'click',
      () => row.remove()
    );

  box.appendChild(row);
}

export function fillSettingsForm() {

  const salaryInput =
    getEl('salaryInput');

  const paydayInput =
    getEl('paydayInput');

  const cycleEndInput =
    getEl('cycleEndInput');

  const savingsInput =
    getEl('savingsInput');

  const fixedList =
    getEl('fixedCostsList');

  if (salaryInput) {

    salaryInput.value =
      state.settings.salary
        ? Number(
            state.settings.salary
          ).toLocaleString('vi-VN')
        : '';
  }

  if (paydayInput) {

    paydayInput.value =
      state.settings.payday || 1;
  }

  if (cycleEndInput) {

    cycleEndInput.value =
      state.settings.cycle_end_day || 30;
  }

  if (savingsInput) {

    savingsInput.value =
      state.settings.base_savings
        ? Number(
            state.settings.base_savings
          ).toLocaleString('vi-VN')
        : '';
  }

  if (fixedList) {

    fixedList.innerHTML = '';

    if (
      state.fixedCosts &&
      state.fixedCosts.length
    ) {

      state.fixedCosts.forEach(
        item =>
          addFixedCostRow(
            item.name,
            item.amount
          )
      );

    } else {

      addFixedCostRow();
    }
  }
}

export async function loadSettings() {

  if (!state.user)
    return state.settings;

  // SETTINGS

  const {
    data: settingsRow,
    error
  } =
    await supabase
      .from('settings')
      .select('*')
      .eq(
        'user_id',
        state.user.id
      )
      .maybeSingle();

  if (error) {
    console.error(error);
  }

  if (settingsRow) {

    state.setSettings(
      settingsRow
    );

  } else {

    state.setSettings({
      salary: 0,
      payday: 1,
      cycle_end_day: 30,
      base_savings: 0,
      current_savings: 0
    });
  }

  // FIXED COSTS

  const {
    data: fixedRows,
    error: fixedError
  } =
    await supabase
      .from('fixed_costs')
      .select('*')
      .eq(
        'user_id',
        state.user.id
      )
      .is(
        'deleted_at',
        null
      )
      .order(
        'created_at',
        {
          ascending: true
        }
      );

  if (fixedError) {
    console.error(fixedError);
  }

  state.setFixedCosts(
    fixedRows || []
  );

  return state.settings;
}

export async function saveSettings() {

  if (!state.user)
    return false;

  const salary =
    parseCurrency(
      getEl(
        'salaryInput'
      )?.value || '0'
    );

  const payday =
    parseInt(
      getEl(
        'paydayInput'
      )?.value || '1',
      10
    ) || 1;

  const cycleEndDay =
    parseInt(
      getEl(
        'cycleEndInput'
      )?.value || '30',
      10
    ) || 30;

  const baseSavings =
    parseCurrency(
      getEl(
        'savingsInput'
      )?.value || '0'
    );

  const rows =
    Array.from(
      document.querySelectorAll(
        '#fixedCostsList .fixed-cost-row'
      )
    );

  const fixedCosts =
    rows
      .map(row => {

        const name =
          row.querySelector(
            '.fixed-name'
          )?.value?.trim() || '';

        const amount =
          parseCurrency(
            row.querySelector(
              '.fixed-amount'
            )?.value || '0'
          );

        return {
          name,
          amount
        };
      })
      .filter(
        item =>
          item.name &&
          item.amount > 0
      );

  const currentSavingsToSave =
    state.settings?.user_id
      ? Number(
          state.currentSavings || 0
        )
      : baseSavings;

  // SAVE SETTINGS

  const {
    error: settingsError
  } =
    await supabase
      .from('settings')
      .upsert({
        user_id:
          state.user.id,

        salary,

        payday,

        cycle_end_day:
          cycleEndDay,

        base_savings:
          baseSavings,

        current_savings:
          currentSavingsToSave
      });

  if (settingsError) {

    console.error(
      settingsError
    );

    alert(
      'Lỗi lưu thiết lập'
    );

    return false;
  }

  // DELETE OLD FIXED COSTS

  const {
    error: deleteError
  } =
    await supabase
      .from('fixed_costs')
      .delete()
      .eq(
        'user_id',
        state.user.id
      );

  if (deleteError) {
    console.error(deleteError);
  }

  // INSERT NEW FIXED COSTS

  if (fixedCosts.length) {

    const {
      error: insertError
    } =
      await supabase
        .from('fixed_costs')
        .insert(

          fixedCosts.map(
            item => ({

              user_id:
                state.user.id,

              name:
                item.name,

              amount:
                item.amount
            })
          )
        );

    if (insertError) {
      console.error(insertError);
    }
  }

  // UPDATE STATE

  state.setSettings({

    salary,

    payday,

    cycle_end_day:
      cycleEndDay,

    base_savings:
      baseSavings,

    current_savings:
      currentSavingsToSave
  });

  state.setFixedCosts(
    fixedCosts
  );

  state.setCurrentSavings(
    currentSavingsToSave
  );

  await refreshCurrentCycleFromSettings();

  if (
    typeof window.__refreshApp ===
    'function'
  ) {

    await window.__refreshApp();
  }

  return true;
}

window.addFixedCostRow =
  addFixedCostRow;

window.saveSettings =
  saveSettings;
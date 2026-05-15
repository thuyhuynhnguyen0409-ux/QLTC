export function parseCurrency(value) {
  if (value === null || value === undefined) return 0;
  return Number(String(value).replace(/[^\d-]/g, '')) || 0;
}

export function formatMoney(value = 0) {
  return Number(value || 0).toLocaleString('vi-VN') + 'đ';
}

export function formatCurrencyInput(input) {
  const raw = String(input.value || '').replace(/[^\d]/g, '');
  input.value = raw ? Number(raw).toLocaleString('vi-VN') : '';
}

export function getTodayString(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);

  const year = parts.find(p => p.type === 'year')?.value || '1970';
  const month = parts.find(p => p.type === 'month')?.value || '01';
  const day = parts.find(p => p.type === 'day')?.value || '01';

  return `${year}-${month}-${day}`;
}

export function safeDate(year, monthIndex, day) {
  const first = new Date(year, monthIndex, 1);
  const lastDay = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return new Date(first.getFullYear(), first.getMonth(), Math.min(Math.max(day, 1), lastDay));
}

export function buildCycleRange(payday, cycleEndDay, referenceDate = new Date()) {
  const y = referenceDate.getFullYear();
  const m = referenceDate.getMonth();

  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  let start = safeDate(y, m, payday);

  if (today < start) {
    start = safeDate(y, m - 1, payday);
  }

  let end = safeDate(start.getFullYear(), start.getMonth(), cycleEndDay);

  if (end <= start) {
    end = safeDate(start.getFullYear(), start.getMonth() + 1, cycleEndDay);
  }

  return { start, end };
}

export function daysBetweenInclusive(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  return Math.max(1, Math.floor((end - start) / 86400000) + 1);
}
import * as state from './state.js';
import { getDaysRemaining } from './utils.js';

export function loadTodayBudget() {
    if (!state.currentCycle) return null;

    // 1. Tính số ngày còn lại trong chu kỳ
    const daysLeft = getDaysRemaining(state.currentCycle.cycle_end_day);

    // 2. Tính hạn mức mỗi ngày (Dựa trên tổng tiền còn lại trong chu kỳ / số ngày còn lại)
    // Nếu hôm qua tiêu âm, remaining_money đã nhỏ đi -> dailyAllocation tự giảm cho các ngày sau
    const dailyAllocation = state.currentCycle.remaining_money / daysLeft;

    // 3. Tính số tiền đã tiêu hôm nay
    const todayStr = new Date().toISOString().split('T')[0];
    const spentToday = state.expenses
        .filter(exp => exp.expense_date === todayStr)
        .reduce((sum, exp) => sum + Number(exp.amount), 0);

    const budgetData = {
        allocated: dailyAllocation, // Số tiền hiển thị cho các ngày tiếp theo
        spent: spentToday,
        remaining: dailyAllocation - spentToday, // Số tiền còn lại của riêng hôm nay (có thể âm)
        daysLeft: daysLeft
    };

    state.setTodayBudget(budgetData);
    return budgetData;
}
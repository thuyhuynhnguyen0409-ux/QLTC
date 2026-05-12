import { supabase } from './supabase.js';
import * as state from './state.js';
import { loadTodayBudget } from './budget.js';
import { updateHomeUI } from './ui.js';

export async function addExpense(name, amount, category) {
    const val = Number(amount);
    if (isNaN(val) || val <= 0) return alert("Số tiền không hợp lệ");

    // 1. Thêm vào DB
    const { data, error } = await supabase
        .from('expenses')
        .insert([{
            user_id: state.user.id,
            name: name,
            amount: val,
            category: category,
            expense_date: new Date().toISOString().split('T')[0]
        }])
        .select();

    if (error) return alert("Lỗi lưu dữ liệu");

    // 2. Cập nhật số dư chu kỳ (Trừ thẳng vào tổng tiền còn lại)
    const newRemaining = state.currentCycle.remaining_money - val;
    await supabase
        .from('monthly_cycles')
        .update({ remaining_money: newRemaining })
        .eq('id', state.currentCycle.id);

    // 3. Cập nhật state cục bộ
    state.setExpenses([data[0], ...state.expenses]);
    state.currentCycle.remaining_money = newRemaining;

    // 4. LOGIC TIẾT KIỆM (Tùy chọn): Nếu bạn muốn mỗi lần tiêu dư thì cộng vào hũ ngay, 
    // nhưng theo logic của bạn là "Tiêu ít hơn cho phép thì gửi vào hũ". 
    // Chúng ta sẽ thực hiện việc "Chốt hũ" vào cuối ngày hoặc thủ công.

    loadTodayBudget();
    updateHomeUI();
}

// Hàm chuyển tiền từ tiết kiệm sang chi tiêu (Tăng hạn mức)
export async function transferSavings(amount) {
    const val = Number(amount);
    const newSavings = state.currentSavings - val;
    const newRemaining = state.currentCycle.remaining_money + val;

    await supabase.from('settings').update({ current_savings: newSavings }).eq('user_id', state.user.id);
    await supabase.from('monthly_cycles').update({ remaining_money: newRemaining }).eq('id', state.currentCycle.id);

    state.setCurrentSavings(newSavings);
    state.currentCycle.remaining_money = newRemaining;
    
    loadTodayBudget();
    updateHomeUI();
}
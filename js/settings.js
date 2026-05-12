import { supabase } from './supabase.js';
import * as state from './state.js';

export async function loadSettings() {
    const { data: settings } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', state.user.id)
        .single();

    const { data: fixedCosts } = await supabase
        .from('fixed_costs')
        .select('*')
        .eq('user_id', state.user.id);

    if (settings) state.setSettings(settings);
    if (fixedCosts) state.setFixedCosts(fixedCosts);
}

export async function saveFinanceSettings(salary, payday, cycleEnd, baseSavings, fixedCostsArray) {
    // 1. Cập nhật bảng settings
    await supabase.from('settings').upsert({
        user_id: state.user.id,
        salary: salary,
        payday: payday,
        base_savings: baseSavings,
        cycle_length: cycleEnd // Ở đây hiểu là ngày kết thúc
    });

    // 2. Cập nhật chi phí cố định
    await supabase.from('fixed_costs').delete().eq('user_id', state.user.id);
    if (fixedCostsArray.length > 0) {
        const rows = fixedCostsArray.map(item => ({
            user_id: state.user.id,
            name: item.name,
            amount: item.amount
        }));
        await supabase.from('fixed_costs').insert(rows);
    }

    alert("Đã lưu thiết lập!");
    window.location.reload();
}
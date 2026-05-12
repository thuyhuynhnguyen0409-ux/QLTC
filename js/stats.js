import { supabase } from './supabase.js';
import * as state from './state.js';

export async function getYearlyStats(year) {
    const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', state.user.id)
        .gte('expense_date', `${year}-01-01`)
        .lte('expense_date', `${year}-12-31`);

    if (error) return {};

    // Gom nhóm dữ liệu theo tháng
    const monthlyStats = Array(12).fill(0);
    data.forEach(exp => {
        const month = new Date(exp.expense_date).getMonth();
        monthlyStats[month] += Number(exp.amount);
    });

    return monthlyStats;
}
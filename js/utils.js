export function parseCurrency(value) {
    return parseInt(String(value).replace(/\D/g, '')) || 0;
}

export function formatMoney(n) {
    const sign = n < 0 ? '-' : '';
    return (
        sign +
        new Intl.NumberFormat('vi-VN').format(Math.abs(n || 0)) +
        'đ'
    );
}

export function formatCurrencyInput(input) {
    let value = input.value.replace(/\D/g, '');
    input.value = value
        ? new Intl.NumberFormat('vi-VN').format(parseInt(value))
        : '';
}

// Tính số ngày còn lại trong chu kỳ lương
export function getDaysRemaining(cycleEnd) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const end = new Date(cycleEnd);
    end.setHours(0, 0, 0, 0);

    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 0 ? 1 : diffDays + 1; // Luôn còn ít nhất 1 ngày (là hôm nay)
}
export function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function getDaysRemaining(endDateDay) {
    const now = new Date();
    const today = now.getDate();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    let days = 0;
    if (today <= endDateDay) {
        days = endDateDay - today + 1;
    } else {
        // Nếu đã qua ngày kết thúc tháng này, tính đến ngày đó của tháng sau
        days = (lastDayOfMonth - today) + endDateDay + 1;
    }
    return days > 0 ? days : 1;
}
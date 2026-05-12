export function formatMoney(value) {

    return Number(value || 0)
        .toLocaleString('vi-VN') + 'đ'
}

export function getTodayString() {

    return new Date()
        .toISOString()
        .split('T')[0]
}

export function calculateRemainingDays(cycleEndDate) {

    const today =
        new Date()

    const end =
        new Date(cycleEndDate)

    const diff =
        end - today

    const days =
        Math.ceil(
            diff / (1000 * 60 * 60 * 24)
        )

    return days <= 0 ? 1 : days
}
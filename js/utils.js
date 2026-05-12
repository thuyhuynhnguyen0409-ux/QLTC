export function formatMoney(value = 0) {

    return Number(value)
        .toLocaleString('vi-VN') + 'đ'
}

export function getToday() {

    return new Date()
        .toISOString()
        .split('T')[0]
}

export function getDaysRemaining(endDate) {

    const today =
        new Date()

    const end =
        new Date(endDate)

    const diff =
        Math.ceil(
            (
                end - today
            ) / (
                1000 * 60 * 60 * 24
            )
        )

    return diff <= 0
        ? 1
        : diff
}
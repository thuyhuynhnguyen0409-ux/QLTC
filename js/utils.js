export function parseCurrency(value) {

    return parseInt(
        String(value)
            .replace(/\D/g, '')
    ) || 0
}

export function formatMoney(n) {

    const sign = n < 0 ? '-' : ''

    return (
        sign +
        new Intl.NumberFormat('vi-VN')
            .format(Math.abs(n || 0))
        + 'đ'
    )
}

export function formatCurrencyInput(input) {

    let value =
        input.value.replace(/\D/g, '')

    input.value =
        value
            ? new Intl.NumberFormat('vi-VN')
                .format(parseInt(value))
            : ''
}

export function daysBetween(start, end) {

    return Math.ceil(
        (end - start) / 86400000
    ) + 1
}
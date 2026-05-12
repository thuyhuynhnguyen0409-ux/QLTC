export function renderChart(
    fixed,
    spent,
    remain,
    saving
) {

    const ctx =
        document.getElementById('mainChart')

    new Chart(ctx, {
        type: 'doughnut',

        data: {
            labels: [
                'Cố định',
                'Đã tiêu',
                'Còn lại',
                'Tiết kiệm'
            ],

            datasets: [{
                data: [
                    fixed,
                    spent,
                    remain,
                    saving
                ]
            }]
        }
    })
}
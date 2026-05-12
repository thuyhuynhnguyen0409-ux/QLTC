export function renderChart(
    fixed,
    spent,
    remain,
    saving
) {

    const ctx =
        document.getElementById(
            'mainChart'
        )

    if (!ctx) return

    const oldChart =
        Chart.getChart(ctx)

    if (oldChart) {

        oldChart.destroy()
    }

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

                    Math.max(fixed, 0),

                    Math.max(spent, 0),

                    Math.max(remain, 0),

                    Math.max(saving, 0)
                ],

                backgroundColor: [

                    '#6366f1',

                    '#ef4444',

                    '#10b981',

                    '#f59e0b'
                ],

                borderWidth: 0
            }]
        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    position: 'bottom'
                }
            },

            cutout: '70%'
        }
    })
}
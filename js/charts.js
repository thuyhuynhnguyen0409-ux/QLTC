export function renderChart(fixed, spent, remain, saving) {
    const ctx = document.getElementById('mainChart');
    if (!ctx) return;

    // Hủy biểu đồ cũ nếu tồn tại để tránh lỗi ghi đè
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.destroy();
    }

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Cố định', 'Đã tiêu', 'Còn lại', 'Tiết kiệm'],
            datasets: [{
                data: [fixed, spent, remain, saving],
                backgroundColor: [
                    '#6366f1', // Indigo (Cố định)
                    '#ef4444', // Red (Đã tiêu)
                    '#10b981', // Emerald (Còn lại)
                    '#f59e0b'  // Amber (Tiết kiệm)
                ],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        padding: 20
                    }
                }
            },
            cutout: '70%' // Làm biểu đồ vòng khuyên mỏng hơn
        }
    });
}
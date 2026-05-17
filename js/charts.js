const chartStore = new Map();

// ======================
// DESTROY CHART
// ======================
function destroyChart(canvasId) {
  const existing = chartStore.get(canvasId);
  if (existing) {
    existing.destroy();
    chartStore.delete(canvasId);
  }
}

// ======================
// FORMAT MONEY
// ======================
function formatMoney(v = 0) {
  return Math.floor(Number(v || 0))
    .toLocaleString('vi-VN') + 'đ';
}

// ======================
// HOME CHART (QUAN TRỌNG NHẤT)
// ======================
export function renderHomeChart(fixed, spent, remain, saving) {

  const canvas = document.getElementById('mainChart');
  if (!canvas || typeof Chart === 'undefined') return;

  destroyChart('mainChart');

  const values = [
    Math.max(0, Number(fixed || 0)),
    Math.max(0, Number(spent || 0)),
    Math.max(0, Number(remain || 0)),
    Math.max(0, Number(saving || 0))
  ];

  const total =
    values.reduce((a, b) => a + b, 0) || 1;

  const chart = new Chart(canvas, {
    type: 'doughnut',

    data: {
      labels: ['Cố định', 'Đã tiêu', 'Còn lại', 'Tiết kiệm'],
      datasets: [{
        data: values,
        backgroundColor: [
          '#6366f1', // fixed
          '#ef4444', // spent
          '#10b981', // remain
          '#f59e0b'  // saving
        ],
        borderWidth: 0
      }]
    },

    options: {
      responsive: true,

      plugins: {

        legend: {
          position: 'bottom'
        },

        // 👉 TOOLTIP XỊN HƠN
        tooltip: {
          callbacks: {
            label: function (ctx) {

              const value = ctx.raw || 0;

              const percent =
                ((value / total) * 100).toFixed(1);

              return `${ctx.label}: ${formatMoney(value)} (${percent}%)`;
            }
          }
        }
      },

      cutout: '72%'
    }
  });

  chartStore.set('mainChart', chart);

  // ======================
  // UPDATE TEXT Ở GIỮA
  // ======================
  const center = document.getElementById('chartCenterValue');

  if (center) {
    center.innerText = formatMoney(remain);

    // đổi màu nếu sắp hết tiền
    center.classList.remove('text-emerald-600', 'text-red-500');

    if (remain < 50000) {
      center.classList.add('text-red-500');
    } else {
      center.classList.add('text-emerald-600');
    }
  }
}

// ======================
// BAR CHART
// ======================
export function renderBarChart(
  canvasId,
  labels,
  data,
  datasetLabel = 'Chi tiêu'
) {

  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') return;

  destroyChart(canvasId);

  const chart = new Chart(canvas, {
    type: 'bar',

    data: {
      labels,
      datasets: [{
        label: datasetLabel,
        data,
        backgroundColor: '#6366f1',
        borderRadius: 12,
        borderSkipped: false
      }]
    },

    options: {
      responsive: true,

      plugins: {
        legend: { display: false },

        tooltip: {
          callbacks: {
            label: (ctx) =>
              formatMoney(ctx.raw)
          }
        }
      },

      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  chartStore.set(canvasId, chart);
}

// ======================
// DOUGHNUT CHART (STATS)
// ======================
export function renderDoughnutChart(
  canvasId,
  labels,
  data,
  datasetLabel = 'Tỉ lệ'
) {

  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') return;

  destroyChart(canvasId);

  const total =
    data.reduce((a, b) => a + b, 0) || 1;

  const chart = new Chart(canvas, {
    type: 'doughnut',

    data: {
      labels,
      datasets: [{
        label: datasetLabel,
        data,
        backgroundColor: [
          '#6366f1',
          '#ef4444',
          '#10b981',
          '#f59e0b',
          '#8b5cf6',
          '#06b6d4'
        ],
        borderWidth: 0
      }]
    },

    options: {
      responsive: true,

      plugins: {

        legend: {
          position: 'bottom'
        },

        tooltip: {
          callbacks: {
            label: function (ctx) {

              const value = ctx.raw || 0;

              const percent =
                ((value / total) * 100).toFixed(1);

              return `${ctx.label}: ${formatMoney(value)} (${percent}%)`;
            }
          }
        }
      },

      cutout: '68%'
    }
  });

  chartStore.set(canvasId, chart);
}
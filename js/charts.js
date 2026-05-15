const chartStore = new Map();

function destroyChart(canvasId) {
  const existing = chartStore.get(canvasId);
  if (existing) {
    existing.destroy();
    chartStore.delete(canvasId);
  }
}

export function renderHomeChart(fixed, spent, remain, saving) {
  const canvas = document.getElementById('mainChart');
  if (!canvas || typeof Chart === 'undefined') return;

  destroyChart('mainChart');

  const chart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Cố định', 'Đã tiêu', 'Còn lại', 'Tiết kiệm'],
      datasets: [{
        data: [
          Math.max(0, Number(fixed || 0)),
          Math.max(0, Number(spent || 0)),
          Math.max(0, Number(remain || 0)),
          Math.max(0, Number(saving || 0))
        ],
        backgroundColor: ['#6366f1', '#ef4444', '#10b981', '#f59e0b'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      },
      cutout: '72%'
    }
  });

  chartStore.set('mainChart', chart);
}

export function renderBarChart(canvasId, labels, data, datasetLabel = 'Chi tiêu') {
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
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  chartStore.set(canvasId, chart);
}

export function renderDoughnutChart(canvasId, labels, data, datasetLabel = 'Tỉ lệ') {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') return;

  destroyChart(canvasId);

  const chart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        label: datasetLabel,
        data,
        backgroundColor: ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      },
      cutout: '68%'
    }
  });

  chartStore.set(canvasId, chart);
}
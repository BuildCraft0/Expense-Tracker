// chart.js - Chart.js Visual Configuration Wrapper

function getGridColor() {
  const isLight = document.documentElement.classList.contains('light-theme');
  return isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)';
}

function getTextColor() {
  const isLight = document.documentElement.classList.contains('light-theme');
  return isLight ? '#4b5563' : '#9ca3af';
}

function createIncomeVsExpenseChart(canvasElement, labels, incomeData, expenseData) {
  const ctx = canvasElement.getContext('2d');
  
  // Create gradients
  const incGradiant = ctx.createLinearGradient(0, 0, 0, 400);
  incGradiant.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
  incGradiant.addColorStop(1, 'rgba(16, 185, 129, 0.02)');
  
  const expGradiant = ctx.createLinearGradient(0, 0, 0, 400);
  expGradiant.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
  expGradiant.addColorStop(1, 'rgba(239, 68, 68, 0.02)');

  return new Chart(canvasElement, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          borderColor: '#10b981',
          backgroundColor: incGradiant,
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: '#10b981'
        },
        {
          label: 'Expense',
          data: expenseData,
          borderColor: '#ef4444',
          backgroundColor: expGradiant,
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: '#ef4444'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: getTextColor() }
        }
      },
      scales: {
        x: {
          grid: { color: getGridColor() },
          ticks: { color: getTextColor() }
        },
        y: {
          grid: { color: getGridColor() },
          ticks: { color: getTextColor() }
        }
      }
    }
  });
}

function createCategoryDoughnutChart(canvasElement, categories, data) {
  const isLight = document.documentElement.classList.contains('light-theme');
  
  const colors = [
    '#8b5cf6', '#ec4899', '#10b981', '#3b82f6', '#f59e0b',
    '#06b6d4', '#84cc16', '#a855f7', '#f43f5e', '#14b8a6',
    '#eab308', '#6366f1', '#d946ef', '#f97316', '#06b6d4'
  ];

  return new Chart(canvasElement, {
    type: 'doughnut',
    data: {
      labels: categories,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderColor: isLight ? '#ffffff' : '#141026',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: getTextColor(),
            font: { size: 11 }
          }
        }
      },
      cutout: '65%'
    }
  });
}

function createSavingsGrowthChart(canvasElement, labels, data) {
  const ctx = canvasElement.getContext('2d');
  
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(139, 92, 246, 0.5)');
  gradient.addColorStop(1, 'rgba(139, 92, 246, 0.02)');

  return new Chart(canvasElement, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Savings Growth',
        data: data,
        borderColor: '#8b5cf6',
        backgroundColor: gradient,
        fill: true,
        tension: 0.3,
        borderWidth: 3,
        pointBackgroundColor: '#8b5cf6'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { color: getGridColor() },
          ticks: { color: getTextColor() }
        },
        y: {
          grid: { color: getGridColor() },
          ticks: { color: getTextColor() }
        }
      }
    }
  });
}

function createTopCategoriesBarChart(canvasElement, categories, data) {
  return new Chart(canvasElement, {
    type: 'bar',
    data: {
      labels: categories,
      datasets: [{
        label: 'Spending Amount',
        data: data,
        backgroundColor: 'rgba(236, 72, 153, 0.7)',
        borderColor: '#ec4899',
        borderWidth: 1,
        borderRadius: 5
      }]
    },
    options: {
      indexAxis: 'y', // Horizontal bars
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { color: getGridColor() },
          ticks: { color: getTextColor() }
        },
        y: {
          grid: { display: false },
          ticks: { color: getTextColor() }
        }
      }
    }
  });
}

window.ChartModule = {
  createIncomeVsExpenseChart,
  createCategoryDoughnutChart,
  createSavingsGrowthChart,
  createTopCategoriesBarChart
};

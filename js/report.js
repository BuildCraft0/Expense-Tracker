// report.js - Reports & Analytics UI controller

let charts = {
  trend: null,
  doughnut: null,
  savings: null,
  bar: null
};

document.addEventListener('DOMContentLoaded', () => {
  // Set default dates for custom picker
  const startPicker = document.getElementById('report-start-date');
  const endPicker = document.getElementById('report-end-date');
  
  if (startPicker && endPicker) {
    const today = new Date();
    const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000);
    
    startPicker.value = thirtyDaysAgo.toISOString().split('T')[0];
    endPicker.value = today.toISOString().split('T')[0];
  }
  
  triggerReportsUpdate();
});

function toggleCustomDates() {
  const period = document.getElementById('report-period-select').value;
  const showCustom = period === 'custom';
  
  document.getElementById('report-custom-start-group').style.display = showCustom ? 'block' : 'none';
  document.getElementById('report-custom-end-group').style.display = showCustom ? 'block' : 'none';
}

function triggerReportsUpdate() {
  const state = window.StorageModule.loadState();
  const period = document.getElementById('report-period-select').value;
  
  let startDateStr = '';
  let endDateStr = '';
  
  // Calculate date boundaries
  const now = new Date();
  if (period === 'today') {
    startDateStr = now.toISOString().split('T')[0];
    endDateStr = startDateStr;
  } 
  else if (period === 'week') {
    const day = now.getDay();
    const diff = now.getDate() - day; 
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0,0,0,0);
    startDateStr = startOfWeek.toISOString().split('T')[0];
    endDateStr = new Date().toISOString().split('T')[0];
  } 
  else if (period === 'month') {
    const y = now.getFullYear();
    const m = now.getMonth();
    startDateStr = new Date(y, m, 1).toISOString().split('T')[0];
    endDateStr = new Date(y, m + 1, 0).toISOString().split('T')[0];
  } 
  else if (period === 'year') {
    const y = now.getFullYear();
    startDateStr = `${y}-01-01`;
    endDateStr = `${y}-12-31`;
  } 
  else if (period === 'custom') {
    startDateStr = document.getElementById('report-start-date').value;
    endDateStr = document.getElementById('report-end-date').value;
  }
  
  // 1. Filter Transactions for period
  const filterParams = {
    dateScope: 'custom',
    startDate: startDateStr,
    endDate: endDateStr,
    type: 'all'
  };
  
  const periodTransactions = window.FilterModule.filterTransactions(state.transactions, filterParams);
  
  // 2. Compute Summary Card figures
  const inc = periodTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  const exp = periodTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  const sav = inc - exp;
  const ratio = inc > 0 ? Math.round((sav / inc) * 100) : 0;
  
  document.getElementById('rep-income').textContent = window.SettingsModule.formatCurrency(inc);
  document.getElementById('rep-expense').textContent = window.SettingsModule.formatCurrency(exp);
  document.getElementById('rep-savings').textContent = window.SettingsModule.formatCurrency(sav);
  document.getElementById('rep-ratio').textContent = `${ratio}%`;
  
  const ratioEl = document.getElementById('rep-ratio');
  if (sav < 0) {
    document.getElementById('rep-savings').style.color = 'var(--color-danger)';
    ratioEl.style.color = 'var(--color-danger)';
  } else {
    document.getElementById('rep-savings').style.color = 'var(--color-info)';
    ratioEl.style.color = 'var(--accent-secondary)';
  }
  
  // 3. Render and Update Charts
  renderChartsData(periodTransactions, period, startDateStr, endDateStr);
}

// Prepare and draw all 4 charts
function renderChartsData(transactions, period, startDate, endDate) {
  // Clear previous configurations
  Object.keys(charts).forEach(key => {
    if (charts[key]) {
      charts[key].destroy();
      charts[key] = null;
    }
  });
  
  // Trend Chart (Income vs Expense) & Savings Growth
  let labels = [];
  let incomeSeries = [];
  let expenseSeries = [];
  let savingsSeries = [];
  
  if (period === 'week') {
    // Labels are Sunday to Saturday
    labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    incomeSeries = [0, 0, 0, 0, 0, 0, 0];
    expenseSeries = [0, 0, 0, 0, 0, 0, 0];
    
    // Calculate values for each day of the week
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day; 
    const startOfWeek = new Date(now.setDate(diff));
    
    transactions.forEach(t => {
      const d = new Date(t.date);
      const dayIdx = d.getDay();
      if (t.type === 'income') {
        incomeSeries[dayIdx] += Number(t.amount);
      } else {
        expenseSeries[dayIdx] += Number(t.amount);
      }
    });
    
    // Cumulative Savings
    let runningSavings = 0;
    for(let i=0; i<7; i++) {
      runningSavings += (incomeSeries[i] - expenseSeries[i]);
      savingsSeries.push(runningSavings);
    }
  } 
  else if (period === 'month') {
    // Labels are calendar dates
    const totalDays = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0).getDate();
    for (let i = 1; i <= totalDays; i++) {
      labels.push(i.toString());
      incomeSeries.push(0);
      expenseSeries.push(0);
    }
    
    transactions.forEach(t => {
      const dayNum = new Date(t.date).getDate();
      if (dayNum >= 1 && dayNum <= totalDays) {
        if (t.type === 'income') {
          incomeSeries[dayNum - 1] += Number(t.amount);
        } else {
          expenseSeries[dayNum - 1] += Number(t.amount);
        }
      }
    });
    
    let runningSavings = 0;
    for(let i=0; i<totalDays; i++) {
      runningSavings += (incomeSeries[i] - expenseSeries[i]);
      savingsSeries.push(runningSavings);
    }
  } 
  else if (period === 'year') {
    labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    incomeSeries = Array(12).fill(0);
    expenseSeries = Array(12).fill(0);
    
    transactions.forEach(t => {
      const monthIdx = new Date(t.date).getMonth();
      if (monthIdx >= 0 && monthIdx < 12) {
        if (t.type === 'income') {
          incomeSeries[monthIdx] += Number(t.amount);
        } else {
          expenseSeries[monthIdx] += Number(t.amount);
        }
      }
    });
    
    let runningSavings = 0;
    for(let i=0; i<12; i++) {
      runningSavings += (incomeSeries[i] - expenseSeries[i]);
      savingsSeries.push(runningSavings);
    }
  } 
  else {
    // Custom or backup: group by individual dates in range
    const datesMap = {};
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let loop = new Date(start);
    while (loop <= end) {
      const s = loop.toISOString().split('T')[0];
      datesMap[s] = { income: 0, expense: 0 };
      loop.setDate(loop.getDate() + 1);
    }
    
    transactions.forEach(t => {
      if (datesMap[t.date]) {
        if (t.type === 'income') {
          datesMap[t.date].income += Number(t.amount);
        } else {
          datesMap[t.date].expense += Number(t.amount);
        }
      }
    });
    
    labels = Object.keys(datesMap).map(d => d.substring(5)); // Show MM-DD only
    incomeSeries = Object.values(datesMap).map(v => v.income);
    expenseSeries = Object.values(datesMap).map(v => v.expense);
    
    let runningSavings = 0;
    Object.values(datesMap).forEach(v => {
      runningSavings += (v.income - v.expense);
      savingsSeries.push(runningSavings);
    });
  }
  
  // Category Doughnut Chart Data
  const catExpenses = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    catExpenses[t.category] = (catExpenses[t.category] || 0) + Number(t.amount);
  });
  
  const doughnutCategories = Object.keys(catExpenses);
  const doughnutData = Object.values(catExpenses);
  
  // Sort Top categories for Bar chart
  const sortedCategories = Object.entries(catExpenses)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // top 5
    
  const barCategories = sortedCategories.map(x => x[0]);
  const barData = sortedCategories.map(x => x[1]);

  // Drawing Trend (Line)
  const trendCanvas = document.getElementById('incomeVsExpenseCanvas');
  if (trendCanvas) {
    charts.trend = window.ChartModule.createIncomeVsExpenseChart(trendCanvas, labels, incomeSeries, expenseSeries);
  }

  // Drawing Doughnut (Pie)
  const doughnutCanvas = document.getElementById('categoryDoughnutCanvas');
  if (doughnutCanvas) {
    charts.doughnut = window.ChartModule.createCategoryDoughnutChart(doughnutCanvas, doughnutCategories, doughnutData);
  }

  // Drawing Savings Graph (Line)
  const savingsCanvas = document.getElementById('savingsGrowthCanvas');
  if (savingsCanvas) {
    charts.savings = window.ChartModule.createSavingsGrowthChart(savingsCanvas, labels, savingsSeries);
  }

  // Drawing Top Categories (Horizontal Bar)
  const barCanvas = document.getElementById('topCategoriesBarCanvas');
  if (barCanvas && barCategories.length > 0) {
    charts.bar = window.ChartModule.createTopCategoriesBarChart(barCanvas, barCategories, barData);
  } else if (barCanvas) {
    const ctx = barCanvas.getContext('2d');
    ctx.clearRect(0, 0, barCanvas.width, barCanvas.height);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '13px Poppins';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No expenses to analyze', barCanvas.width/2, barCanvas.height/2);
  }
}

// Exports Connectors
function exportCSV() {
  const state = window.StorageModule.loadState();
  const success = window.ExportModule.exportToCSV(state.transactions);
  if (success) {
    window.AppModule.showToast('CSV downloaded successfully', 'success');
  } else {
    window.AppModule.showToast('No transaction data to export.', 'warning');
  }
}

function exportJSON() {
  const state = window.StorageModule.loadState();
  const success = window.ExportModule.exportToJSON(state);
  if (success) {
    window.AppModule.showToast('Backup JSON exported successfully', 'success');
  }
}

function printReport() {
  window.ExportModule.printPage();
}

// Bind to window
window.toggleCustomDates = toggleCustomDates;
window.triggerReportsUpdate = triggerReportsUpdate;
window.exportCSV = exportCSV;
window.exportJSON = exportJSON;
window.printReport = printReport;

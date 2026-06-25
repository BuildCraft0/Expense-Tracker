// dashboard.js - UI controller for dashboard.html

let currentDoughnutChart = null;
let txFormReceiptBase64 = null;

document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
  
  // Check if opened with direct action like "?action=quickadd"
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('action') === 'quickadd') {
    openAddTransactionModal();
    // Clean URL parameter without reload
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});

function initDashboard() {
  window.StorageModule.reconcileWalletBalances();
  renderWidgets();
  renderWallets();
  renderTransactions();
  initCategoryDoughnut();
  populateFormDropdowns();
  
  // Date time defaults for new transaction
  document.getElementById('tx-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('tx-time').value = new Date().toTimeString().split(' ')[0].substring(0, 5);
}

// Populate forms category dropdown and wallet dropdown
function populateFormDropdowns() {
  const state = window.StorageModule.loadState();
  
  // Wallets
  const walletSelect = document.getElementById('tx-wallet');
  if (walletSelect) {
    walletSelect.innerHTML = state.wallets.map(w => 
      `<option value="${w.id}">${w.name} (${window.SettingsModule.formatCurrency(w.balance)})</option>`
    ).join('');
  }
  
  // Categories
  toggleCategorySelectOptions();
}

function toggleCategorySelectOptions() {
  const state = window.StorageModule.loadState();
  const catSelect = document.getElementById('tx-category');
  if (!catSelect) return;
  
  const typeRadio = document.querySelector('input[name="tx-type"]:checked');
  const isIncome = typeRadio && typeRadio.value === 'income';
  
  let options = [];
  if (isIncome) {
    // Income specific categories
    options = ['Salary', 'Freelancing', 'Investment', 'Gifts', 'Others'];
  } else {
    // Expense specific categories
    options = state.categories.filter(c => !['Salary', 'Freelancing'].includes(c));
  }
  
  catSelect.innerHTML = options.map(c => `<option value="${c}">${c}</option>`).join('');
}

// Calculate and render all figures
function renderWidgets() {
  const state = window.StorageModule.loadState();
  
  // 1. Total Balance: Sum of all wallet balances
  const totalBalance = state.wallets.reduce((sum, w) => sum + w.balance, 0);
  document.getElementById('val-total-balance').textContent = window.SettingsModule.formatCurrency(totalBalance);
  
  // 2. Incomes / Expenses
  const totalIncome = state.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
  const totalExpense = state.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
  const totalSavings = totalIncome - totalExpense;
  
  document.getElementById('val-total-income').textContent = window.SettingsModule.formatCurrency(totalIncome);
  document.getElementById('val-total-expense').textContent = window.SettingsModule.formatCurrency(totalExpense);
  document.getElementById('val-total-savings').textContent = window.SettingsModule.formatCurrency(totalSavings);
  
  // Update savings badge styling
  const savingsValEl = document.getElementById('val-total-savings');
  if (totalSavings < 0) {
    savingsValEl.style.color = 'var(--color-danger)';
  } else {
    savingsValEl.style.color = 'var(--color-info)';
  }
  
  // 3. Monthly Budget Progress
  const budgetProgress = window.BudgetModule.getMonthlyBudgetProgress();
  const remValue = document.getElementById('budget-remaining-value');
  const progressFill = document.getElementById('budget-progress-fill');
  const progressBadge = document.getElementById('budget-percentage-badge');
  
  if (remValue && progressFill && progressBadge) {
    remValue.textContent = window.SettingsModule.formatCurrency(budgetProgress.remaining);
    progressBadge.textContent = `${Math.round(budgetProgress.percentage)}%`;
    progressFill.style.width = `${budgetProgress.percentage}%`;
    
    // Warning classes
    progressFill.classList.remove('warning', 'danger');
    progressBadge.classList.remove('badge-warning', 'badge-danger', 'badge-info');
    
    if (budgetProgress.percentage >= 100) {
      progressFill.classList.add('danger');
      progressBadge.classList.add('badge-danger');
    } else if (budgetProgress.percentage >= 80) {
      progressFill.classList.add('warning');
      progressBadge.classList.add('badge-warning');
    } else {
      progressBadge.classList.add('badge-info');
    }
  }
  
  // 4. Period breakdown values (Today, Week, Month)
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Today spending
  const todaySpending = state.transactions
    .filter(t => t.type === 'expense' && t.date === todayStr)
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  // Week spending (Sunday-Saturday)
  const day = today.getDay();
  const diff = today.getDate() - day; 
  const startOfWeek = new Date(today.setDate(diff));
  startOfWeek.setHours(0,0,0,0);
  
  const weekSpending = state.transactions
    .filter(t => t.type === 'expense')
    .filter(t => new Date(t.date) >= startOfWeek)
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  // Month spending
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const monthSpending = state.transactions
    .filter(t => t.type === 'expense')
    .filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  document.getElementById('period-today').textContent = window.SettingsModule.formatCurrency(todaySpending);
  document.getElementById('period-week').textContent = window.SettingsModule.formatCurrency(weekSpending);
  document.getElementById('period-month').textContent = window.SettingsModule.formatCurrency(monthSpending);
}

// Render list of wallets
function renderWallets() {
  const state = window.StorageModule.loadState();
  const listEl = document.getElementById('dashboard-wallets-list');
  if (!listEl) return;
  
  if (state.wallets.length === 0) {
    listEl.innerHTML = '<p style="font-size:0.85rem; color:var(--text-muted);">No active wallets</p>';
    return;
  }
  
  listEl.innerHTML = state.wallets.map(w => {
    let icon = 'fa-wallet';
    if (w.type === 'Bank') icon = 'fa-building-columns';
    if (w.type === 'Credit Card') icon = 'fa-credit-card';
    if (w.type === 'UPI') icon = 'fa-mobile-screen-button';
    
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:rgba(255,255,255,0.02); border:1px solid var(--glass-border); border-radius:var(--input-radius);">
        <div style="display:flex; align-items:center; gap:10px;">
          <i class="fas ${icon}" style="color:var(--accent-primary);"></i>
          <span style="font-size:0.85rem; font-weight:500;">${w.name}</span>
        </div>
        <span style="font-size:0.85rem; font-weight:600; color: ${w.balance < 0 ? 'var(--color-danger)' : 'inherit'};">
          ${window.SettingsModule.formatCurrency(w.balance)}
        </span>
      </div>
    `;
  }).join('');
}

// Render dynamic list of transactions with live filters
function renderTransactions() {
  const state = window.StorageModule.loadState();
  const listEl = document.getElementById('transactions-list-container');
  if (!listEl) return;
  
  // Gather filter inputs
  const searchText = document.getElementById('filter-search').value;
  const filterType = document.getElementById('filter-type').value;
  const dateScope = document.getElementById('filter-date-scope').value;
  const sortOption = document.getElementById('filter-sort').value;
  
  let list = [...state.transactions];
  
  // Apply logic filters
  list = window.SearchModule.searchTransactions(list, searchText);
  list = window.FilterModule.filterTransactions(list, { type: filterType, dateScope: dateScope });
  list = window.FilterModule.sortTransactions(list, sortOption);
  
  if (list.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state animate-fade">
        <i class="fas fa-receipt"></i>
        <h3>No Transactions Found</h3>
        <p style="font-size:0.85rem;">Try adjusting your filters or quick-add a transaction.</p>
      </div>
    `;
    return;
  }
  
  listEl.innerHTML = list.map(t => {
    const amtColor = t.type === 'income' ? 'var(--color-success)' : 'var(--text-primary)';
    const amtPrefix = t.type === 'income' ? '+' : '-';
    
    // Wallet details
    const wallet = state.wallets.find(w => w.id === t.wallet);
    const walletName = wallet ? wallet.name : 'Unknown';
    
    // Category icons
    let catIcon = 'fa-tags';
    if (t.category === 'Food') catIcon = 'fa-utensils';
    if (t.category === 'Shopping') catIcon = 'fa-bag-shopping';
    if (t.category === 'Salary') catIcon = 'fa-sack-dollar';
    if (t.category === 'Freelancing') catIcon = 'fa-laptop-code';
    if (t.category === 'Transport') catIcon = 'fa-bus';
    if (t.category === 'Entertainment') catIcon = 'fa-film';
    if (t.category === 'Bills') catIcon = 'fa-file-invoice-dollar';
    if (t.category === 'EMI') catIcon = 'fa-hand-holding-dollar';
    if (t.category === 'Investment') catIcon = 'fa-chart-line';
    
    return `
      <div class="tx-item animate-fade">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:${t.type === 'income' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)'}; color:${t.type === 'income' ? 'var(--color-success)' : 'var(--text-secondary)'}; font-size:1.1rem;">
            <i class="fas ${catIcon}"></i>
          </div>
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-weight:600; font-size:0.95rem;">${t.description}</span>
              ${t.favorite ? '<i class="fas fa-star" style="color:var(--color-warning); font-size:0.8rem;"></i>' : ''}
              ${t.receipt ? '<i class="fas fa-paperclip" style="color:var(--text-muted); font-size:0.8rem;" title="Receipt Attached"></i>' : ''}
            </div>
            <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">
              <span>${window.SettingsModule.formatDate(t.date)} ${t.time || ''}</span> &bull; 
              <span style="color:var(--accent-primary); font-weight:500;">${t.category}</span> &bull; 
              <span>${walletName}</span>
            </div>
            ${t.notes ? `<div style="font-size:0.75rem; color:var(--text-muted); font-style:italic; margin-top:4px;">Note: ${t.notes}</div>` : ''}
          </div>
        </div>
        
        <div style="display:flex; align-items:center; gap:16px;">
          <span style="font-weight:700; color:${amtColor}; font-size:1.05rem;">
            ${amtPrefix}${window.SettingsModule.formatCurrency(t.amount)}
          </span>
          
          <div style="display:flex; gap:6px;">
            <button class="action-icon-btn" onclick="toggleTxFav('${t.id}')" title="Favorite">
              <i class="${t.favorite ? 'fas fa-star' : 'far fa-star'}" style="${t.favorite ? 'color:var(--color-warning);' : ''}"></i>
            </button>
            <button class="action-icon-btn" onclick="openEditTransactionModal('${t.id}')" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-icon-btn" onclick="triggerDuplicate('${t.id}')" title="Duplicate">
              <i class="fas fa-copy"></i>
            </button>
            <button class="action-icon-btn" onclick="triggerDelete('${t.id}')" title="Delete" style="color:var(--color-danger);">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Category wise Spending Doughnut Chart Initialization
function initCategoryDoughnut() {
  const state = window.StorageModule.loadState();
  const canvas = document.getElementById('categoryDoughnutCanvas');
  if (!canvas) return;
  
  // Calculate expenses category wise this month
  const categoryExpenses = {};
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  state.transactions
    .filter(t => t.type === 'expense')
    .filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    })
    .forEach(t => {
      categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + Number(t.amount);
    });
    
  const categories = Object.keys(categoryExpenses);
  const data = Object.values(categoryExpenses);
  
  if (currentDoughnutChart) {
    currentDoughnutChart.destroy();
  }
  
  if (categories.length === 0) {
    // Clear canvas
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw placeholder text
    ctx.fillStyle = window.SettingsModule.formatCurrencySymbol() === '$' ? '#9ca3af' : '#9ca3af';
    ctx.font = '13px Poppins';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No expenses this month', canvas.width / 2, canvas.height / 2);
    return;
  }
  
  currentDoughnutChart = window.ChartModule.createCategoryDoughnutChart(canvas, categories, data);
}

// Modals Setup
function openAddTransactionModal() {
  document.getElementById('tx-form').reset();
  document.getElementById('tx-id').value = '';
  document.getElementById('tx-modal-title').textContent = 'Add Transaction';
  txFormReceiptBase64 = null;
  document.getElementById('tx-receipt-preview').style.display = 'none';
  document.getElementById('receipt-preview-img').src = '';
  
  // Defaults date / time
  document.getElementById('tx-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('tx-time').value = new Date().toTimeString().split(' ')[0].substring(0, 5);
  
  populateFormDropdowns();
  
  document.getElementById('tx-modal').classList.add('active');
}

function openEditTransactionModal(id) {
  const state = window.StorageModule.loadState();
  const tx = state.transactions.find(t => t.id === id);
  if (!tx) return;
  
  populateFormDropdowns();
  
  document.getElementById('tx-id').value = tx.id;
  document.getElementById('tx-modal-title').textContent = 'Edit Transaction';
  
  // Set type radio
  document.querySelector(`input[name="tx-type"][value="${tx.type}"]`).checked = true;
  toggleCategorySelectOptions();
  
  document.getElementById('tx-amount').value = tx.amount;
  document.getElementById('tx-description').value = tx.description;
  document.getElementById('tx-category').value = tx.category;
  document.getElementById('tx-custom-category').value = '';
  document.getElementById('tx-date').value = tx.date;
  document.getElementById('tx-time').value = tx.time || '12:00';
  document.getElementById('tx-wallet').value = tx.wallet;
  document.getElementById('tx-tags').value = (tx.tags || []).join(', ');
  document.getElementById('tx-notes').value = tx.notes || '';
  document.getElementById('tx-favorite').checked = !!tx.favorite;
  
  txFormReceiptBase64 = tx.receipt;
  if (tx.receipt) {
    document.getElementById('receipt-preview-img').src = tx.receipt;
    document.getElementById('tx-receipt-preview').style.display = 'block';
  } else {
    document.getElementById('tx-receipt-preview').style.display = 'none';
    document.getElementById('receipt-preview-img').src = '';
  }
  
  document.getElementById('tx-modal').classList.add('active');
}

function closeTxModal() {
  document.getElementById('tx-modal').classList.remove('active');
}

// Receipt preview file loading
function previewReceiptFile(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      txFormReceiptBase64 = e.target.result;
      document.getElementById('receipt-preview-img').src = txFormReceiptBase64;
      document.getElementById('tx-receipt-preview').style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}

function removeReceiptImage() {
  txFormReceiptBase64 = null;
  document.getElementById('tx-receipt').value = '';
  document.getElementById('tx-receipt-preview').style.display = 'none';
  document.getElementById('receipt-preview-img').src = '';
}

// Submit Transaction form
function saveTxForm(event) {
  event.preventDefault();
  
  const id = document.getElementById('tx-id').value;
  const type = document.querySelector('input[name="tx-type"]:checked').value;
  const amount = Number(document.getElementById('tx-amount').value);
  const description = document.getElementById('tx-description').value;
  const wallet = document.getElementById('tx-wallet').value;
  const customCat = document.getElementById('tx-custom-category').value.trim();
  const date = document.getElementById('tx-date').value;
  const time = document.getElementById('tx-time').value;
  const tagsStr = document.getElementById('tx-tags').value;
  const notes = document.getElementById('tx-notes').value;
  const favorite = document.getElementById('tx-favorite').checked;
  
  let category = document.getElementById('tx-category').value;
  
  // Custom category creation if filled
  if (customCat) {
    const state = window.StorageModule.loadState();
    if (!state.categories.includes(customCat)) {
      state.categories.push(customCat);
      window.StorageModule.saveState();
    }
    category = customCat;
  }
  
  // 1. Budget Warn Checks (if it's expense)
  if (type === 'expense') {
    const alerts = window.BudgetModule.checkBudgetAlerts(amount, category, id || null);
    if (alerts.category) {
      window.AppModule.showToast(alerts.category.message, alerts.category.level);
    }
    if (alerts.monthly) {
      window.AppModule.showToast(alerts.monthly.message, alerts.monthly.level);
    }
  }
  
  const txData = {
    amount,
    description,
    type,
    category,
    date,
    time,
    wallet,
    notes,
    tags: tagsStr,
    favorite,
    receipt: txFormReceiptBase64
  };
  
  if (id) {
    // Edit
    window.TransactionModule.updateTransaction(id, txData);
    window.AppModule.showToast('Transaction updated successfully', 'success');
  } else {
    // Add new
    window.TransactionModule.addTransaction(txData);
    window.AppModule.showToast('Transaction added successfully', 'success');
  }
  
  closeTxModal();
  initDashboard(); // Re-render stats & charts
}

// Transaction operations
function toggleTxFav(id) {
  const isFav = window.TransactionModule.toggleFavorite(id);
  if (isFav !== null) {
    renderTransactions();
    window.AppModule.showToast(isFav ? 'Added to favorites' : 'Removed from favorites', 'success');
  }
}

function triggerDuplicate(id) {
  const clone = window.TransactionModule.duplicateTransaction(id);
  if (clone) {
    initDashboard();
    window.AppModule.showToast('Transaction duplicated', 'success');
  }
}

function triggerDelete(id) {
  window.AppModule.showConfirm('Delete Transaction', 'Are you sure you want to delete this transaction? This action will impact your wallet balance.', () => {
    const success = window.TransactionModule.deleteTransaction(id);
    if (success) {
      initDashboard();
      showUndoBanner('Transaction deleted successfully.');
    }
  });
}

// Custom Undo Delete banner triggers
let undoTimeout = null;
function showUndoBanner(message) {
  const banner = document.getElementById('undo-alert-banner');
  const textEl = document.getElementById('undo-alert-text');
  if (!banner || !textEl) return;
  
  textEl.textContent = message;
  banner.style.display = 'flex';
  
  if (undoTimeout) clearTimeout(undoTimeout);
  
  // Hide after 8s
  undoTimeout = setTimeout(() => {
    banner.style.display = 'none';
  }, 8000);
}

function triggerUndo() {
  const restoredTx = window.TransactionModule.undoDelete();
  if (restoredTx) {
    initDashboard();
    document.getElementById('undo-alert-banner').style.display = 'none';
    window.AppModule.showToast('Deletion undone! Transaction restored.', 'success');
  }
}

function applyFilters() {
  renderTransactions();
}

// Bind to window to allow HTML button onclick access
window.openAddTransactionModal = openAddTransactionModal;
window.openEditTransactionModal = openEditTransactionModal;
window.closeTxModal = closeTxModal;
window.previewReceiptFile = previewReceiptFile;
window.removeReceiptImage = removeReceiptImage;
window.saveTxForm = saveTxForm;
window.toggleTxFav = toggleTxFav;
window.triggerDuplicate = triggerDuplicate;
window.triggerDelete = triggerDelete;
window.triggerUndo = triggerUndo;
window.applyFilters = applyFilters;
window.toggleCategorySelectOptions = toggleCategorySelectOptions;

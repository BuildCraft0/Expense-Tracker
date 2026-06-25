// budget.js - Budget Management Logic

function setMonthlyBudget(amount) {
  const state = window.StorageModule.loadState();
  state.budgets.monthly = Number(amount) || 0;
  window.StorageModule.saveState();
}

function setCategoryBudget(category, amount) {
  const state = window.StorageModule.loadState();
  if (!state.budgets.categories) {
    state.budgets.categories = {};
  }
  state.budgets.categories[category] = Number(amount) || 0;
  window.StorageModule.saveState();
}

function getMonthlyBudgetProgress() {
  const state = window.StorageModule.loadState();
  const limit = state.budgets.monthly || 0;
  
  // Calculate expenses this month
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed
  
  const monthlyExpenses = state.transactions
    .filter(t => t.type === 'expense')
    .filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    })
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
  return {
    limit,
    spent: monthlyExpenses,
    remaining: Math.max(0, limit - monthlyExpenses),
    percentage: limit > 0 ? Math.min(100, (monthlyExpenses / limit) * 100) : 0
  };
}

function getCategoryBudgetProgress(category) {
  const state = window.StorageModule.loadState();
  const limit = (state.budgets.categories && state.budgets.categories[category]) || 0;
  
  // Calculate category expenses this month
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  const catExpenses = state.transactions
    .filter(t => t.type === 'expense' && t.category === category)
    .filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    })
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
  return {
    limit,
    spent: catExpenses,
    remaining: Math.max(0, limit - catExpenses),
    percentage: limit > 0 ? Math.min(100, (catExpenses / limit) * 100) : 0
  };
}

// Check if adding/editing a transaction triggers budget alerts
function checkBudgetAlerts(txAmount, txCategory, existingTxId = null) {
  const state = window.StorageModule.loadState();
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  // 1. Calculate Monthly Expense including this new amount (and discounting old if edit)
  const currentMonthlyExpenses = state.transactions
    .filter(t => t.type === 'expense' && t.id !== existingTxId)
    .filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    })
    .reduce((sum, t) => sum + Number(t.amount || 0), 0) + Number(txAmount);
    
  const monthlyLimit = state.budgets.monthly || 0;
  let monthlyWarning = null;
  
  if (monthlyLimit > 0) {
    const ratio = currentMonthlyExpenses / monthlyLimit;
    if (ratio >= 1.0) {
      monthlyWarning = {
        level: 'danger',
        message: `Monthly budget exceeded! You spent ${window.SettingsModule.formatCurrency(currentMonthlyExpenses)} of ${window.SettingsModule.formatCurrency(monthlyLimit)}.`
      };
    } else if (ratio >= 0.8) {
      monthlyWarning = {
        level: 'warning',
        message: `Warning: You have used ${Math.round(ratio * 100)}% of your monthly budget.`
      };
    }
  }
  
  // 2. Category alert
  const currentCatExpenses = state.transactions
    .filter(t => t.type === 'expense' && t.category === txCategory && t.id !== existingTxId)
    .filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    })
    .reduce((sum, t) => sum + Number(t.amount || 0), 0) + Number(txAmount);
    
  const catLimit = (state.budgets.categories && state.budgets.categories[txCategory]) || 0;
  let categoryWarning = null;
  
  if (catLimit > 0) {
    const ratio = currentCatExpenses / catLimit;
    if (ratio >= 1.0) {
      categoryWarning = {
        level: 'danger',
        message: `Budget exceeded for category "${txCategory}"! Spent ${window.SettingsModule.formatCurrency(currentCatExpenses)} of ${window.SettingsModule.formatCurrency(catLimit)}.`
      };
    } else if (ratio >= 0.8) {
      categoryWarning = {
        level: 'warning',
        message: `Warning: Category "${txCategory}" budget is at ${Math.round(ratio * 100)}%.`
      };
    }
  }
  
  return {
    monthly: monthlyWarning,
    category: categoryWarning
  };
}

window.BudgetModule = {
  setMonthlyBudget,
  setCategoryBudget,
  getMonthlyBudgetProgress,
  getCategoryBudgetProgress,
  checkBudgetAlerts
};

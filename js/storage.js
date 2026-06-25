// storage.js - LocalStorage State Management Wrapper

const DEFAULT_CATEGORIES = [
  'Food', 'Shopping', 'Salary', 'Freelancing', 'Investment', 'Transport',
  'Entertainment', 'Health', 'Education', 'Travel', 'Bills', 'EMI',
  'Insurance', 'Rent', 'Recharge', 'Gifts', 'Others'
];

const DEFAULT_WALLETS = [
  { id: 'cash', name: 'Cash', type: 'Cash', balance: 2000 },
  { id: 'bank', name: 'Bank Account', type: 'Bank', balance: 25000 },
  { id: 'cc', name: 'Credit Card', type: 'Credit Card', balance: -1500 },
  { id: 'upi', name: 'UPI Wallet', type: 'UPI', balance: 500 }
];

const DEFAULT_SETTINGS = {
  theme: 'dark',
  currency: 'USD', // USD, INR, EUR, GBP
  language: 'en',   // en, hi
  dateFormat: 'YYYY-MM-DD',
  notifications: true,
  pinLockEnabled: false,
  pinCode: '1234'
};

const STATE_KEY = 'EXPENSE_TRACKER_PRO_STATE';

const INITIAL_STATE = {
  transactions: [
    {
      id: 'tx_1',
      amount: 5000,
      description: 'Monthly Salary',
      type: 'income',
      category: 'Salary',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      wallet: 'bank',
      notes: 'Initial salary transaction',
      tags: ['Job', 'Regular'],
      favorite: true,
      status: 'completed',
      receipt: null
    },
    {
      id: 'tx_2',
      amount: 150,
      description: 'Grocery Shopping',
      type: 'expense',
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      time: '14:30',
      wallet: 'cash',
      notes: 'Weekly fresh vegetables',
      tags: ['Groceries'],
      favorite: false,
      status: 'completed',
      receipt: null
    }
  ],
  categories: [...DEFAULT_CATEGORIES],
  wallets: [...DEFAULT_WALLETS],
  budgets: {
    monthly: 10000,
    categories: {
      'Food': 2000,
      'Shopping': 1500,
      'Bills': 3000
    }
  },
  savingsGoal: {
    target: 50000,
    saved: 0
  },
  settings: { ...DEFAULT_SETTINGS },
  reminders: [
    { id: 'rem_1', title: 'Electricity Bill', amount: 80, dueDate: new Date(Date.now() + 5*24*60*60*1000).toISOString().split('T')[0], category: 'Bills', status: 'pending' }
  ],
  loans: [
    { id: 'loan_1', lender: 'HDFC Bank', amount: 10000, rate: 8.5, duration: 24, paidAmount: 1200, startDate: '2026-01-10', status: 'active' }
  ],
  emis: [
    { id: 'emi_1', title: 'Car Loan EMI', amount: 350, dueDate: '2026-07-05', totalInstallments: 36, paidInstallments: 6 }
  ],
  investments: [
    { id: 'inv_1', title: 'Mutual Funds', amount: 5000, currentValue: 5400, type: 'Equity', date: '2026-02-15' }
  ],
  recurring: []
};

// Global state cache
let appState = null;

function loadState() {
  if (appState) return appState;
  
  const savedState = localStorage.getItem(STATE_KEY);
  if (savedState) {
    try {
      appState = JSON.parse(savedState);
      
      // Upgrade state with default schemas if any are missing
      if (!appState.categories) appState.categories = [...DEFAULT_CATEGORIES];
      if (!appState.wallets) appState.wallets = [...DEFAULT_WALLETS];
      if (!appState.budgets) appState.budgets = { monthly: 10000, categories: {} };
      if (!appState.savingsGoal) appState.savingsGoal = { target: 50000, saved: 0 };
      if (!appState.settings) appState.settings = { ...DEFAULT_SETTINGS };
      if (!appState.reminders) appState.reminders = [];
      if (!appState.loans) appState.loans = [];
      if (!appState.emis) appState.emis = [];
      if (!appState.investments) appState.investments = [];
      if (!appState.recurring) appState.recurring = [];
      
    } catch (e) {
      console.error('Failed to parse app state, falling back to defaults', e);
      appState = JSON.parse(JSON.stringify(INITIAL_STATE));
    }
  } else {
    appState = JSON.parse(JSON.stringify(INITIAL_STATE));
    saveState();
  }
  return appState;
}

function saveState() {
  if (appState) {
    localStorage.setItem(STATE_KEY, JSON.stringify(appState));
  }
}

function resetState() {
  appState = JSON.parse(JSON.stringify(INITIAL_STATE));
  saveState();
  return appState;
}

// Auto update wallet balances based on transactions list (to ensure consistency)
function reconcileWalletBalances() {
  const state = loadState();
  
  // Create mapping of wallet ID to a starting balance
  const walletBalances = {};
  
  // We can assign base balances depending on default settings, or treat initial wallet values as base values.
  // To avoid circular calculations, lets keep base values as configured in profile/wallet management,
  // and compute current balance dynamically. Let's do:
  // Current Balance = Wallet Base Balance + Sum of incomes - Sum of expenses
  // Wait! To make wallet balances flexible, let's keep a "baseBalance" property in each wallet,
  // and current "balance" = baseBalance + sum of transactions for this wallet.
  
  state.wallets.forEach(w => {
    if (w.baseBalance === undefined) {
      w.baseBalance = w.balance; // first time migration
    }
    w.balance = w.baseBalance;
  });
  
  state.transactions.forEach(t => {
    const amount = Number(t.amount) || 0;
    const wallet = state.wallets.find(w => w.id === t.wallet);
    if (wallet) {
      if (t.type === 'income') {
        wallet.balance += amount;
      } else {
        wallet.balance -= amount;
      }
    }
  });
  
  saveState();
}

window.StorageModule = {
  loadState,
  saveState,
  resetState,
  reconcileWalletBalances,
  DEFAULT_CATEGORIES,
  DEFAULT_WALLETS,
  DEFAULT_SETTINGS
};

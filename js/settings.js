// settings.js - Localization, Currency & Format Controller

const TRANSLATIONS = {
  en: {
    // Nav & Sidebar
    dashboard: 'Dashboard',
    reports: 'Reports & Analytics',
    settings: 'Settings',
    profile: 'Profile & Tools',
    logout: 'Lock App',
    
    // Dashboard Stats
    total_balance: 'Total Balance',
    total_income: 'Total Income',
    total_expenses: 'Total Expenses',
    total_savings: 'Total Savings',
    monthly_budget_progress: 'Monthly Budget Progress',
    budget_remaining: 'Budget Remaining',
    spending_today: "Today's Spending",
    spending_week: 'This Week Spending',
    spending_month: 'This Month Spending',
    recent_transactions: 'Recent Transactions',
    top_categories: 'Top Spending Categories',
    quick_add: 'Quick Add Transaction',
    add_tx: 'Add Transaction',
    edit_tx: 'Edit Transaction',
    
    // Wallets & Categories
    wallets_title: 'Your Wallets',
    add_wallet: 'Add Wallet',
    custom_categories: 'Custom Categories',
    
    // Filters & Searching
    search_placeholder: 'Search transactions...',
    filter_all: 'All Transactions',
    filter_income: 'Income Only',
    filter_expense: 'Expense Only',
    sort_date_desc: 'Newest First',
    sort_date_asc: 'Oldest First',
    sort_amount_desc: 'Highest Amount',
    sort_amount_asc: 'Lowest Amount',
    
    // Settings Labels
    theme_setting: 'Application Theme',
    language_setting: 'Select Language',
    currency_setting: 'Select Currency',
    date_format_setting: 'Date Format',
    pin_setting: 'PIN Lock Security',
    pin_enabled: 'Enable App Lock PIN',
    backup_data: 'Backup Data',
    restore_data: 'Restore Backup',
    reset_data: 'Reset Application Data',
    
    // Extras & Tools
    calculator_tax: 'Income Tax Calculator',
    loan_tracker: 'Loan & EMI Tracker',
    emi_calculator: 'EMI Calculator',
    receipt_upload: 'Receipt Upload',
    about_app: 'About Expense Tracker'
  },
  hi: {
    // Nav & Sidebar
    dashboard: 'डैशबोर्ड',
    reports: 'रिपोर्ट और विश्लेषण',
    settings: 'सेटिंग्स',
    profile: 'प्रोफ़ाइल और उपकरण',
    logout: 'ऐप लॉक करें',
    
    // Dashboard Stats
    total_balance: 'कुल शेष राशि',
    total_income: 'कुल आय',
    total_expenses: 'कुल खर्च',
    total_savings: 'कुल बचत',
    monthly_budget_progress: 'मासिक बजट प्रगति',
    budget_remaining: 'शेष बजट',
    spending_today: 'आज का खर्च',
    spending_week: 'इस सप्ताह का खर्च',
    spending_month: 'इस महीने का खर्च',
    recent_transactions: 'हाल के लेनदेन',
    top_categories: 'शीर्ष खर्च श्रेणियां',
    quick_add: 'त्वरित लेनदेन जोड़ें',
    add_tx: 'लेनदेन जोड़ें',
    edit_tx: 'लेनदेन संपादित करें',
    
    // Wallets & Categories
    wallets_title: 'आपके वॉलेट',
    add_wallet: 'वॉलेट जोड़ें',
    custom_categories: 'कस्टम श्रेणियां',
    
    // Filters & Searching
    search_placeholder: 'लेनदेन खोजें...',
    filter_all: 'सभी लेनदेन',
    filter_income: 'केवल आय',
    filter_expense: 'केवल खर्च',
    sort_date_desc: 'नवीनतम पहले',
    sort_date_asc: 'सबसे पुराना पहले',
    sort_amount_desc: 'उच्चतम राशि',
    sort_amount_asc: 'न्यूनतम राशि',
    
    // Settings Labels
    theme_setting: 'एप्लिकेशन थीम',
    language_setting: 'भाषा चुनें',
    currency_setting: 'मुद्रा चुनें',
    date_format_setting: 'दिनांक प्रारूप',
    pin_setting: 'पिन लॉक सुरक्षा',
    pin_enabled: 'ऐप लॉक पिन सक्षम करें',
    backup_data: 'डेटा बैकअप लें',
    restore_data: 'बैकअप रीस्टोर करें',
    reset_data: 'एप्लिकेशन डेटा रीसेट करें',
    
    // Extras & Tools
    calculator_tax: 'आयकर कैलकुलेटर',
    loan_tracker: 'ऋण और ईएमआई ट्रैकर',
    emi_calculator: 'ईएमआई कैलकुलेटर',
    receipt_upload: 'रसीद अपलोड',
    about_app: 'एक्सपेंस ट्रैकर प्रो के बारे में'
  }
};

const CURRENCIES = {
  USD: { symbol: '$', format: (v) => `$${v.toFixed(2)}` },
  INR: { symbol: '₹', format: (v) => `₹${v.toLocaleString('en-IN')}` },
  EUR: { symbol: '€', format: (v) => `€${v.toFixed(2)}` },
  GBP: { symbol: '£', format: (v) => `£${v.toFixed(2)}` }
};

// Translate UI
function t(key) {
  const state = window.StorageModule.loadState();
  const lang = state.settings.language || 'en';
  return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || key;
}

function applyLocalization() {
  document.querySelectorAll('[data-translate]').forEach(elem => {
    const key = elem.getAttribute('data-translate');
    if (elem.tagName === 'INPUT' && elem.placeholder) {
      elem.placeholder = t(key);
    } else {
      elem.textContent = t(key);
    }
  });
}

function formatCurrency(amount) {
  const state = window.StorageModule.loadState();
  const currCode = state.settings.currency || 'USD';
  const currency = CURRENCIES[currCode] || CURRENCIES.USD;
  return currency.format(amount);
}

function formatCurrencySymbol() {
  const state = window.StorageModule.loadState();
  const currCode = state.settings.currency || 'USD';
  return CURRENCIES[currCode]?.symbol || '$';
}

function formatDate(dateStr) {
  const state = window.StorageModule.loadState();
  const format = state.settings.dateFormat || 'YYYY-MM-DD';
  if (!dateStr) return '';
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj)) return dateStr;
  
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  
  if (format === 'DD-MM-YYYY') return `${dd}-${mm}-${yyyy}`;
  if (format === 'MM-DD-YYYY') return `${mm}-${dd}-${yyyy}`;
  return `${yyyy}-${mm}-${dd}`;
}

window.SettingsModule = {
  t,
  applyLocalization,
  formatCurrency,
  formatCurrencySymbol,
  formatDate,
  CURRENCIES,
  TRANSLATIONS
};

// import.js - Backup Restore Logic

function importBackupFile(file, successCallback, errorCallback) {
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsedData = JSON.parse(e.target.result);
      
      // Basic JSON validation: check if transactions and settings exist
      if (!parsedData.transactions || !Array.isArray(parsedData.transactions)) {
        throw new Error('Missing transactions array');
      }
      if (!parsedData.settings) {
        throw new Error('Missing settings configurations');
      }
      
      // Merge with default formats
      const state = window.StorageModule.loadState();
      
      state.transactions = parsedData.transactions;
      state.settings = { ...state.settings, ...parsedData.settings };
      
      if (parsedData.categories && Array.isArray(parsedData.categories)) {
        state.categories = parsedData.categories;
      }
      if (parsedData.wallets && Array.isArray(parsedData.wallets)) {
        state.wallets = parsedData.wallets;
      }
      if (parsedData.budgets) {
        state.budgets = parsedData.budgets;
      }
      if (parsedData.savingsGoal) {
        state.savingsGoal = parsedData.savingsGoal;
      }
      if (parsedData.reminders) {
        state.reminders = parsedData.reminders;
      }
      if (parsedData.loans) {
        state.loans = parsedData.loans;
      }
      if (parsedData.emis) {
        state.emis = parsedData.emis;
      }
      if (parsedData.investments) {
        state.investments = parsedData.investments;
      }
      if (parsedData.recurring) {
        state.recurring = parsedData.recurring;
      }
      
      window.StorageModule.saveState();
      window.StorageModule.reconcileWalletBalances();
      
      if (typeof successCallback === 'function') {
        successCallback();
      }
    } catch (err) {
      console.error('Import parsing error:', err);
      if (typeof errorCallback === 'function') {
        errorCallback(err.message || 'Invalid backup file structure.');
      }
    }
  };
  
  reader.readAsText(file);
}

window.ImportModule = {
  importBackupFile
};

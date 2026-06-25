// wallet.js - Wallet Management Logic

function addWallet(name, type, baseBalance = 0) {
  const state = window.StorageModule.loadState();
  const newWallet = {
    id: 'wallet_' + Date.now(),
    name,
    type,
    baseBalance: Number(baseBalance) || 0,
    balance: Number(baseBalance) || 0
  };
  state.wallets.push(newWallet);
  window.StorageModule.saveState();
  window.StorageModule.reconcileWalletBalances();
  return newWallet;
}

function updateWallet(id, name, type, baseBalance) {
  const state = window.StorageModule.loadState();
  const wallet = state.wallets.find(w => w.id === id);
  if (wallet) {
    wallet.name = name;
    wallet.type = type;
    wallet.baseBalance = Number(baseBalance) || 0;
    window.StorageModule.saveState();
    window.StorageModule.reconcileWalletBalances();
    return true;
  }
  return false;
}

function deleteWallet(id) {
  const state = window.StorageModule.loadState();
  // Don't delete if it's the last wallet
  if (state.wallets.length <= 1) {
    return false;
  }
  state.wallets = state.wallets.filter(w => w.id !== id);
  // Re-link transactions belonging to deleted wallet to the first remaining wallet
  const fallbackId = state.wallets[0].id;
  state.transactions.forEach(t => {
    if (t.wallet === id) {
      t.wallet = fallbackId;
    }
  });
  window.StorageModule.saveState();
  window.StorageModule.reconcileWalletBalances();
  return true;
}

function transferFunds(fromId, toId, amount, notes = '') {
  if (fromId === toId) return false;
  const val = Number(amount);
  if (isNaN(val) || val <= 0) return false;
  
  const state = window.StorageModule.loadState();
  const fromWallet = state.wallets.find(w => w.id === fromId);
  const toWallet = state.wallets.find(w => w.id === toId);
  
  if (!fromWallet || !toWallet) return false;
  
  const dateStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false }).substring(0, 5);
  
  // Register expense transaction in source wallet
  const txOut = {
    id: 'tx_' + Date.now() + '_out',
    amount: val,
    description: `Transfer to ${toWallet.name}`,
    type: 'expense',
    category: 'Others',
    date: dateStr,
    time: timeStr,
    wallet: fromId,
    notes: notes || 'Wallet Transfer',
    tags: ['Transfer'],
    favorite: false,
    status: 'completed',
    receipt: null
  };
  
  // Register income transaction in target wallet
  const txIn = {
    id: 'tx_' + (Date.now() + 1) + '_in',
    amount: val,
    description: `Transfer from ${fromWallet.name}`,
    type: 'income',
    category: 'Others',
    date: dateStr,
    time: timeStr,
    wallet: toId,
    notes: notes || 'Wallet Transfer',
    tags: ['Transfer'],
    favorite: false,
    status: 'completed',
    receipt: null
  };
  
  state.transactions.push(txOut);
  state.transactions.push(txIn);
  
  window.StorageModule.saveState();
  window.StorageModule.reconcileWalletBalances();
  return true;
}

window.WalletModule = {
  addWallet,
  updateWallet,
  deleteWallet,
  transferFunds
};

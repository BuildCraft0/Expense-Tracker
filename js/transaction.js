// transaction.js - Transaction Action Handlers

// Queue for deleted transactions to support Undo Delete
let deleteUndoQueue = [];

function addTransaction(txData) {
  const state = window.StorageModule.loadState();
  const newTx = {
    id: txData.id || 'tx_' + Date.now(),
    amount: Number(txData.amount) || 0,
    description: txData.description || 'Untitled Transaction',
    type: txData.type || 'expense', // income or expense
    category: txData.category || 'Others',
    date: txData.date || new Date().toISOString().split('T')[0],
    time: txData.time || new Date().toLocaleTimeString('en-US', { hour12: false }).substring(0, 5),
    wallet: txData.wallet || 'cash',
    notes: txData.notes || '',
    tags: Array.isArray(txData.tags) ? txData.tags : (txData.tags ? txData.tags.split(',').map(s=>s.trim()) : []),
    favorite: !!txData.favorite,
    status: txData.status || 'completed', // completed or pending
    receipt: txData.receipt || null // base64 string
  };
  
  state.transactions.push(newTx);
  window.StorageModule.saveState();
  window.StorageModule.reconcileWalletBalances();
  
  return newTx;
}

function updateTransaction(id, txData) {
  const state = window.StorageModule.loadState();
  const txIndex = state.transactions.findIndex(t => t.id === id);
  if (txIndex > -1) {
    state.transactions[txIndex] = {
      ...state.transactions[txIndex],
      amount: Number(txData.amount) || 0,
      description: txData.description || state.transactions[txIndex].description,
      type: txData.type || state.transactions[txIndex].type,
      category: txData.category || state.transactions[txIndex].category,
      date: txData.date || state.transactions[txIndex].date,
      time: txData.time || state.transactions[txIndex].time,
      wallet: txData.wallet || state.transactions[txIndex].wallet,
      notes: txData.notes !== undefined ? txData.notes : state.transactions[txIndex].notes,
      tags: Array.isArray(txData.tags) ? txData.tags : (txData.tags ? txData.tags.split(',').map(s=>s.trim()) : []),
      favorite: txData.favorite !== undefined ? !!txData.favorite : state.transactions[txIndex].favorite,
      status: txData.status || state.transactions[txIndex].status,
      receipt: txData.receipt !== undefined ? txData.receipt : state.transactions[txIndex].receipt
    };
    
    window.StorageModule.saveState();
    window.StorageModule.reconcileWalletBalances();
    return state.transactions[txIndex];
  }
  return null;
}

function deleteTransaction(id) {
  const state = window.StorageModule.loadState();
  const index = state.transactions.findIndex(t => t.id === id);
  if (index > -1) {
    const [deletedTx] = state.transactions.splice(index, 1);
    
    // Save to undo queue
    deleteUndoQueue.push({ index, transaction: deletedTx });
    if (deleteUndoQueue.length > 5) {
      deleteUndoQueue.shift(); // Limit history to last 5 deletions
    }
    
    window.StorageModule.saveState();
    window.StorageModule.reconcileWalletBalances();
    return true;
  }
  return false;
}

function undoDelete() {
  if (deleteUndoQueue.length === 0) return null;
  
  const state = window.StorageModule.loadState();
  const { index, transaction } = deleteUndoQueue.pop();
  
  // Re-insert
  state.transactions.splice(index, 0, transaction);
  
  window.StorageModule.saveState();
  window.StorageModule.reconcileWalletBalances();
  return transaction;
}

function duplicateTransaction(id) {
  const state = window.StorageModule.loadState();
  const tx = state.transactions.find(t => t.id === id);
  if (tx) {
    const clone = {
      ...tx,
      id: 'tx_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false }).substring(0, 5),
      favorite: false
    };
    state.transactions.push(clone);
    window.StorageModule.saveState();
    window.StorageModule.reconcileWalletBalances();
    return clone;
  }
  return null;
}

function toggleFavorite(id) {
  const state = window.StorageModule.loadState();
  const tx = state.transactions.find(t => t.id === id);
  if (tx) {
    tx.favorite = !tx.favorite;
    window.StorageModule.saveState();
    return tx.favorite;
  }
  return null;
}

window.TransactionModule = {
  addTransaction,
  updateTransaction,
  deleteTransaction,
  undoDelete,
  duplicateTransaction,
  toggleFavorite,
  hasUndoItem: () => deleteUndoQueue.length > 0
};

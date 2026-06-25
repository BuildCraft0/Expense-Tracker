// search.js - Live Search Logic

function searchTransactions(transactions, query) {
  if (!query) return transactions;
  const term = query.toLowerCase().trim();
  
  return transactions.filter(t => {
    const desc = (t.description || '').toLowerCase();
    const cat = (t.category || '').toLowerCase();
    const notes = (t.notes || '').toLowerCase();
    const tags = (t.tags || []).join(' ').toLowerCase();
    
    return desc.includes(term) || 
           cat.includes(term) || 
           notes.includes(term) || 
           tags.includes(term);
  });
}

window.SearchModule = {
  searchTransactions
};

// filter.js - Transactions Filter and Sort Engine

function filterTransactions(transactions, filters = {}) {
  let list = [...transactions];
  
  // 1. Filter by Type (income, expense, favorite)
  if (filters.type && filters.type !== 'all') {
    if (filters.type === 'favorite') {
      list = list.filter(t => t.favorite);
    } else {
      list = list.filter(t => t.type === filters.type);
    }
  }
  
  // 2. Filter by Category
  if (filters.category && filters.category !== 'all') {
    list = list.filter(t => t.category === filters.category);
  }
  
  // 3. Filter by Date range
  if (filters.dateScope && filters.dateScope !== 'all') {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    if (filters.dateScope === 'today') {
      list = list.filter(t => t.date === todayStr);
    } 
    else if (filters.dateScope === 'week') {
      // Current week: calculate start of week (Sunday)
      const day = now.getDay();
      const diff = now.getDate() - day; 
      const startOfWeek = new Date(now.setDate(diff));
      startOfWeek.setHours(0,0,0,0);
      
      list = list.filter(t => {
        const txDate = new Date(t.date);
        return txDate >= startOfWeek;
      });
    } 
    else if (filters.dateScope === 'month') {
      const year = now.getFullYear();
      const month = now.getMonth();
      list = list.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === year && d.getMonth() === month;
      });
    } 
    else if (filters.dateScope === 'year') {
      const year = now.getFullYear();
      list = list.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === year;
      });
    } 
    else if (filters.dateScope === 'custom' && filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      start.setHours(0,0,0,0);
      const end = new Date(filters.endDate);
      end.setHours(23,59,59,999);
      
      list = list.filter(t => {
        const d = new Date(t.date);
        return d >= start && d <= end;
      });
    }
  }
  
  // 4. Filter by Wallet
  if (filters.wallet && filters.wallet !== 'all') {
    list = list.filter(t => t.wallet === filters.wallet);
  }
  
  // 5. Filter by Status
  if (filters.status && filters.status !== 'all') {
    list = list.filter(t => t.status === filters.status);
  }
  
  return list;
}

function sortTransactions(transactions, sortBy = 'date_desc') {
  const sorted = [...transactions];
  
  sorted.sort((a, b) => {
    if (sortBy === 'date_desc') {
      // Date desc, then time desc
      const dateDiff = new Date(b.date) - new Date(a.date);
      if (dateDiff !== 0) return dateDiff;
      return (b.time || '').localeCompare(a.time || '');
    } 
    else if (sortBy === 'date_asc') {
      const dateDiff = new Date(a.date) - new Date(b.date);
      if (dateDiff !== 0) return dateDiff;
      return (a.time || '').localeCompare(b.time || '');
    } 
    else if (sortBy === 'amount_desc') {
      return b.amount - a.amount;
    } 
    else if (sortBy === 'amount_asc') {
      return a.amount - b.amount;
    } 
    else if (sortBy === 'alpha_asc') {
      return (a.description || '').localeCompare(b.description || '');
    } 
    else if (sortBy === 'alpha_desc') {
      return (b.description || '').localeCompare(a.description || '');
    }
    return 0;
  });
  
  return sorted;
}

window.FilterModule = {
  filterTransactions,
  sortTransactions
};

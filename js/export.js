// export.js - Data Exporter (CSV, JSON, Print Report)

function exportToCSV(transactions) {
  if (!transactions || transactions.length === 0) return false;
  
  // Define CSV headers
  const headers = ['ID', 'Date', 'Time', 'Type', 'Category', 'Amount', 'Wallet', 'Description', 'Notes', 'Tags', 'Favorite', 'Status'];
  
  const csvRows = [headers.join(',')];
  
  transactions.forEach(t => {
    const row = [
      t.id,
      t.date,
      t.time || '',
      t.type,
      t.category,
      t.amount,
      t.wallet || '',
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      `"${(t.tags || []).join(';')}"`,
      t.favorite ? 'Yes' : 'No',
      t.status || 'completed'
    ];
    csvRows.push(row.join(','));
  });
  
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Expense_Tracker_Export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}

function exportToJSON(state) {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Expense_Tracker_Backup_${Date.now()}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}

function printPage() {
  window.print();
}

window.ExportModule = {
  exportToCSV,
  exportToJSON,
  printPage
};

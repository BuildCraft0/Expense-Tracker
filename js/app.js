// app.js - Global App Bootstrap, Dynamic Layout, Navigation, and Overlay controllers

// 1. PIN Lock Redirect Guard
function runSecurityCheck() {
  const isLockPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
  const state = window.StorageModule.loadState();
  
  if (state.settings.pinLockEnabled) {
    const isUnlocked = sessionStorage.getItem('EXPENSE_TRACKER_PRO_UNLOCKED') === 'true';
    if (!isUnlocked && !isLockPage) {
      window.location.href = 'index.html';
      return false;
    }
  }
  return true;
}

// 2. Loading Indicator Controller
function showLoading() {
  let loader = document.getElementById('global-loader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.className = 'loader-overlay';
    loader.innerHTML = '<div class="loader"></div>';
    document.body.appendChild(loader);
  }
  loader.style.opacity = '1';
  loader.style.visibility = 'visible';
}

function hideLoading() {
  const loader = document.getElementById('global-loader');
  if (loader) {
    loader.style.opacity = '0';
    loader.style.visibility = 'hidden';
    setTimeout(() => {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
    }, 500);
  }
}

// 3. Toast Notifications
function showToast(message, type = 'info') {
  let container = document.getElementById('global-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'global-toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconClass = 'fa-info-circle';
  if (type === 'success') iconClass = 'fa-check-circle';
  if (type === 'danger') iconClass = 'fa-exclamation-circle';
  if (type === 'warning') iconClass = 'fa-exclamation-triangle';
  
  toast.innerHTML = `
    <i class="fas ${iconClass}"></i>
    <div>${message}</div>
  `;
  
  container.appendChild(toast);
  
  // Animate in
  setTimeout(() => toast.classList.add('show'), 50);
  
  // Remove after 3.5s
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) container.removeChild(toast);
    }, 300);
  }, 3500);
}

// 4. Custom Confirmation Modal Dialog
function showConfirm(title, message, onConfirm) {
  let dialog = document.getElementById('global-confirm-dialog');
  if (!dialog) {
    dialog = document.createElement('div');
    dialog.id = 'global-confirm-dialog';
    dialog.className = 'dialog-overlay';
    document.body.appendChild(dialog);
  }
  
  dialog.innerHTML = `
    <div class="dialog-content animate-scale">
      <h3 style="margin-bottom: 12px; font-weight:600;"><i class="fas fa-question-circle" style="color:var(--accent-primary); margin-right:8px;"></i>${title}</h3>
      <p style="color:var(--text-secondary); font-size:0.95rem; line-height:1.5;">${message}</p>
      <div class="dialog-buttons">
        <button class="btn" id="confirm-cancel-btn">Cancel</button>
        <button class="btn btn-danger" id="confirm-ok-btn">Confirm</button>
      </div>
    </div>
  `;
  
  dialog.classList.add('active');
  
  const cancelBtn = dialog.querySelector('#confirm-cancel-btn');
  const okBtn = dialog.querySelector('#confirm-ok-btn');
  
  const closeDialog = () => {
    dialog.classList.remove('active');
  };
  
  cancelBtn.onclick = () => {
    closeDialog();
  };
  
  okBtn.onclick = () => {
    closeDialog();
    if (typeof onConfirm === 'function') onConfirm();
  };
}

// 5. Build Layout Shell (Sidebar, Header, Bottom Nav) Dynamically
function buildLayoutShell() {
  const container = document.getElementById('app-layout');
  if (!container) return; // Not using layout wrapper (e.g. index.html)
  
  const currentPath = window.location.pathname;
  const isDashboard = currentPath.includes('dashboard.html');
  const isReports = currentPath.includes('reports.html');
  const isSettings = currentPath.includes('settings.html');
  const isProfile = currentPath.includes('profile.html');
  
  // Extract custom page content
  const pageContentHtml = container.innerHTML;
  container.innerHTML = '';
  
  const state = window.StorageModule.loadState();
  const userName = state.settings.userName || 'Finance Pro';
  const avatarUrl = state.settings.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop';
  
  // Construct Layout DOM
  const wrapper = document.createElement('div');
  wrapper.className = 'app-container';
  
  // Sidebar (Desktop)
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar animate-fade';
  sidebar.innerHTML = `
    <div class="sidebar-logo">
      <i class="fas fa-wallet"></i>
      <span>Expense Tracker</span>
    </div>
    <ul class="sidebar-menu">
      <li>
        <a href="dashboard.html" class="sidebar-link ${isDashboard ? 'active' : ''}">
          <i class="fas fa-chart-line"></i>
          <span data-translate="dashboard">Dashboard</span>
        </a>
      </li>
      <li>
        <a href="reports.html" class="sidebar-link ${isReports ? 'active' : ''}">
          <i class="fas fa-chart-pie"></i>
          <span data-translate="reports">Reports</span>
        </a>
      </li>
      <li>
        <a href="profile.html" class="sidebar-link ${isProfile ? 'active' : ''}">
          <i class="fas fa-user-cog"></i>
          <span data-translate="profile">Profile & Tools</span>
        </a>
      </li>
      <li>
        <a href="settings.html" class="sidebar-link ${isSettings ? 'active' : ''}">
          <i class="fas fa-sliders-h"></i>
          <span data-translate="settings">Settings</span>
        </a>
      </li>
    </ul>
    <div class="sidebar-footer">
      <button class="btn btn-outline" style="width:100%; border-color:var(--glass-border);" onclick="lockApplication()">
        <i class="fas fa-lock"></i> <span data-translate="logout">Lock App</span>
      </button>
    </div>
  `;
  
  // Main Content Wrap
  const mainWrapper = document.createElement('div');
  mainWrapper.className = 'main-wrapper';
  
  // Global Header
  const header = document.createElement('header');
  header.className = 'app-header animate-fade';
  
  // Dynamically determine current page translation key
  let pageTitleKey = 'dashboard';
  if (isReports) pageTitleKey = 'reports';
  if (isSettings) pageTitleKey = 'settings';
  if (isProfile) pageTitleKey = 'profile';
  
  header.innerHTML = `
    <div>
      <h1 data-translate="${pageTitleKey}" style="font-weight:700; font-size:1.8rem; background: linear-gradient(135deg, var(--text-primary), var(--text-secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></h1>
      <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:2px;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    <a href="profile.html" class="user-profile-badge">
      <div style="text-align: right; display:none; display:sm-block;">
        <p style="font-size:0.9rem; font-weight:600;">${userName}</p>
        <p style="font-size:0.75rem; color:var(--text-secondary);">${state.settings.userEmail || 'hello@tracker.com'}</p>
      </div>
      <div class="avatar-wrapper">
        <img src="${avatarUrl}" alt="Avatar">
      </div>
    </a>
  `;
  
  mainWrapper.appendChild(header);
  
  // Page Inner Box
  const pageContainer = document.createElement('div');
  pageContainer.innerHTML = pageContentHtml;
  mainWrapper.appendChild(pageContainer);
  
  // Mobile Navigation Floating Bar
  const mobileNav = document.createElement('nav');
  mobileNav.className = 'mobile-nav animate-slide';
  mobileNav.innerHTML = `
    <a href="dashboard.html" class="mobile-nav-item ${isDashboard ? 'active' : ''}">
      <i class="fas fa-chart-line"></i>
      <span>Dash</span>
    </a>
    <a href="reports.html" class="mobile-nav-item ${isReports ? 'active' : ''}">
      <i class="fas fa-chart-pie"></i>
      <span>Reports</span>
    </a>
    <a href="dashboard.html?action=quickadd" class="mobile-nav-center">
      <i class="fas fa-plus"></i>
    </a>
    <a href="profile.html" class="mobile-nav-item ${isProfile ? 'active' : ''}">
      <i class="fas fa-user-cog"></i>
      <span>Tools</span>
    </a>
    <a href="settings.html" class="mobile-nav-item ${isSettings ? 'active' : ''}">
      <i class="fas fa-sliders-h"></i>
      <span>Settings</span>
    </a>
  `;
  
  wrapper.appendChild(sidebar);
  wrapper.appendChild(mainWrapper);
  wrapper.appendChild(mobileNav);
  container.appendChild(wrapper);
}

// Lock out function
function lockApplication() {
  sessionStorage.removeItem('EXPENSE_TRACKER_PRO_UNLOCKED');
  window.location.href = 'index.html';
}

// 6. Bootstrap Initializations
document.addEventListener('DOMContentLoaded', () => {
  if (!runSecurityCheck()) return;
  
  buildLayoutShell();
  
  // Apply translation key renders
  if (window.SettingsModule) {
    window.SettingsModule.applyLocalization();
  }
  
  // PWA Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js?v=2026-06-25-landing-v3')
        .then(reg => console.log('Service Worker Registered successfully.'))
        .catch(err => console.log('Service Worker registration failed: ', err));
    });
  }
});

window.AppModule = {
  showLoading,
  hideLoading,
  showToast,
  showConfirm,
  lockApplication
};

// theme.js - Light/Dark Theme Controller

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.add('light-theme');
  } else {
    root.classList.remove('light-theme');
  }
}

function initTheme() {
  const state = window.StorageModule.loadState();
  const theme = state.settings.theme || 'dark';
  applyTheme(theme);
}

function toggleTheme() {
  const state = window.StorageModule.loadState();
  const currentTheme = state.settings.theme || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  state.settings.theme = newTheme;
  window.StorageModule.saveState();
  applyTheme(newTheme);
  
  return newTheme;
}

window.ThemeModule = {
  initTheme,
  toggleTheme,
  applyTheme
};

// Initialize immediately so theme loads before full page render (avoids flickering)
if (window.StorageModule) {
  initTheme();
}

# Expense Tracker

A modern offline-first expense tracking web app built with HTML, CSS, and vanilla JavaScript.

## Overview

Expense Tracker helps you manage:

- income and expenses
- category-wise budgets
- wallet balances
- savings goals
- analytics and charts
- backup and restore of app data
- PIN lock, theme, language, and currency settings

The app stores data in the browser using `localStorage`, so no backend or database setup is required.

## Features

- Dashboard with balance, income, expense, and savings summary
- Recent transactions with search, filter, sort, and favorites
- Monthly budget tracking and category-wise budget limits
- Reports page with Chart.js visual analytics
- Wallet management with transfer support
- Savings goal tracking
- EMI/loan and income tax calculator
- JSON backup/restore and CSV export
- PWA support with service worker caching
- Works mostly offline after assets are cached

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Chart.js
- Font Awesome
- Browser `localStorage`
- Service Worker + Web App Manifest

## Project Structure

```text
Expense-Tracker/
|-- index.html
|-- dashboard.html
|-- reports.html
|-- profile.html
|-- settings.html
|-- manifest.json
|-- sw.js
|-- css/
|   |-- global.css
|   |-- components.css
|   `-- pages.css
`-- js/
    |-- app.js
    |-- storage.js
    |-- dashboard.js
    |-- report.js
    |-- settings.js
    |-- wallet.js
    |-- budget.js
    |-- transaction.js
    |-- chart.js
    |-- export.js
    |-- import.js
    |-- filter.js
    |-- search.js
    `-- theme.js
```

## How to Run

This project does not need `npm install` or any build step.

### Recommended: Run with a local server

Service Worker and PWA features work best when the app is served from `localhost`.

1. Open PowerShell in the project folder.
2. Run:

```powershell
python -m http.server 5500
```

3. Open this URL in your browser:

```text
http://127.0.0.1:5500/index.html
```

### Alternative: Open directly

You can also open `index.html` directly in the browser, but some features like service worker/PWA caching may not work properly on `file://`.

## First Use

- The app comes with sample data on first load.
- Data is saved in your browser automatically.
- PIN lock is disabled by default.
- If you enable PIN lock and do not change the code, the default PIN is `1234`.

## Data Storage

- App data is saved in browser `localStorage`
- Backup/restore options are available in `Settings`
- Clearing browser storage will remove saved app data

## Notes

- Internet may be needed on first load for CDN assets such as Chart.js, Font Awesome, Google Fonts, and app icons.
- After the assets are cached, offline usage improves through the service worker.
- If you want full offline support from the first load, move external CDN assets into local files.

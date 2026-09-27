# Campus Coin

Know where every naira goes.

A React + Vite student budgeting app, built from the Campus Coin SRS: log income
and expenses by category, see spending broken down in charts, set monthly
budgets, and get personalized saving tips generated from your own transaction
history. Real sign up / log in / settings / delete account, all persisted
locally in the browser (no backend required to try it out).

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (typically http://localhost:5173) and sign up —
there's no seed data, so every account starts empty, exactly like a first-time
student user.

## How auth works

There's no backend. `src/context/AuthContext.jsx` stores accounts in
`localStorage` (`campuscoin_users`) and the active session
(`campuscoin_session`). Passwords are stored in plain text in the browser for
demo purposes only — swap this out for a real API (hashed passwords + a
server) before shipping this to real users.

## Structure

- `src/context/AuthContext.jsx` — sign up, log in, log out, update profile,
  delete account.
- `src/context/FinanceContext.jsx` — per-account state: categories,
  transactions, budgets, pinned/dismissed tips. Persisted per-user in
  `localStorage`. Also derives this month's income/expense/balance and
  category totals used across every page.
- `src/utils/tips.js` — generates ranked saving tips from the user's own
  history: budget pressure, month-over-month category growth, and an overall
  balance check. No AI/API calls — pure derived logic, matching the SRS's
  "optional AI insights" spirit without needing a key.
- `src/components/RouteGuards.jsx` — `ProtectedRoute` / `PublicOnlyRoute`,
  showing `LoadingScreen` (a spinning-coin animation) while the session
  check runs.
- `src/pages/`
  - `Login.jsx`, `Signup.jsx` — auth screens (signup also collects academic
    year, per the SRS's profile fields).
  - `Dashboard.jsx` — personalized greeting, this month's balance, quick-add
    income/expense, "This Month's Top Category", "Budget vs Actual", a
    surfaced top saving tip, and recent activity.
  - `Transactions.jsx` — full log with search/filter, edit and delete, and
    a "recurring" flag for things like rent or subscriptions.
  - `Categories.jsx` — manage income/expense categories; SRS default
    categories are locked, custom ones can be removed.
  - `Reports.jsx` — category breakdown pie chart, 6-month income vs expense
    bar chart, weekly spending this month, and a print/export button.
  - `Budgets.jsx` — set a monthly cap per category with live progress bars
    and over/near-limit alerts.
  - `Tips.jsx` — the full tips list with pin and dismiss.
  - `Settings.jsx` — edit profile (name, academic year, allowance baseline,
    savings goal), change password, delete account (type-to-confirm).
- `src/components/Sidebar.jsx` — left sidebar nav on desktop; collapses to a
  bottom tab bar under 900px.

## Build

```bash
npm run build
```

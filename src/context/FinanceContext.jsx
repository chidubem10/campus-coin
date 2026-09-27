import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { makeDefaultCategories } from '../data/defaults';

const FinanceContext = createContext(null);

function storageKey(userId) {
  return `campuscoin_finance_${userId}`;
}

function defaultState() {
  return {
    categories: makeDefaultCategories(),
    transactions: [],
    budgets: [], // { categoryId, month: 'YYYY-MM', limit }
    pinnedTips: [],
    dismissedTips: [],
  };
}

function loadState(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? { ...defaultState(), ...JSON.parse(raw) } : defaultState();
  } catch {
    return defaultState();
  }
}

function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function FinanceProvider({ children }) {
  const { currentUser } = useAuth();
  const [state, setState] = useState(defaultState());

  useEffect(() => {
    setState(currentUser ? loadState(currentUser.id) : defaultState());
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(storageKey(currentUser.id), JSON.stringify(state));
    }
  }, [state, currentUser?.id]);

  function addTransaction(tx) {
    setState((s) => ({
      ...s,
      transactions: [{ id: crypto.randomUUID(), date: new Date().toISOString(), ...tx }, ...s.transactions],
    }));
  }

  function updateTransaction(id, partial) {
    setState((s) => ({
      ...s,
      transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...partial } : t)),
    }));
  }

  function deleteTransaction(id) {
    setState((s) => ({ ...s, transactions: s.transactions.filter((t) => t.id !== id) }));
  }

  function addCategory(name, type) {
    setState((s) => ({
      ...s,
      categories: [...s.categories, { id: crypto.randomUUID(), name, type, isDefault: false }],
    }));
  }

  function deleteCategory(id) {
    setState((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== id) }));
  }

  function setBudget(categoryId, month, limit) {
    setState((s) => {
      const existing = s.budgets.find((b) => b.categoryId === categoryId && b.month === month);
      if (existing) {
        return {
          ...s,
          budgets: s.budgets.map((b) => (b.categoryId === categoryId && b.month === month ? { ...b, limit } : b)),
        };
      }
      return { ...s, budgets: [...s.budgets, { categoryId, month, limit }] };
    });
  }

  function removeBudget(categoryId, month) {
    setState((s) => ({ ...s, budgets: s.budgets.filter((b) => !(b.categoryId === categoryId && b.month === month)) }));
  }

  function togglePinTip(tipId) {
    setState((s) => ({
      ...s,
      pinnedTips: s.pinnedTips.includes(tipId) ? s.pinnedTips.filter((t) => t !== tipId) : [...s.pinnedTips, tipId],
    }));
  }

  function dismissTip(tipId) {
    setState((s) => ({ ...s, dismissedTips: [...s.dismissedTips, tipId] }));
  }

  const currentMonth = monthKey();

  const monthTransactions = useMemo(
    () => state.transactions.filter((t) => t.date.slice(0, 7) === currentMonth),
    [state.transactions, currentMonth],
  );

  const monthIncome = monthTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const monthExpense = monthTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = monthIncome - monthExpense;

  const categoryTotals = useMemo(() => {
    const totals = {};
    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        totals[t.categoryId] = (totals[t.categoryId] || 0) + t.amount;
      });
    return totals;
  }, [monthTransactions]);

  const topCategoryId = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topCategory = state.categories.find((c) => c.id === topCategoryId);

  const budgetsThisMonth = state.budgets.filter((b) => b.month === currentMonth);

  const value = {
    ...state,
    currentMonth,
    monthTransactions,
    monthIncome,
    monthExpense,
    balance,
    categoryTotals,
    topCategory,
    topCategoryAmount: topCategoryId ? categoryTotals[topCategoryId] : 0,
    budgetsThisMonth,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    deleteCategory,
    setBudget,
    removeBudget,
    togglePinTip,
    dismissTip,
    monthKeyOf: monthKey,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}

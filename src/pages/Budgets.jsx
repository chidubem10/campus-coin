import { useState } from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import TopBar from '../components/TopBar';
import { useFinance } from '../context/FinanceContext';
import './Budgets.css';

export default function Budgets() {
  const { categories, budgetsThisMonth, categoryTotals, currentMonth, setBudget, removeBudget } = useFinance();
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const availableCategories = expenseCategories.filter((c) => !budgetsThisMonth.some((b) => b.categoryId === c.id));

  const [categoryId, setCategoryId] = useState(availableCategories[0]?.id || '');
  const [limit, setLimit] = useState('');

  function handleAdd(e) {
    e.preventDefault();
    if (!categoryId || !limit || Number(limit) <= 0) return;
    setBudget(categoryId, currentMonth, Number(limit));
    setLimit('');
  }

  return (
    <div className="page">
      <TopBar title="Budgets" subtitle="Set a monthly cap per category and track it in real time." />

      {budgetsThisMonth.length === 0 ? (
        <div className="empty-state" style={{ marginBottom: 20 }}>
          <p className="empty-state__title">No budgets set for this month</p>
          <p className="empty-state__desc">Pick a category below and set a limit — you'll see live progress and get flagged when you're close to going over.</p>
        </div>
      ) : (
        <div className="budget-list">
          {budgetsThisMonth.map((b) => {
            const cat = categories.find((c) => c.id === b.categoryId);
            const spent = categoryTotals[b.categoryId] || 0;
            const pct = b.limit > 0 ? spent / b.limit : 0;
            const over = pct >= 1;
            const warn = pct >= 0.8 && !over;
            return (
              <div key={b.categoryId} className="card budget-card">
                <div className="budget-card__top">
                  <div>
                    <p className="budget-card__name">{cat?.name}</p>
                    <p className="empty-note">
                      ₦{spent.toLocaleString()} of ₦{b.limit.toLocaleString()}
                    </p>
                  </div>
                  <button type="button" className="btn-ghost-danger" onClick={() => removeBudget(b.categoryId, currentMonth)} aria-label="Remove budget">
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="progress-track">
                  <div
                    className={`progress-fill${over ? ' progress-fill--over' : warn ? ' progress-fill--warn' : ''}`}
                    style={{ width: `${Math.min(100, pct * 100)}%` }}
                  />
                </div>
                {(over || warn) && (
                  <p className={`budget-alert${over ? ' budget-alert--over' : ''}`}>
                    <AlertTriangle size={13} />
                    {over ? `Over budget by ₦${(spent - b.limit).toLocaleString()}` : `${Math.round(pct * 100)}% used — getting close`}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {availableCategories.length > 0 && (
        <div className="card" style={{ maxWidth: 420 }}>
          <div className="card__head">
            <h3>Set a new budget</h3>
          </div>
          <form className="auth-form" style={{ marginTop: 0 }} onSubmit={handleAdd}>
            <label className="field">
              <span>Category</span>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Monthly limit (₦)</span>
              <input type="number" min="1" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="e.g. 15000" />
            </label>
            <button type="submit" className="btn-primary">
              <Plus size={16} /> Set budget
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

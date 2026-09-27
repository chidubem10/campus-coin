import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, Wallet, ArrowUpRight, Lightbulb } from 'lucide-react';
import TopBar from '../components/TopBar';
import TransactionModal from '../components/TransactionModal';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { generateTips } from '../utils/tips';
import './Dashboard.css';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { currentUser } = useAuth();
  const {
    categories,
    transactions,
    budgets,
    monthIncome,
    monthExpense,
    balance,
    topCategory,
    topCategoryAmount,
    budgetsThisMonth,
    categoryTotals,
    currentMonth,
    addTransaction,
    dismissedTips,
  } = useFinance();

  const [modalType, setModalType] = useState(null);
  const recent = transactions.slice(0, 5);

  const tips = generateTips({ transactions, categories, budgets, currentMonth, monthIncome, monthExpense }).filter(
    (t) => !dismissedTips.includes(t.id),
  );
  const topTip = tips[0];

  const featuredBudget = budgetsThisMonth[0];
  const featuredBudgetCategory = featuredBudget ? categories.find((c) => c.id === featuredBudget.categoryId) : null;
  const featuredBudgetSpent = featuredBudget ? categoryTotals[featuredBudget.categoryId] || 0 : 0;
  const featuredBudgetPct = featuredBudget && featuredBudget.limit > 0 ? Math.min(1, featuredBudgetSpent / featuredBudget.limit) : 0;

  return (
    <div className="page">
      <TopBar title={`${greeting()}, ${currentUser.name.split(' ')[0]} 👋`} subtitle="Here's your money this month, at a glance." />

      <div className="stat-row">
        <div className="stat-tile stat-tile--emerald">
          <span className="stat-tile__value">₦{balance.toLocaleString()}</span>
          <span className="stat-tile__label">Balance this month (income − expense)</span>
        </div>
        <div className="stat-tile stat-tile--blue">
          <span className="stat-tile__value">₦{monthIncome.toLocaleString()}</span>
          <span className="stat-tile__label">Income logged</span>
        </div>
        <div className="stat-tile stat-tile--red">
          <span className="stat-tile__value">₦{monthExpense.toLocaleString()}</span>
          <span className="stat-tile__label">Expenses logged</span>
        </div>
      </div>

      <div className="quick-add-row">
        <button type="button" className="btn-primary" onClick={() => setModalType('income')}>
          <Plus size={16} /> Add income
        </button>
        <button type="button" className="btn-outline" onClick={() => setModalType('expense')}>
          <Plus size={16} /> Add expense
        </button>
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="card__head">
            <h3>
              <TrendingDown size={16} style={{ verticalAlign: -3, marginRight: 6, color: 'var(--red)' }} />
              This month's top category
            </h3>
          </div>
          {topCategory ? (
            <>
              <p className="dash-highlight">{topCategory.name}</p>
              <p className="empty-note">₦{topCategoryAmount.toLocaleString()} spent so far this month.</p>
            </>
          ) : (
            <p className="empty-note">
              No expenses logged yet. <Link to="/transactions">Add your first one</Link>.
            </p>
          )}
        </div>

        <div className="card">
          <div className="card__head">
            <h3>
              <Wallet size={16} style={{ verticalAlign: -3, marginRight: 6, color: 'var(--emerald)' }} />
              Budget vs actual
            </h3>
            <Link to="/budgets" className="link-out">
              Manage
            </Link>
          </div>
          {featuredBudget ? (
            <>
              <p className="dash-highlight">
                {featuredBudgetCategory?.name} — ₦{featuredBudgetSpent.toLocaleString()} / ₦{featuredBudget.limit.toLocaleString()}
              </p>
              <div className="progress-track" style={{ marginTop: 8 }}>
                <div
                  className={`progress-fill${featuredBudgetPct >= 1 ? ' progress-fill--over' : featuredBudgetPct >= 0.8 ? ' progress-fill--warn' : ''}`}
                  style={{ width: `${featuredBudgetPct * 100}%` }}
                />
              </div>
            </>
          ) : (
            <p className="empty-note">
              No budgets set yet. <Link to="/budgets">Set your first budget</Link>.
            </p>
          )}
        </div>
      </div>

      {topTip && (
        <div className="card tip-card">
          <div className="tip-card__icon">
            <Lightbulb size={16} />
          </div>
          <p>{topTip.text}</p>
          <Link to="/tips" className="link-out">
            View all tips <ArrowUpRight size={13} />
          </Link>
        </div>
      )}

      <div className="card">
        <div className="card__head">
          <h3>Recent activity</h3>
          <Link to="/transactions" className="link-out">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="empty-note">
            Nothing logged yet — use <strong>Add income</strong> or <strong>Add expense</strong> above to get started.
          </p>
        ) : (
          <ul className="recent-list">
            {recent.map((t) => {
              const cat = categories.find((c) => c.id === t.categoryId);
              return (
                <li key={t.id} className="recent-list__row">
                  <div>
                    <p className="recent-list__service">{cat?.name || 'Uncategorized'}</p>
                    <p className="recent-list__meta">{t.note || new Date(t.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`pill ${t.type === 'income' ? 'pill--income' : 'pill--expense'}`}>
                    {t.type === 'income' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {t.type === 'income' ? '+' : '-'}₦{t.amount.toLocaleString()}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {modalType && (
        <TransactionModal
          initialType={modalType}
          categories={categories}
          onClose={() => setModalType(null)}
          onSubmit={(tx) => {
            addTransaction(tx);
            setModalType(null);
          }}
        />
      )}
    </div>
  );
}

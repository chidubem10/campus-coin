import { useMemo } from 'react';
import { Download } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import TopBar from '../components/TopBar';
import { useFinance } from '../context/FinanceContext';
import './Reports.css';

const SLICE_COLORS = ['#0e7c5a', '#e0a020', '#3568d4', '#d9483f', '#8a5cf6', '#2aa9a0', '#c2662d', '#6b7268'];

function monthLabel(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
}

function lastNMonths(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

export default function Reports() {
  const { transactions, categories, currentMonth, monthIncome, monthExpense, categoryTotals } = useFinance();

  const pieData = useMemo(
    () =>
      Object.entries(categoryTotals)
        .map(([id, value]) => ({ name: categories.find((c) => c.id === id)?.name || 'Other', value }))
        .sort((a, b) => b.value - a.value),
    [categoryTotals, categories],
  );

  const months = lastNMonths(6);
  const trendData = useMemo(
    () =>
      months.map((m) => {
        const income = transactions.filter((t) => t.type === 'income' && t.date.slice(0, 7) === m).reduce((s, t) => s + t.amount, 0);
        const expense = transactions.filter((t) => t.type === 'expense' && t.date.slice(0, 7) === m).reduce((s, t) => s + t.amount, 0);
        return { month: monthLabel(m), income, expense };
      }),
    [transactions, months],
  );

  const weeklyThisMonth = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0];
    transactions
      .filter((t) => t.type === 'expense' && t.date.slice(0, 7) === currentMonth)
      .forEach((t) => {
        const day = new Date(t.date).getDate();
        const week = Math.min(4, Math.floor((day - 1) / 7));
        buckets[week] += t.amount;
      });
    return buckets;
  }, [transactions, currentMonth]);

  const hasData = transactions.length > 0;

  return (
    <div className="page">
      <TopBar
        title="Reports"
        subtitle="A category-wise, month-over-month view of your spending."
        actions={
          <button type="button" className="btn-outline" onClick={() => window.print()}>
            <Download size={15} /> Export / Print
          </button>
        }
      />

      {!hasData ? (
        <div className="empty-state">
          <p className="empty-state__title">No data to report yet</p>
          <p className="empty-state__desc">
            Once you log a few transactions, reports on category spend, income vs expense trends, and weekly summaries will appear
            here automatically.
          </p>
        </div>
      ) : (
        <div className="reports-grid">
          <div className="card">
            <div className="card__head">
              <h3>This month's spending by category</h3>
            </div>
            {pieData.length === 0 ? (
              <p className="empty-note">No expenses logged this month yet.</p>
            ) : (
              <div className="chart-box">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                      {pieData.map((entry, i) => (
                        <Cell key={entry.name} fill={SLICE_COLORS[i % SLICE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card__head">
              <h3>Income vs expense — last 6 months</h3>
            </div>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--text-faint)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--text-faint)" />
                  <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#0e7c5a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#d9483f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card reports-span-2">
            <div className="card__head">
              <h3>This month's spending, income ₦{monthIncome.toLocaleString()} vs expense ₦{monthExpense.toLocaleString()}</h3>
            </div>
            <div className="weekly-bars">
              {weeklyThisMonth.map((amount, i) => {
                const max = Math.max(...weeklyThisMonth, 1);
                return (
                  <div key={i} className="weekly-bars__col">
                    <div className="weekly-bars__track">
                      <div className="weekly-bars__fill" style={{ height: `${(amount / max) * 100}%` }} />
                    </div>
                    <span className="weekly-bars__label">Wk {i + 1}</span>
                    <span className="weekly-bars__value">₦{amount.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

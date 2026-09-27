import { useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, RefreshCcw, TrendingUp, TrendingDown } from 'lucide-react';
import TopBar from '../components/TopBar';
import TransactionModal from '../components/TransactionModal';
import { useFinance } from '../context/FinanceContext';
import './Transactions.css';

export default function Transactions() {
  const { categories, transactions, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [editingTx, setEditingTx] = useState(null);
  const [typeFilter, setTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    return transactions.filter((t) => {
      const cat = categories.find((c) => c.id === t.categoryId);
      const matchesType = typeFilter === 'All' || t.type === typeFilter.toLowerCase();
      const matchesCategory = categoryFilter === 'All' || t.categoryId === categoryFilter;
      const matchesQuery = ((cat?.name || '') + ' ' + (t.note || '')).toLowerCase().includes(query.toLowerCase());
      return matchesType && matchesCategory && matchesQuery;
    });
  }, [transactions, categories, typeFilter, categoryFilter, query]);

  function openEdit(tx) {
    setEditingTx(tx);
    setModalMode('edit');
  }

  return (
    <div className="page">
      <TopBar
        title="Transactions"
        subtitle="Every income and expense you've logged, in one place."
        actions={
          <button type="button" className="btn-primary" onClick={() => setModalMode('add')}>
            <Plus size={16} /> Log transaction
          </button>
        }
      />

      <div className="tx-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input type="text" placeholder="Search by category or note" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="segmented">
          {['All', 'Income', 'Expense'].map((f) => (
            <button key={f} className={typeFilter === f ? 'is-active' : ''} onClick={() => setTypeFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <select className="tx-category-filter" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="All">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__title">No transactions yet</p>
          <p className="empty-state__desc">
            Log your first allowance, part-time pay, or expense with <strong>Log transaction</strong> above — everything else on
            Campus Coin (reports, budgets, tips) builds from this.
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Note</th>
                <th>Date</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const cat = categories.find((c) => c.id === t.categoryId);
                return (
                  <tr key={t.id}>
                    <td className="row-title">
                      {cat?.name || 'Uncategorized'}
                      {t.recurring && (
                        <span className="pill pill--muted" style={{ marginLeft: 8 }}>
                          <RefreshCcw size={10} /> Recurring
                        </span>
                      )}
                    </td>
                    <td>{t.note || '—'}</td>
                    <td>{new Date(t.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`pill ${t.type === 'income' ? 'pill--income' : 'pill--expense'}`}>
                        {t.type === 'income' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {t.type === 'income' ? '+' : '-'}₦{t.amount.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button type="button" className="btn-ghost-danger" onClick={() => openEdit(t)} aria-label="Edit">
                          <Pencil size={15} />
                        </button>
                        <button type="button" className="btn-ghost-danger" onClick={() => deleteTransaction(t.id)} aria-label="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '28px 18px' }}>
                    No transactions match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalMode === 'add' && (
        <TransactionModal categories={categories} onClose={() => setModalMode(null)} onSubmit={(tx) => { addTransaction(tx); setModalMode(null); }} />
      )}

      {modalMode === 'edit' && editingTx && (
        <TransactionModal
          categories={categories}
          initial={editingTx}
          onClose={() => {
            setModalMode(null);
            setEditingTx(null);
          }}
          onSubmit={(tx) => {
            updateTransaction(editingTx.id, tx);
            setModalMode(null);
            setEditingTx(null);
          }}
        />
      )}
    </div>
  );
}

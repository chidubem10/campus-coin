import { useState } from 'react';
import { X } from 'lucide-react';

export default function TransactionModal({ initialType = 'expense', categories, initial, onClose, onSubmit }) {
  const [type, setType] = useState(initial?.type || initialType);
  const [categoryId, setCategoryId] = useState(initial?.categoryId || '');
  const [amount, setAmount] = useState(initial?.amount ?? '');
  const [note, setNote] = useState(initial?.note || '');
  const [recurring, setRecurring] = useState(initial?.recurring || false);

  const filteredCategories = categories.filter((c) => c.type === type);
  const effectiveCategoryId = categoryId && filteredCategories.some((c) => c.id === categoryId) ? categoryId : filteredCategories[0]?.id || '';

  function handleSubmit(e) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !effectiveCategoryId) return;
    onSubmit({ type, categoryId: effectiveCategoryId, amount: Number(amount), note, recurring });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="card__head">
          <h3>{initial ? 'Edit transaction' : 'Log a transaction'}</h3>
          <button type="button" className="btn-ghost-danger" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} style={{ marginTop: 0 }}>
          <div className="segmented" style={{ alignSelf: 'flex-start' }}>
            <button type="button" className={type === 'income' ? 'is-active' : ''} onClick={() => setType('income')}>
              Income
            </button>
            <button type="button" className={type === 'expense' ? 'is-active' : ''} onClick={() => setType('expense')}>
              Expense
            </button>
          </div>

          <label className="field">
            <span>Category</span>
            <select value={effectiveCategoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Amount (₦)</span>
            <input type="number" min="1" step="1" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 2500" />
          </label>

          <label className="field">
            <span>Note (optional)</span>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Jollof at campus cafe" />
          </label>

          <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} style={{ width: 16, height: 16 }} />
            <span>This repeats monthly (e.g. allowance, rent, subscription)</span>
          </label>

          <button type="submit" className="btn-primary">
            {initial ? 'Save changes' : `Add ${type}`}
          </button>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Plus, Trash2, Lock } from 'lucide-react';
import TopBar from '../components/TopBar';
import { useFinance } from '../context/FinanceContext';
import './Categories.css';

function CategoryColumn({ title, type, categories, onAdd, onDelete }) {
  const [name, setName] = useState('');

  function handleAdd(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, type);
    setName('');
  }

  return (
    <div className="card">
      <div className="card__head">
        <h3>{title}</h3>
        <span className="empty-note">{categories.length} categories</span>
      </div>

      <ul className="category-list">
        {categories.map((c) => (
          <li key={c.id} className="category-list__row">
            <span>{c.name}</span>
            {c.isDefault ? (
              <span className="pill pill--muted">
                <Lock size={11} /> Default
              </span>
            ) : (
              <button type="button" className="btn-ghost-danger" onClick={() => onDelete(c.id)} aria-label={`Delete ${c.name}`}>
                <Trash2 size={14} />
              </button>
            )}
          </li>
        ))}
      </ul>

      <form className="category-add-form" onSubmit={handleAdd}>
        <input type="text" placeholder={`Add a custom ${type} category`} value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit" className="btn-outline">
          <Plus size={14} /> Add
        </button>
      </form>
    </div>
  );
}

export default function Categories() {
  const { categories, addCategory, deleteCategory } = useFinance();
  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <div className="page">
      <TopBar title="Manage Categories" subtitle="Create your own categories under Income or Expense — defaults are locked, custom ones can be removed." />

      <div className="categories-grid">
        <CategoryColumn title="Income categories" type="income" categories={incomeCategories} onAdd={addCategory} onDelete={deleteCategory} />
        <CategoryColumn title="Expense categories" type="expense" categories={expenseCategories} onAdd={addCategory} onDelete={deleteCategory} />
      </div>
    </div>
  );
}

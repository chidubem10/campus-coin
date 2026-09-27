import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, AlertTriangle } from 'lucide-react';
import TopBar from '../components/TopBar';
import { useAuth } from '../context/AuthContext';
import { ACADEMIC_YEARS } from '../data/defaults';
import './Settings.css';

export default function Settings() {
  const { currentUser, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: currentUser.name || '',
    academicYear: currentUser.academicYear || ACADEMIC_YEARS[0],
    monthlyAllowanceBaseline: currentUser.monthlyAllowanceBaseline || 0,
    savingsGoal: currentUser.savingsGoal || 0,
  });
  const [saved, setSaved] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [confirmText, setConfirmText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function field(key) {
    return {
      value: form[key],
      onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  function handleSave(e) {
    e.preventDefault();
    updateProfile({
      ...form,
      monthlyAllowanceBaseline: Number(form.monthlyAllowanceBaseline) || 0,
      savingsGoal: Number(form.savingsGoal) || 0,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handlePasswordSave(e) {
    e.preventDefault();
    if (newPassword.length < 6) return;
    updateProfile({ password: newPassword });
    setNewPassword('');
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 2500);
  }

  function handleDelete() {
    deleteAccount();
    navigate('/signup', { replace: true });
  }

  return (
    <div className="page">
      <TopBar title="Settings" subtitle="Update your profile, or delete your account." />

      <form className="settings-card" onSubmit={handleSave}>
        <h3>Profile</h3>
        <div className="settings-grid">
          <label className="field">
            <span>Full name</span>
            <input type="text" required {...field('name')} />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" value={currentUser.email} disabled />
          </label>
          <label className="field">
            <span>Academic year</span>
            <select {...field('academicYear')}>
              {ACADEMIC_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Monthly allowance baseline (₦)</span>
            <input type="number" min="0" {...field('monthlyAllowanceBaseline')} placeholder="e.g. 40000" />
          </label>
          <label className="field">
            <span>Savings goal (₦)</span>
            <input type="number" min="0" {...field('savingsGoal')} placeholder="e.g. 100000" />
          </label>
        </div>
        <div className="settings-actions">
          <button type="submit" className="btn-primary">
            Save changes
          </button>
          {saved && <span className="settings-saved">Saved.</span>}
        </div>
      </form>

      <form className="settings-card" onSubmit={handlePasswordSave}>
        <h3>Change password</h3>
        <label className="field">
          <span>New password</span>
          <input type="password" placeholder="At least 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </label>
        <div className="settings-actions">
          <button type="submit" className="btn-primary" disabled={newPassword.length > 0 && newPassword.length < 6}>
            Update password
          </button>
          {passwordSaved && <span className="settings-saved">Password updated.</span>}
        </div>
      </form>

      <div className="settings-card settings-card--danger">
        <h3>
          <AlertTriangle size={16} /> Delete account
        </h3>
        <p>This permanently deletes your Campus Coin account, transactions, categories, budgets and tips. This can't be undone.</p>

        {!showDeleteConfirm ? (
          <button type="button" className="btn-danger" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 size={15} /> Delete my account
          </button>
        ) : (
          <div className="delete-confirm">
            <label className="field">
              <span>
                Type <strong>DELETE</strong> to confirm
              </span>
              <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" />
            </label>
            <div className="settings-actions">
              <button type="button" className="btn-outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button type="button" className="btn-danger" disabled={confirmText !== 'DELETE'} onClick={handleDelete}>
                <Trash2 size={15} /> Permanently delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { NavLink } from 'react-router-dom';
import { LayoutGrid, ArrowLeftRight, FolderKanban, PieChart, Target, Lightbulb, Coins } from 'lucide-react';
import './Sidebar.css';

const ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/categories', label: 'Categories', icon: FolderKanban },
  { to: '/reports', label: 'Reports', icon: PieChart },
  { to: '/budgets', label: 'Budgets', icon: Target },
  { to: '/tips', label: 'Tips', icon: Lightbulb },
];

export default function Sidebar() {
  return (
    <nav className="sidebar" aria-label="Primary">
      <div className="sidebar__brand">
        <span className="sidebar__brand-icon">
          <Coins size={20} strokeWidth={2.3} />
        </span>
        <span className="sidebar__brand-text">
          Campus<span className="sidebar__brand-accent">Coin</span>
        </span>
      </div>

      <ul className="sidebar__list">
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end} className={({ isActive }) => `sidebar__link${isActive ? ' is-active' : ''}`}>
              <Icon size={19} strokeWidth={2} />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="sidebar__tagline">
        Know where
        <br />
        every naira goes.
      </div>
    </nav>
  );
}

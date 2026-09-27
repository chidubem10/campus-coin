import { Link } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './TopBar.css';

export default function TopBar({ title, subtitle, actions }) {
  const { currentUser, logOut } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar__heading">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="topbar__controls">
        {actions}
        <Link to="/settings" className="topbar__user">
          <span className="topbar__avatar">{currentUser?.initial}</span>
          <span className="topbar__username">{currentUser?.name}</span>
        </Link>
        <Link to="/settings" className="icon-btn" title="Settings" aria-label="Settings">
          <Settings size={17} />
        </Link>
        <button type="button" className="icon-btn" title="Log out" aria-label="Log out" onClick={logOut}>
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}

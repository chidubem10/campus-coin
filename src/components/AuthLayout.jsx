import { Coins } from 'lucide-react';
import './AuthLayout.css';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand__icon">
            <Coins size={20} strokeWidth={2.3} />
          </span>
          <span>
            Campus<span className="auth-brand__accent">Coin</span>
          </span>
        </div>
        <p className="auth-tagline">Know where every naira goes.</p>

        <h1 className="auth-title">{title}</h1>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}

        {children}

        {footer && <div className="auth-footer">{footer}</div>}
      </div>
    </div>
  );
}

import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'react-router-dom';

const pageMeta = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your finance status' },
  '/transactions': { title: 'Transactions', subtitle: 'Track and manage income and expenses' },
  '/budgets': { title: 'Budgets', subtitle: 'Control monthly spending limits' },
  '/reports': { title: 'Reports', subtitle: 'Visual insights for monthly performance' },
  '/profile': { title: 'Profile & Settings', subtitle: 'Manage personal info and preferences' }
};

export default function Topbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const meta = pageMeta[pathname] || { title: 'Personal Finance', subtitle: 'Smart money tracking' };

  return (
    <header className="topbar card">
      <div>
        <h3>{meta.title}</h3>
        <p className="muted">{meta.subtitle}</p>
      </div>
      <div className="row gap-8">
        <div className="user-chip">
          <div className="avatar">{(user?.fullName || 'U').charAt(0).toUpperCase()}</div>
          <div>
            <strong>{user?.fullName || 'User'}</strong>
            <p className="muted">{user?.email || 'No email'}</p>
          </div>
        </div>
        <button className="btn" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}

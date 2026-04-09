import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'react-router-dom';

const pageMeta = {
  '/': { title: 'Tổng quan', subtitle: 'Ghi nhận giao dịch và xem tác động ngay lập tức' }
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

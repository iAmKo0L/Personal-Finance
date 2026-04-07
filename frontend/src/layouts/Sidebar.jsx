import { NavLink } from 'react-router-dom';

const items = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/budgets', label: 'Budgets' },
  { to: '/reports', label: 'Reports' },
  { to: '/profile', label: 'Profile/Settings' }
];

export default function Sidebar() {
  return (
    <aside className="sidebar card">
      <div className="brand-wrap">
        <div className="brand-dot" />
        <h2>FinTrack</h2>
      </div>
      <nav>
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

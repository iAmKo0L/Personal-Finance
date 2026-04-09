import { formatCurrency } from '../utils/format';

export default function StatCard({ title, value, currency = 'VND', tone = 'primary' }) {
  const formatted = typeof value === 'number' ? formatCurrency(value, currency) : value;
  return (
    <div className={`card stat-card tone-${tone}`}>
      <p className="stat-title">{title}</p>
      <h3>{formatted}</h3>
    </div>
  );
}

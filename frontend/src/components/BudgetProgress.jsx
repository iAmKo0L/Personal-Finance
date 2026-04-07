export default function BudgetProgress({ usagePercent = 0, status = 'normal' }) {
  const normalized = Math.min(usagePercent, 100);
  const tone = status === 'exceeded' ? 'danger' : status === 'warning' ? 'warning' : 'safe';

  return (
    <div>
      <div className="progress">
        <div className={`bar ${tone}`} style={{ width: `${normalized}%` }} />
      </div>
      <small className={`status-text ${tone}`}>{usagePercent.toFixed(1)}% used</small>
    </div>
  );
}

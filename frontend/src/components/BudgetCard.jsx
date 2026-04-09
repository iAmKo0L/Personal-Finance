import { formatCurrency } from '../utils/format';
import BudgetProgress from './BudgetProgress';

export default function BudgetCard({
  budget,
  spentAmount = 0,
  currency = 'VND',
  categoryName = 'Total budget',
  onEdit,
  onDelete
}) {
  const usagePercent = budget.limitAmount ? (spentAmount / budget.limitAmount) * 100 : 0;
  const status = usagePercent >= 100 ? 'exceeded' : usagePercent >= budget.alertThreshold ? 'warning' : 'normal';

  const statusLabel =
    status === 'exceeded' ? 'Exceeded' : status === 'warning' ? 'Near threshold' : 'Normal';

  return (
    <div className="card budget-card">
      <div className="row-between">
        <h4>{categoryName}</h4>
        <div className="row gap-8">
          {onEdit && (
            <button className="link" onClick={() => onEdit(budget)}>
              Edit
            </button>
          )}
          {onDelete && (
            <button className="link danger" onClick={() => onDelete(budget)}>
              Delete
            </button>
          )}
        </div>
      </div>
      <p className="muted">{budget.month}</p>
      <div className="budget-metrics">
        <div>
          <small className="muted">Limit amount</small>
          <p>{formatCurrency(budget.limitAmount, currency)}</p>
        </div>
        <div>
          <small className="muted">Spent amount</small>
          <p>{formatCurrency(spentAmount, currency)}</p>
        </div>
        <div>
          <small className="muted">Status</small>
          <p className={`status-chip ${status}`}>{statusLabel}</p>
        </div>
      </div>
      <BudgetProgress usagePercent={usagePercent} status={status} />
      <small className="muted">Alert threshold: {budget.alertThreshold}%</small>
    </div>
  );
}

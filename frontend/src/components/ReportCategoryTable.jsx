import { formatCurrency } from '../utils/format';
import EmptyState from './EmptyState';

export default function ReportCategoryTable({ rows = [], totalExpense = 0, currency = 'USD' }) {
  if (rows.length === 0) {
    return <EmptyState title="No category expense data" subtitle="Try another month." />;
  }

  return (
    <div className="table-wrap card">
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Total Expense</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.categoryId}>
              <td><span className="badge">{item.categoryName}</span></td>
              <td className="amount expense">-{formatCurrency(item.amount, currency)}</td>
              <td>{item.percentage}%</td>
            </tr>
          ))}
          <tr>
            <td><strong>Total</strong></td>
            <td className="amount expense"><strong>-{formatCurrency(totalExpense, currency)}</strong></td>
            <td><strong>100%</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

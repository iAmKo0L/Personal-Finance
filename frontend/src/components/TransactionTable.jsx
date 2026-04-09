import { formatCurrency } from '../utils/format';

export default function TransactionTable({ rows, categories, currency = 'VND', onEdit, onDelete }) {
  const categoryName = (id) => categories.find((c) => c.id === id)?.name || 'Unknown';

  return (
    <div className="table-wrap card">
      <table>
        <thead>
          <tr>
            <th>Date</th><th>Type</th><th>Category</th><th>Note</th><th>Amount</th><th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id}>
              <td>{item.transactionDate?.slice(0, 10)}</td>
              <td><span className={`pill ${item.type}`}>{item.type}</span></td>
              <td><span className="badge">{categoryName(item.categoryId)}</span></td>
              <td>{item.note || '-'}</td>
              <td className={`amount ${item.type}`}>
                {item.type === 'expense' ? '-' : '+'}
                {formatCurrency(item.amount, currency)}
              </td>
              <td className="row-end">
                <button className="link" onClick={() => onEdit(item)}>Edit</button>
                <button className="link danger" onClick={() => onDelete(item)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

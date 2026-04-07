export default function EmptyState({ title = 'No data', subtitle = 'Try another filter.' }) {
  return (
    <div className="empty-state">
      <h4>{title}</h4>
      <p>{subtitle}</p>
    </div>
  );
}

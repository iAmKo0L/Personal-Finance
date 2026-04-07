export default function ChartCard({ title, children }) {
  return (
    <div className="card chart-card">
      <div className="card-header"><h3>{title}</h3></div>
      <div className="chart-content">{children}</div>
    </div>
  );
}

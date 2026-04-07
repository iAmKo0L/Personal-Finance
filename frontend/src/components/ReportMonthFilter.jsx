export default function ReportMonthFilter({ month, onChange }) {
  return (
    <div className="card row-between wrap gap-8">
      <div>
        <h3>Reports</h3>
        <p className="muted">Visual summary for selected month</p>
      </div>
      <input type="month" value={month} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

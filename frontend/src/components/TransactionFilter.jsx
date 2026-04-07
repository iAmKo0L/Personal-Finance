export default function TransactionFilter({ filters, categories, onChange, onAdd }) {
  return (
    <div className="card row-between wrap gap-8">
      <div className="row gap-8 wrap">
        <input
          type="month"
          value={filters.month}
          onChange={(e) => onChange({ ...filters, month: e.target.value })}
        />
        <select value={filters.type} onChange={(e) => onChange({ ...filters, type: e.target.value })}>
          <option value="">All types</option>
          <option value="income">income</option>
          <option value="expense">expense</option>
        </select>
        <select
          value={filters.categoryId}
          onChange={(e) => onChange({ ...filters, categoryId: e.target.value })}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          placeholder="Search note..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>
      <button className="btn btn-primary" onClick={onAdd}>
        + Add transaction
      </button>
    </div>
  );
}

import { useEffect, useState } from 'react';

const DEFAULT_FORM = {
  month: '',
  categoryId: '',
  limitAmount: '',
  alertThreshold: 80
};

export default function BudgetForm({ categories, initial, defaultMonth, onSubmit, onCancel, loading = false }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) {
      setForm({
        month: initial.month,
        categoryId: initial.categoryId || '',
        limitAmount: String(initial.limitAmount || ''),
        alertThreshold: Number(initial.alertThreshold || 80)
      });
    } else {
      setForm({ ...DEFAULT_FORM, month: defaultMonth });
    }
  }, [initial, defaultMonth]);

  function handleSubmit(e) {
    e.preventDefault();
    const limitAmount = Number(form.limitAmount);
    const alertThreshold = Number(form.alertThreshold);

    if (!form.month) return setError('Month is required');
    if (!limitAmount || limitAmount <= 0) return setError('Limit amount must be greater than 0');
    if (alertThreshold < 1 || alertThreshold > 100) return setError('Alert threshold must be from 1 to 100');

    setError('');
    onSubmit({
      month: form.month,
      categoryId: form.categoryId || null,
      limitAmount,
      alertThreshold
    });
  }

  return (
    <form className="modal card" onSubmit={handleSubmit}>
      <h3>{initial ? 'Edit budget' : 'Create budget'}</h3>
      {error && <p className="text-danger">{error}</p>}

      <label>
        Month
        <input
          type="month"
          value={form.month}
          onChange={(e) => setForm({ ...form, month: e.target.value })}
          required
        />
      </label>

      <label>
        Category
        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
        >
          <option value="">Total budget</option>
          {categories.filter((c) => c.type === 'expense').map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>

      <label>
        Limit amount
        <input
          type="number"
          value={form.limitAmount}
          onChange={(e) => setForm({ ...form, limitAmount: e.target.value })}
          required
        />
      </label>

      <label>
        Alert threshold (%)
        <input
          type="number"
          min="1"
          max="100"
          value={form.alertThreshold}
          onChange={(e) => setForm({ ...form, alertThreshold: e.target.value })}
          required
        />
      </label>

      <div className="row-end">
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save budget'}
        </button>
      </div>
    </form>
  );
}

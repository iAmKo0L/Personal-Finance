import { useState } from 'react';

export default function TransactionForm({ categories, initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || {
    type: 'expense', amount: '', categoryId: categories[0]?.id || '', note: '', transactionDate: new Date().toISOString().slice(0, 10)
  });
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return setError('Amount must be greater than 0');
    if (!form.categoryId) return setError('Please select category');
    setError('');
    onSubmit({ ...form, amount: Number(form.amount), transactionDate: `${form.transactionDate}T00:00:00.000Z` });
  };

  return (
    <form className="modal card" onSubmit={submit}>
      <h3>{initial ? 'Edit transaction' : 'New transaction'}</h3>
      {error && <p className="text-danger">{error}</p>}
      <label>Type<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="income">income</option><option value="expense">expense</option></select></label>
      <label>Amount<input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></label>
      <label>Category<select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label>Date<input type="date" value={form.transactionDate.slice(0, 10)} onChange={(e) => setForm({ ...form, transactionDate: e.target.value })} /></label>
      <label>Note<input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></label>
      <div className="row-end"><button type="button" className="btn" onClick={onCancel}>Cancel</button><button className="btn btn-primary" type="submit">Save</button></div>
    </form>
  );
}

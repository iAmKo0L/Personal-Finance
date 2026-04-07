import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import TransactionTable from '../components/TransactionTable';
import TransactionForm from '../components/TransactionForm';
import TransactionFilter from '../components/TransactionFilter';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import AlertBanner from '../components/AlertBanner';
import { getCurrentMonth } from '../utils/format';

export default function TransactionsPage() {
  const { token, user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [result, setResult] = useState({ totals: {}, data: [] });
  const [filters, setFilters] = useState({ month: getCurrentMonth(), type: '', categoryId: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const apiFilters = {
        month: filters.month,
        type: filters.type,
        categoryId: filters.categoryId
      };
      const [cats, tx] = await Promise.all([api.getCategories(token), api.getTransactions(token, apiFilters)]);
      setCategories(cats);
      setResult(tx);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Failed to load transactions' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token, filters.month, filters.type, filters.categoryId]);

  const rows = useMemo(() => {
    if (!filters.search) return result.data;
    return result.data.filter((x) => String(x.note || '').toLowerCase().includes(filters.search.toLowerCase()));
  }, [result.data, filters.search]);

  async function saveTransaction(payload) {
    try {
      setSubmitting(true);
      if (editing) {
        await api.updateTransaction(token, editing.id, payload);
        setFeedback({ type: 'info', message: 'Transaction updated successfully' });
      } else {
        await api.createTransaction(token, payload);
        setFeedback({ type: 'info', message: 'Transaction created successfully' });
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Failed to save transaction' });
    } finally {
      setSubmitting(false);
    }
  }

  async function removeTransaction() {
    if (!deleting) return;
    try {
      setSubmitting(true);
      await api.deleteTransaction(token, deleting.id);
      setDeleting(null);
      setFeedback({ type: 'info', message: 'Transaction deleted successfully' });
      load();
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Failed to delete transaction' });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner text="Loading transactions..." />;

  return (
    <div className="grid gap-16">
      <AlertBanner type={feedback.type || 'info'} message={feedback.message} />

      <TransactionFilter
        filters={filters}
        categories={categories}
        onChange={setFilters}
        onAdd={() => {
          setEditing(null);
          setShowForm(true);
        }}
      />

      <div className="card row gap-16">
        <strong>Income: {result.totals.totalIncome || 0}</strong>
        <strong>Expense: {result.totals.totalExpense || 0}</strong>
        <strong>Balance: {result.totals.balance || 0}</strong>
      </div>

      {rows.length === 0 ? <EmptyState title="No transactions" subtitle="Create your first transaction." /> : (
        <TransactionTable rows={rows} categories={categories} currency={user?.settings?.defaultCurrency || 'USD'} onEdit={(item) => { setEditing(item); setShowForm(true); }} onDelete={setDeleting} />
      )}

      {showForm && (
        <div className="modal-backdrop">
          <TransactionForm
            categories={categories}
            initial={editing ? { ...editing, transactionDate: editing.transactionDate.slice(0, 10) } : null}
            onSubmit={saveTransaction}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      )}
      <ConfirmDialog
        open={!!deleting}
        title="Delete transaction"
        message="This action cannot be undone."
        onConfirm={removeTransaction}
        onCancel={() => setDeleting(null)}
      />
      {submitting && <LoadingSpinner text="Saving changes..." />}
    </div>
  );
}

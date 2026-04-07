import { useEffect, useMemo, useState } from 'react';
import BudgetCard from '../components/BudgetCard';
import BudgetForm from '../components/BudgetForm';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertBanner from '../components/AlertBanner';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { getCurrentMonth } from '../utils/format';

export default function BudgetsPage() {
  const { token, user } = useAuth();
  const [month, setMonth] = useState(getCurrentMonth());
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  async function load() {
    try {
      setLoading(true);
      const [bs, tx, cs] = await Promise.all([
        api.getBudgets(token),
        api.getTransactions(token, { month }),
        api.getCategories(token)
      ]);
      setBudgets(bs.filter((b) => b.month === month));
      setTransactions(tx.data);
      setCategories(cs);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Failed to load budgets' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token, month]);

  const spentByCategory = useMemo(() => {
    const map = {};
    transactions.filter((t) => t.type === 'expense').forEach((t) => { map[t.categoryId] = (map[t.categoryId] || 0) + t.amount; });
    return map;
  }, [transactions]);

  async function saveBudget(payload) {
    try {
      setSubmitting(true);
      if (editingBudget) {
        await api.updateBudget(token, editingBudget.id, payload);
        setFeedback({ type: 'info', message: 'Budget updated successfully' });
      } else {
        await api.createBudget(token, payload);
        setFeedback({ type: 'info', message: 'Budget created successfully' });
      }
      setShowForm(false);
      setEditingBudget(null);
      load();
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Failed to save budget' });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner text="Loading budgets..." />;

  return (
    <div className="grid gap-16">
      <AlertBanner type={feedback.type || 'info'} message={feedback.message} />

      <div className="card row-between">
        <h3>Budgets</h3>
        <div className="row gap-8">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          <button className="btn btn-primary" onClick={() => { setEditingBudget(null); setShowForm(true); }}>
            + New budget
          </button>
        </div>
      </div>

      {budgets.length === 0 ? <EmptyState title="No budgets" subtitle="Create monthly budget to track spending." /> : (
        <div className="grid two-col">
          {budgets.map((b) => {
            const spentAmount = b.categoryId
              ? (spentByCategory[b.categoryId] || 0)
              : Object.values(spentByCategory).reduce((s, x) => s + x, 0);
            return (
              <BudgetCard
                key={b.id}
                budget={b}
                spentAmount={spentAmount}
                currency={user?.settings?.defaultCurrency || 'USD'}
                categoryName={b.categoryId ? categories.find((c) => c.id === b.categoryId)?.name : 'Total budget'}
                onEdit={(budget) => {
                  setEditingBudget(budget);
                  setShowForm(true);
                }}
              />
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="modal-backdrop">
          <BudgetForm
            categories={categories}
            initial={editingBudget}
            defaultMonth={month}
            onSubmit={saveBudget}
            onCancel={() => { setShowForm(false); setEditingBudget(null); }}
            loading={submitting}
          />
        </div>
      )}
    </div>
  );
}

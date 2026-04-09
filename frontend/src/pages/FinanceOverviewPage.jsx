import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { getCurrentMonth } from '../utils/format';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import AlertBanner from '../components/AlertBanner';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import TransactionTable from '../components/TransactionTable';
import TransactionForm from '../components/TransactionForm';
import BudgetForm from '../components/BudgetForm';
import BudgetCard from '../components/BudgetCard';
import ConfirmDialog from '../components/ConfirmDialog';
import { CHART_COLORS } from '../constants/theme';

export default function FinanceOverviewPage() {
  const { token, user } = useAuth();
  const currency = user?.settings?.defaultCurrency || 'VND';

  const [month, setMonth] = useState(getCurrentMonth());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [chart, setChart] = useState(null);
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [budgetAlerts, setBudgetAlerts] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetSubmitting, setBudgetSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteBudgetTarget, setDeleteBudgetTarget] = useState(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [cats, tx, s, c, b, alerts, allBudgets] = await Promise.all([
        api.getCategories(token),
        api.getTransactions(token, { month }),
        api.getTransactionsSummary(token, month),
        api.getTransactionsChart(token, month),
        api.getBudgetStatus(token, month),
        api.getBudgetAlerts(token, month),
        api.getBudgets(token)
      ]);
      setCategories(cats);
      setTransactions(tx.data || []);
      setSummary(s);
      setChart(c);
      setBudgetStatus(b);
      setBudgetAlerts(alerts);
      setBudgets(allBudgets);
    } catch (e) {
      setFeedback({ type: 'error', message: e.message || 'Không tải được dữ liệu.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, month]);

  const rows = useMemo(() => transactions, [transactions]);

  async function addTransaction(payload) {
    try {
      setSubmitting(true);
      setFeedback({ type: '', message: '' });
      const result = await api.createTransaction(token, payload);

      // Fast UI update from the combined response; then refresh in background for charts/alerts.
      if (result?.transaction) {
        setTransactions((prev) => [result.transaction, ...prev]);
      }
      if (result?.summary) setSummary(result.summary);
      if (result?.budgetStatus) setBudgetStatus(result.budgetStatus);
      if (result?.alerts?.length) {
        setBudgetAlerts({ month, data: result.alerts, raw: [] });
      }
      setFeedback({ type: 'info', message: result?.message || 'Đã thêm giao dịch.' });

      // Ensure everything is consistent (chart + alerts from report service).
      loadAll();
    } catch (e) {
      setFeedback({ type: 'error', message: e.message || 'Thêm giao dịch thất bại.' });
    } finally {
      setSubmitting(false);
    }
  }

  async function updateTransaction(item, payload) {
    try {
      setSubmitting(true);
      setFeedback({ type: '', message: '' });
      await api.updateTransaction(token, item.id, payload);
      setFeedback({ type: 'info', message: 'Đã cập nhật giao dịch.' });
      setShowEditForm(false);
      setEditing(null);
      await loadAll();
    } catch (e) {
      setFeedback({ type: 'error', message: e.message || 'Cập nhật giao dịch thất bại.' });
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteTransaction(item) {
    setDeleteTarget(item);
  }

  async function confirmDelete() {
    const item = deleteTarget;
    if (!item) return;
    try {
      setSubmitting(true);
      await api.deleteTransaction(token, item.id);
      setFeedback({ type: 'info', message: 'Đã xóa giao dịch.' });
      await loadAll();
    } catch (e) {
      setFeedback({ type: 'error', message: e.message || 'Xóa giao dịch thất bại.' });
    } finally {
      setSubmitting(false);
      setDeleteTarget(null);
    }
  }

  async function editBudget(budget) {
    setEditingBudget(budget);
    setShowBudgetForm(true);
  }

  async function saveBudget(payload) {
    try {
      setBudgetSubmitting(true);
      setFeedback({ type: '', message: '' });
      if (editingBudget) {
        await api.updateBudget(token, editingBudget.id, payload);
        setFeedback({ type: 'info', message: 'Đã cập nhật budget.' });
      } else {
        await api.createBudget(token, payload);
        setFeedback({ type: 'info', message: 'Đã lưu budget.' });
      }
      setShowBudgetForm(false);
      setEditingBudget(null);
      await loadAll();
    } catch (e) {
      setFeedback({ type: 'error', message: e.message || 'Lưu budget thất bại.' });
    } finally {
      setBudgetSubmitting(false);
    }
  }

  function askDeleteBudget(budget) {
    setDeleteBudgetTarget(budget);
  }

  async function confirmDeleteBudget() {
    const budget = deleteBudgetTarget;
    if (!budget) return;
    try {
      setBudgetSubmitting(true);
      await api.deleteBudget(token, budget.id);
      setFeedback({ type: 'info', message: 'Đã xóa budget.' });
      await loadAll();
    } catch (e) {
      setFeedback({ type: 'error', message: e.message || 'Xóa budget thất bại.' });
    } finally {
      setBudgetSubmitting(false);
      setDeleteBudgetTarget(null);
    }
  }

  if (loading) return <LoadingSpinner text="Đang tải dữ liệu..." />;

  const totalIncome = summary?.totalIncome || 0;
  const totalExpense = summary?.totalExpense || 0;
  const balance = summary?.balance || 0;
  const usagePercent = budgetStatus?.usagePercent || 0;
  // Tính spent theo category từ dữ liệu transaction hiện tại.
  // Không dùng useMemo để tránh thay đổi thứ tự hooks khi loading.
  const spentByCategory = (() => {
    const map = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        if (!t.categoryId) return;
        map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
      });
    return map;
  })();
  const budgetPieData =
    budgetStatus && budgetStatus.monthlyBudget
      ? [
          { name: 'Đã dùng', value: budgetStatus.spentAmount || 0 },
          { name: 'Còn lại', value: Math.max((budgetStatus.monthlyBudget || 0) - (budgetStatus.spentAmount || 0), 0) }
        ]
      : [];

  const alertItem = (budgetAlerts?.data || [])[0] || null;
  const alertTone =
    alertItem?.type === 'critical' ? 'error' : alertItem?.type === 'warning' ? 'warning' : 'info';

  return (
    <div className="grid gap-16">
      <div className="card row-between">
        <div>
          <h3>Personal Finance Overview</h3>
          <p className="muted">Ghi nhận giao dịch và xem tác động lên thống kê & ngân sách.</p>
        </div>
        <div className="row gap-8">
          <label className="row gap-8">
            <span className="muted">Tháng</span>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </label>
        </div>
      </div>

      <AlertBanner type={feedback.type || 'info'} message={feedback.message} />

      <div className="grid two-col">
        <div className="card">
          <div className="row-between">
            <h3>Thêm giao dịch</h3>
            {submitting ? <span className="muted">Đang lưu...</span> : null}
          </div>
          {categories.length === 0 ? (
            <EmptyState title="Chưa có danh mục" subtitle="Hãy thử tải lại, hoặc kiểm tra backend." />
          ) : (
            <TransactionForm
              categories={categories}
              onSubmit={addTransaction}
              onCancel={() => setFeedback({ type: '', message: '' })}
            />
          )}
        </div>

        <div className="grid gap-16">
          <div className="grid stats-grid">
            <StatCard title="Total income" value={totalIncome} tone="income" currency={currency} />
            <StatCard title="Total expense" value={totalExpense} tone="expense" currency={currency} />
            <StatCard title="Balance" value={balance} tone="primary" currency={currency} />
            <StatCard title="Budget used" value={`${Number(usagePercent).toFixed(1)}%`} tone="warning" />
          </div>

          <div className="card">
            <div className="row-between">
              <h3>Cảnh báo ngân sách</h3>
              <div className="row gap-8">
                <button className="btn" type="button" onClick={() => setShowBudgetForm(true)}>
                  + Thêm budget
                </button>
                <span
                  className={`alert-pill ${
                    alertItem?.type === 'critical'
                      ? 'error'
                      : alertItem?.type === 'warning'
                        ? 'warning'
                        : 'safe'
                  }`}
                >
                  {alertItem?.type === 'critical'
                    ? 'Vượt'
                    : alertItem?.type === 'warning'
                      ? 'Cảnh báo'
                      : 'An toàn'}
                </span>
              </div>
            </div>
            {!budgetStatus || !budgetStatus.monthlyBudget ? (
              <EmptyState
                title="Chưa có ngân sách tháng này"
                subtitle="Bấm “+ Thêm budget” để cài đặt ngân sách tháng này."
              />
            ) : (
              <>
                {alertItem ? (
                  <AlertBanner type={alertTone} message={alertItem.message} />
                ) : (
                  <EmptyState title="Không có cảnh báo" subtitle="Ngân sách đang trong mức an toàn." />
                )}
                {budgetPieData.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={budgetPieData} dataKey="value" nameKey="name" outerRadius={80} label>
                          {budgetPieData.map((_, i) => (
                            <Cell key={i} fill={i === 0 ? '#f97316' : '#22c55e'} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {budgets.filter((b) => b.categoryId).length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <h4>Ngân sách theo danh mục</h4>
                    <div className="grid two-col">
                      {budgets
                        .filter((b) => b.categoryId)
                        .map((b) => {
                          const spent = spentByCategory[b.categoryId] || 0;
                          const data = [
                            { name: 'Đã dùng', value: spent },
                            { name: 'Còn lại', value: Math.max(b.limitAmount - spent, 0) }
                          ];
                          const catName =
                            categories.find((c) => c.id === b.categoryId)?.name || 'Danh mục';
                          return (
                            <div key={b.id}>
                              <p className="muted">{catName}</p>
                              <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                  <Pie data={data} dataKey="value" nameKey="name" outerRadius={70} label>
                                    {data.map((_, i) => (
                                      <Cell key={i} fill={i === 0 ? '#f97316' : '#22c55e'} />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid two-col">
        <ChartCard title="Income vs Expense (theo ngày)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={(chart?.incomeVsExpenseByDay || []).map((x) => ({ ...x, label: x.date.slice(8, 10) }))}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#16a34a" />
              <Bar dataKey="expense" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Expense by category">
          {(chart?.expenseByCategory || []).length === 0 ? (
            <EmptyState title="Chưa có dữ liệu chi theo danh mục" subtitle="Hãy thêm expense transaction." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={chart.expenseByCategory} dataKey="amount" nameKey="categoryName" outerRadius={100} label>
                  {chart.expenseByCategory.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <ChartCard title="Cashflow (net) theo ngày">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chart?.incomeVsExpenseByDay || []}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="net" stroke="#0ea5a4" fill="#ccfbf1" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="card">
        <div className="row-between">
          <h3>Danh sách giao dịch</h3>
          <span className="muted">{rows.length} giao dịch</span>
        </div>
        {rows.length === 0 ? (
          <EmptyState title="Chưa có giao dịch" subtitle="Hãy thêm giao dịch đầu tiên bằng form phía trên." />
        ) : (
          <TransactionTable
            rows={rows}
            categories={categories}
            currency={currency}
            onEdit={(item) => {
              setEditing(item);
              setShowEditForm(true);
            }}
            onDelete={deleteTransaction}
          />
        )}
      </div>

      <div className="card">
        <div className="row-between">
          <h3>Danh sách ngân sách tháng {month}</h3>
          <button
            className="button"
            onClick={() => {
              setEditingBudget(null);
              setShowBudgetForm(true);
            }}
          >
            + Thêm budget
          </button>
        </div>
        {budgets.filter((b) => b.month === month).length === 0 ? (
          <EmptyState
            title="Chưa có ngân sách cho tháng này"
            subtitle="Bấm “+ Thêm budget” để tạo ngân sách."
          />
        ) : (
          <div className="grid two-col">
            {budgets
              .filter((b) => b.month === month)
              .map((b) => {
                const spent = spentByCategory[b.categoryId] || 0;
                const catName =
                  b.categoryId && categories.find((c) => c.id === b.categoryId)?.name
                    ? categories.find((c) => c.id === b.categoryId)?.name
                    : 'Ngân sách tổng';
                return (
                  <BudgetCard
                    key={b.id}
                    budget={b}
                    spentAmount={spent}
                    currency={currency}
                    categoryName={catName}
                    onEdit={editBudget}
                    onDelete={askDeleteBudget}
                  />
                );
              })}
          </div>
        )}
      </div>

      {showEditForm && editing && (
        <div className="modal-backdrop">
          <TransactionForm
            categories={categories}
            initial={editing}
            onSubmit={(payload) => updateTransaction(editing, payload)}
            onCancel={() => {
              setShowEditForm(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      {showBudgetForm && (
        <div className="modal-backdrop">
          <BudgetForm
            categories={categories}
            defaultMonth={editingBudget?.month || month}
            initial={editingBudget || undefined}
            onSubmit={saveBudget}
            onCancel={() => {
              setShowBudgetForm(false);
              setEditingBudget(null);
            }}
            loading={budgetSubmitting}
          />
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa giao dịch"
        message="Bạn chắc chắn muốn xóa giao dịch này?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(deleteBudgetTarget)}
        title="Xóa ngân sách"
        message="Bạn chắc chắn muốn xóa ngân sách này?"
        onConfirm={confirmDeleteBudget}
        onCancel={() => setDeleteBudgetTarget(null)}
      />
    </div>
  );
}


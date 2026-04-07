import { useEffect, useState } from 'react';
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
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { CHART_COLORS } from '../constants/theme';
import { formatCurrency } from '../utils/format';

function getMonthRange(currentMonth, count = 6) {
  const [year, month] = currentMonth.split('-').map(Number);
  const base = new Date(year, month - 1, 1);
  const months = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [month] = useState(getCurrentMonth());
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: null,
    categories: null,
    cashflow: null,
    notifications: [],
    recentTransactions: [],
    monthlyTrend: []
  });

  const displayCurrency = user?.settings?.defaultCurrency || 'USD';

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const months = getMonthRange(month, 6);
        const [summary, categories, cashflow, txResult, notificationsResult] = await Promise.all([
          api.getMonthlySummary(token, month),
          api.getCategoryBreakdown(token, month),
          api.getCashflow(token, month),
          api.getTransactions(token, { month }),
          api.checkBudgetAlerts(token, month)
        ]);
        const notifications =
          notificationsResult?.data?.length > 0
            ? notificationsResult.data
            : (await api.getNotifications(token)).data || [];
        const monthlyTrend = await Promise.all(
          months.map(async (m) => {
            const r = await api.getMonthlySummary(token, m);
            return {
              month: m,
              income: r.totalIncome,
              expense: r.totalExpense
            };
          })
        );
        setData({
          summary,
          categories,
          cashflow,
          notifications,
          recentTransactions: (txResult?.data || []).slice(0, 8),
          monthlyTrend
        });
      } finally { setLoading(false); }
    })();
  }, [token, month]);

  // Do not call hooks after `if (loading) return` — that breaks the Rules of Hooks (React #310).
  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const s = data.summary;
  if (!s) {
    return (
      <EmptyState
        title="Could not load dashboard"
        subtitle="Try refreshing the page or check that the API is running."
      />
    );
  }

  const budgetLimit = user?.settings?.monthlySpendingLimit || 0;
  const budgetRatio = budgetLimit ? (s.totalExpense / budgetLimit) * 100 : 0;
  const hasAlerts = data.notifications.length > 0;
  const recentRows = data.recentTransactions;

  return (
    <div className="grid gap-16">
      <div className="grid stats-grid">
        <StatCard title="Total income" value={s.totalIncome} tone="income" currency={user?.settings?.defaultCurrency || 'USD'} />
        <StatCard title="Total expense" value={s.totalExpense} tone="expense" currency={user?.settings?.defaultCurrency || 'USD'} />
        <StatCard title="Balance" value={s.balance} tone="primary" currency={user?.settings?.defaultCurrency || 'USD'} />
        <StatCard title="Budget used" value={`${budgetRatio.toFixed(1)}%`} tone="warning" />
      </div>

      <div className="card">
        <div className="row-between">
          <h3>Budget alerts</h3>
          <span className={`alert-pill ${hasAlerts ? 'warning' : 'safe'}`}>{hasAlerts ? `${data.notifications.length} active` : 'No alerts'}</span>
        </div>
        {!hasAlerts ? (
          <EmptyState title="No budget alerts" subtitle="Your spending is still within budget threshold." />
        ) : (
          <div className="alert-list">
            {data.notifications.map((item) => (
              <div key={item.id} className={`alert-item ${item.status === 'critical' ? 'error' : 'warning'}`}>
                <strong>{item.title || 'Budget alert'}</strong>
                <p>{item.message || 'Budget usage reached warning threshold.'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid two-col">
        <ChartCard title="Income vs Expense">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.monthlyTrend.map((x) => ({ ...x, label: x.month.slice(5) }))}>
              <XAxis dataKey="label" /><YAxis /><Tooltip /><Legend />
              <Bar dataKey="income" fill="#16a34a" />
              <Bar dataKey="expense" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Expense by category">
          {(data.categories?.categories?.length || 0) === 0 ? <EmptyState title="No expense data" /> : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={data.categories.categories} dataKey="amount" nameKey="categoryName" outerRadius={100} label>
                  {data.categories.categories.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <ChartCard title="Cashflow trend">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.cashflow?.points || []}>
            <XAxis dataKey="date" /><YAxis /><Tooltip /><Legend />
            <Area type="monotone" dataKey="income" stroke="#16a34a" fill="#dcfce7" />
            <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="#fee2e2" />
            <Area type="monotone" dataKey="net" stroke="#0ea5a4" fill="#ccfbf1" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="card">
        <div className="row-between">
          <h3>Recent transactions</h3>
          <span className="muted">{recentRows.length} items</span>
        </div>
        {recentRows.length === 0 ? (
          <EmptyState title="No recent transactions" subtitle="Add transactions to see activity here." />
        ) : (
          <div className="recent-list">
            {recentRows.map((item) => (
              <div key={item.id} className="recent-item">
                <div>
                  <strong>{item.note || 'No note'}</strong>
                  <p className="muted">{item.transactionDate?.slice(0, 10)} • {item.type}</p>
                </div>
                <div className={`amount ${item.type}`}>
                  {item.type === 'expense' ? '-' : '+'}
                  {formatCurrency(item.amount, displayCurrency)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

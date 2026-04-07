import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { CHART_COLORS } from '../constants/theme';
import LoadingSpinner from '../components/LoadingSpinner';
import ChartCard from '../components/ChartCard';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import AlertBanner from '../components/AlertBanner';
import ReportMonthFilter from '../components/ReportMonthFilter';
import ReportCategoryTable from '../components/ReportCategoryTable';
import { getCurrentMonth } from '../utils/format';

export default function ReportsPage() {
  const { token, user } = useAuth();
  const [month, setMonth] = useState(getCurrentMonth());
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [cashflow, setCashflow] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        const [s, b, c] = await Promise.all([
          api.getMonthlySummary(token, month),
          api.getCategoryBreakdown(token, month),
          api.getCashflow(token, month)
        ]);
        setSummary(s);
        setBreakdown(b);
        setCashflow(c);
      } catch (err) {
        setError(err.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    })();
  }, [token, month]);

  if (loading) return <LoadingSpinner text="Loading reports..." />;
  const currency = user?.settings?.defaultCurrency || 'USD';
  const hasBreakdown = (breakdown?.categories || []).length > 0;
  const hasCashflow = (cashflow?.points || []).length > 0;

  return (
    <div className="grid gap-16">
      <AlertBanner type="error" message={error} />
      <ReportMonthFilter month={month} onChange={setMonth} />

      <div className="grid stats-grid">
        <StatCard title="Total income" value={summary?.totalIncome || 0} tone="income" currency={currency} />
        <StatCard title="Total expense" value={summary?.totalExpense || 0} tone="expense" currency={currency} />
        <StatCard title="Balance" value={summary?.balance || 0} tone="primary" currency={currency} />
        <StatCard title="Transactions" value={summary?.transactionCount || 0} tone="warning" />
      </div>

      <div className="grid two-col">
        <ChartCard title="Monthly summary">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={[{ name: month, income: summary.totalIncome, expense: summary.totalExpense, balance: summary.balance }]}>
              <XAxis dataKey="name" /><YAxis /><Tooltip />
              <Bar dataKey="income" fill="#16a34a" />
              <Bar dataKey="expense" fill="#ef4444" />
              <Bar dataKey="balance" fill="#0ea5a4" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Category breakdown">
          {!hasBreakdown ? (
            <EmptyState title="No category data" subtitle="No expense transactions for selected month." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={breakdown.categories || []} dataKey="amount" nameKey="categoryName" outerRadius={95}>
                  {(breakdown.categories || []).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
      <ChartCard title="Cashflow trend">
        {!hasCashflow ? (
          <EmptyState title="No cashflow data" subtitle="Try another month." />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={cashflow.points || []}>
              <XAxis dataKey="date" /><YAxis /><Tooltip />
              <Area type="monotone" dataKey="net" stroke="#0ea5a4" fill="#99f6e4" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <div>
        <h3>Category spending summary</h3>
        <ReportCategoryTable
          rows={breakdown?.categories || []}
          totalExpense={breakdown?.totalExpense || 0}
          currency={currency}
        />
      </div>
    </div>
  );
}

import { getCurrentMonth } from '../utils/format';

let token = 'mock-token';
let user = {
  id: '1',
  fullName: 'Demo User',
  email: 'demo@example.com',
  settings: { defaultCurrency: 'USD', monthlySpendingLimit: 1500 }
};

const categories = [
  { id: '1', name: 'Salary', type: 'income' },
  { id: '2', name: 'Food', type: 'expense' },
  { id: '3', name: 'Transport', type: 'expense' },
  { id: '4', name: 'Shopping', type: 'expense' }
];

let transactions = [
  { id: '1', type: 'income', amount: 3000, categoryId: '1', note: 'Monthly salary', transactionDate: `${getCurrentMonth()}-01T08:00:00.000Z` },
  { id: '2', type: 'expense', amount: 200, categoryId: '2', note: 'Lunch', transactionDate: `${getCurrentMonth()}-03T08:00:00.000Z` },
  { id: '3', type: 'expense', amount: 150, categoryId: '3', note: 'Taxi', transactionDate: `${getCurrentMonth()}-04T08:00:00.000Z` }
];

let budgets = [
  { id: '1', month: getCurrentMonth(), categoryId: null, limitAmount: 1500, alertThreshold: 80 }
];
let notifications = [];

const wait = () => new Promise((r) => setTimeout(r, 250));

function monthOf(iso) { return String(iso).slice(0, 7); }

export const mockApi = {
  async login(payload) { await wait(); return { token, user }; },
  async register(payload) { await wait(); user = { ...user, fullName: payload.fullName, email: payload.email }; return { token, user }; },
  async me() { await wait(); return user; },
  async getUserProfile() { await wait(); return user; },
  async updateProfile(payload) { await wait(); user = { ...user, fullName: payload.fullName }; return user; },
  async updateSettings(payload) { await wait(); user = { ...user, settings: payload }; return user; },
  async updateUserProfile(payload) { await wait(); user = { ...user, fullName: payload.fullName }; return user; },
  async updateUserSettings(payload) { await wait(); user = { ...user, settings: payload }; return user; },

  async getCategories() { await wait(); return categories; },
  async getTransactions(filters = {}) {
    await wait();
    let data = [...transactions];
    if (filters.month) data = data.filter((t) => monthOf(t.transactionDate) === filters.month);
    if (filters.type) data = data.filter((t) => t.type === filters.type);
    if (filters.categoryId) data = data.filter((t) => t.categoryId === filters.categoryId);
    const totalIncome = data.filter((x) => x.type === 'income').reduce((s, x) => s + x.amount, 0);
    const totalExpense = data.filter((x) => x.type === 'expense').reduce((s, x) => s + x.amount, 0);
    return { filters, totals: { totalIncome, totalExpense, balance: totalIncome - totalExpense }, data };
  },
  async createTransaction(payload) { await wait(); const item = { id: String(Date.now()), ...payload }; transactions.unshift(item); return item; },
  async updateTransaction(id, payload) { await wait(); transactions = transactions.map((t) => t.id === id ? { ...t, ...payload } : t); return transactions.find((t) => t.id === id); },
  async deleteTransaction(id) { await wait(); transactions = transactions.filter((t) => t.id !== id); return true; },

  async getBudgets() { await wait(); return budgets; },
  async createBudget(payload) { await wait(); const item = { id: String(Date.now()), ...payload }; budgets.push(item); return item; },
  async updateBudget(id, payload) { await wait(); budgets = budgets.map((b) => b.id === id ? { ...b, ...payload } : b); return budgets.find((b) => b.id === id); },

  async getMonthlySummary(month) {
    const tx = (await this.getTransactions({ month })).data;
    const totalIncome = tx.filter((x) => x.type === 'income').reduce((s, x) => s + x.amount, 0);
    const totalExpense = tx.filter((x) => x.type === 'expense').reduce((s, x) => s + x.amount, 0);
    return { month, totalIncome, totalExpense, balance: totalIncome - totalExpense, transactionCount: tx.length };
  },
  async getCategoryBreakdown(month) {
    const tx = (await this.getTransactions({ month })).data.filter((x) => x.type === 'expense');
    const totalExpense = tx.reduce((s, x) => s + x.amount, 0);
    const map = {};
    tx.forEach((x) => { const c = categories.find((k) => k.id === x.categoryId); const key = x.categoryId; map[key] = map[key] || { categoryId: key, categoryName: c?.name || 'Unknown', amount: 0 }; map[key].amount += x.amount; });
    const rows = Object.values(map).map((r) => ({ ...r, percentage: totalExpense ? Number(((r.amount / totalExpense) * 100).toFixed(2)) : 0 }));
    return { month, totalExpense, categories: rows };
  },
  async getCashflow(month) {
    const tx = (await this.getTransactions({ month })).data;
    const points = {};
    tx.forEach((x) => { const day = x.transactionDate.slice(0, 10); points[day] = points[day] || { date: day, income: 0, expense: 0, net: 0 }; if (x.type === 'income') points[day].income += x.amount; else points[day].expense += x.amount; points[day].net = points[day].income - points[day].expense; });
    return { month, granularity: 'daily', points: Object.values(points) };
  },
  async checkBudgetAlerts(month) {
    await wait();
    const summary = await this.getMonthlySummary(month);
    const spentRatio = budgets[0] ? (summary.totalExpense / budgets[0].limitAmount) * 100 : 0;
    if (spentRatio < 80) {
      notifications = [];
      return { month, created: 0, data: [] };
    }
    const status = spentRatio >= 100 ? 'critical' : 'warning';
    const created = [{ id: String(Date.now()), type: 'budget_alert', title: 'Budget alert', message: `Spent ${spentRatio.toFixed(2)}% of budget`, status, createdAt: new Date().toISOString() }];
    notifications = created;
    return { month, created: created.length, data: created };
  },
  async getNotifications() { await wait(); return { data: notifications }; }
};

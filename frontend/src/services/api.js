import { authApi, financeApi, reportApi } from './api/index.js';

export { authApi, financeApi, reportApi };

// Backward-compatible facade used by existing pages.
export const api = {
  login: (payload) => authApi.login(payload),
  register: (payload) => authApi.register(payload),
  getUserProfile: (token) => authApi.getMe(token),
  updateUserProfile: (token, payload) => authApi.updateMe(payload, token),
  updateUserSettings: (token, payload) => authApi.updateSettings(payload, token),
  me: (token) => authApi.getMe(token),
  updateProfile: (token, payload) => authApi.updateMe(payload, token),
  updateSettings: (token, payload) => authApi.updateSettings(payload, token),

  getTransactions: (token, filters) => financeApi.getTransactions(filters, token),
  getTransactionsSummary: (token, month) => financeApi.getTransactionsSummary(month, token),
  getTransactionsChart: (token, month) => financeApi.getTransactionsChart(month, token),
  getBudgetStatus: (token, month) => financeApi.getBudgetStatus(month, token),
  createTransaction: (token, payload) => financeApi.createTransaction(payload, token),
  updateTransaction: (token, id, payload) => financeApi.updateTransaction(id, payload, token),
  deleteTransaction: (token, id) => financeApi.deleteTransaction(id, token),
  getCategories: (token) => financeApi.getCategories(token),
  getBudgets: (token) => financeApi.getBudgets(token),
  createBudget: (token, payload) => financeApi.createBudget(payload, token),
  updateBudget: (token, id, payload) => financeApi.updateBudget(id, payload, token),
  deleteBudget: (token, id) => financeApi.deleteBudget(id, token),

  getMonthlySummary: (token, month) => reportApi.getMonthlySummary(month, token),
  getCategoryBreakdown: (token, month) => reportApi.getCategoryBreakdown(month, token),
  getCashflow: (token, month) => reportApi.getCashflow(month, token),
  getNotifications: (token) => reportApi.getNotifications(token),
  checkBudgetAlerts: (token, month) => reportApi.checkBudgetAlerts(month, token),
  getBudgetAlerts: (token, month) => reportApi.getBudgetAlerts(month, token)
};

import { mockApi } from '../mockApi';

export const mockAuthApi = {
  register: (payload) => mockApi.register(payload),
  login: (payload) => mockApi.login(payload),
  getMe: () => mockApi.getUserProfile(),
  updateMe: (payload) => mockApi.updateUserProfile(payload),
  updateSettings: (payload) => mockApi.updateUserSettings(payload)
};

export const mockFinanceApi = {
  getTransactions: (filters) => mockApi.getTransactions(filters),
  createTransaction: (payload) => mockApi.createTransaction(payload),
  updateTransaction: (id, payload) => mockApi.updateTransaction(id, payload),
  deleteTransaction: (id) => mockApi.deleteTransaction(id),
  getCategories: () => mockApi.getCategories(),
  getBudgets: () => mockApi.getBudgets(),
  createBudget: (payload) => mockApi.createBudget(payload),
  updateBudget: (id, payload) => mockApi.updateBudget(id, payload)
};

export const mockReportApi = {
  getMonthlySummary: (month) => mockApi.getMonthlySummary(month),
  getCategoryBreakdown: (month) => mockApi.getCategoryBreakdown(month),
  getCashflow: (month) => mockApi.getCashflow(month),
  getNotifications: () => mockApi.getNotifications(),
  checkBudgetAlerts: (month) => mockApi.checkBudgetAlerts(month)
};

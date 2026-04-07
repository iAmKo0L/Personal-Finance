import { request } from './client';

export const financeApi = {
  getTransactions(filters = {}, token) {
    return request('/api/finance/transactions', { params: filters, token });
  },

  createTransaction(payload, token) {
    return request('/api/finance/transactions', { method: 'POST', body: payload, token });
  },

  updateTransaction(id, payload, token) {
    return request(`/api/finance/transactions/${id}`, { method: 'PUT', body: payload, token });
  },

  deleteTransaction(id, token) {
    return request(`/api/finance/transactions/${id}`, { method: 'DELETE', token });
  },

  getCategories(token) {
    return request('/api/finance/categories', { token });
  },

  getBudgets(token) {
    return request('/api/finance/budgets', { token });
  },

  createBudget(payload, token) {
    return request('/api/finance/budgets', { method: 'POST', body: payload, token });
  },

  updateBudget(id, payload, token) {
    return request(`/api/finance/budgets/${id}`, { method: 'PUT', body: payload, token });
  }
};

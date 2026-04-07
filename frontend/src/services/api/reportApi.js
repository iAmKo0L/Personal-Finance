import { request, requestWithFallback } from './client';

export const reportApi = {
  getMonthlySummary(month, token) {
    return request('/api/reports/monthly-summary', { params: { month }, token });
  },

  getCategoryBreakdown(month, token) {
    return request('/api/reports/category-breakdown', { params: { month }, token });
  },

  getCashflow(month, token) {
    return request('/api/reports/cashflow', { params: { month }, token });
  },

  getNotifications(token) {
    return requestWithFallback(['/api/reports/notifications', '/api/reports/alerts'], { token });
  },

  checkBudgetAlerts(month, token) {
    return requestWithFallback(
      ['/api/reports/notifications/check-budget-alerts', '/api/reports/check-budget-alerts'],
      { method: 'POST', params: { month }, token }
    );
  }
};

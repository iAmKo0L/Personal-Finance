const axios = require('axios');
const config = require('../config');
const HttpError = require('../utils/http-error');

async function request(accessToken, path, params = {}) {
  try {
    const { data } = await axios.get(`${config.financeServiceUrl}${path}`, {
      params,
      timeout: config.requestTimeoutMs,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return data;
  } catch (error) {
    const details = error.response ? error.response.data : error.message;
    throw new HttpError(502, 'Failed to fetch data from transaction-budget service', details);
  }
}

async function fetchSummary(accessToken, month) {
  return request(accessToken, '/internal/summary', { month });
}

async function fetchCategoryBreakdown(accessToken, month) {
  return request(accessToken, '/internal/category-breakdown', { month });
}

async function fetchTransactions(accessToken, month) {
  return request(accessToken, '/transactions', { month });
}

async function fetchBudgetAlerts(accessToken, month) {
  return request(accessToken, '/internal/alerts', { month });
}

module.exports = {
  fetchSummary,
  fetchCategoryBreakdown,
  fetchTransactions,
  fetchBudgetAlerts
};

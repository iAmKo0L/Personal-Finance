function fetchSummary(accessToken, month) {
  return Promise.resolve({ month, totalIncome: 3000, totalExpense: 1200, balance: 1800 });
}

function fetchCategoryBreakdown(accessToken, month) {
  return Promise.resolve({
    month,
    data: [
      { categoryId: '1', categoryName: 'Food', type: 'expense', income: 0, expense: 500 },
      { categoryId: '2', categoryName: 'Transport', type: 'expense', income: 0, expense: 300 },
      { categoryId: '3', categoryName: 'Salary', type: 'income', income: 3000, expense: 0 }
    ]
  });
}

function fetchTransactions(accessToken, month) {
  return Promise.resolve({
    filters: { month },
    totals: { totalIncome: 3000, totalExpense: 1200, balance: 1800 },
    data: [
      { id: '1', transactionDate: `${month}-01T08:00:00.000Z`, type: 'income', amount: 3000, categoryId: '3' },
      { id: '2', transactionDate: `${month}-03T08:00:00.000Z`, type: 'expense', amount: 500, categoryId: '1' },
      { id: '3', transactionDate: `${month}-05T08:00:00.000Z`, type: 'expense', amount: 700, categoryId: '2' }
    ]
  });
}

function fetchBudgetAlerts(accessToken, month) {
  return Promise.resolve([
    {
      budgetId: '1',
      month,
      categoryId: '1',
      limitAmount: 600,
      alertThreshold: 80,
      spentAmount: 550,
      spentRatio: 91.67,
      status: 'near_limit'
    }
  ]);
}

module.exports = {
  fetchSummary,
  fetchCategoryBreakdown,
  fetchTransactions,
  fetchBudgetAlerts
};

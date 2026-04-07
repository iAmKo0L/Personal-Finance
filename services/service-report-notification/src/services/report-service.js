const { getFinanceClient } = require('../clients/finance-client-factory');

function buildCashflowByDay(month, transactions) {
  const grouped = {};

  transactions.forEach((item) => {
    const day = String(item.transactionDate).slice(0, 10);
    if (!grouped[day]) {
      grouped[day] = { date: day, income: 0, expense: 0, net: 0 };
    }

    if (item.type === 'income') grouped[day].income += item.amount;
    if (item.type === 'expense') grouped[day].expense += item.amount;
    grouped[day].net = grouped[day].income - grouped[day].expense;
  });

  return Object.values(grouped).sort((a, b) => (a.date < b.date ? -1 : 1));
}

async function getMonthlySummary(accessToken, month) {
  const financeClient = getFinanceClient();
  const [summary, transactions] = await Promise.all([
    financeClient.fetchSummary(accessToken, month),
    financeClient.fetchTransactions(accessToken, month)
  ]);

  return {
    month,
    totalIncome: summary.totalIncome,
    totalExpense: summary.totalExpense,
    balance: summary.balance,
    transactionCount: transactions.data.length
  };
}

async function getCategoryBreakdown(accessToken, month) {
  const financeClient = getFinanceClient();
  const breakdown = await financeClient.fetchCategoryBreakdown(accessToken, month);

  const expenseRows = breakdown.data.filter((item) => item.expense > 0);
  const totalExpense = expenseRows.reduce((sum, item) => sum + item.expense, 0);

  return {
    month,
    totalExpense,
    categories: expenseRows.map((item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      amount: item.expense,
      percentage: totalExpense > 0 ? Number(((item.expense / totalExpense) * 100).toFixed(2)) : 0
    }))
  };
}

async function getCashflow(accessToken, month) {
  const financeClient = getFinanceClient();
  const transactions = await financeClient.fetchTransactions(accessToken, month);

  return {
    month,
    granularity: 'daily',
    points: buildCashflowByDay(month, transactions.data)
  };
}

module.exports = {
  getMonthlySummary,
  getCategoryBreakdown,
  getCashflow
};

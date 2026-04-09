const transactionRepository = require('../repositories/transaction-repository');
const categoryRepository = require('../repositories/category-repository');
const budgetRepository = require('../repositories/budget-repository');
const HttpError = require('../utils/http-error');

function monthFromIso(value) {
  return String(value).slice(0, 7);
}

function dayFromIso(value) {
  return String(value).slice(0, 10);
}

function normalizeCategoryId(value) {
  if (!value) return null;
  return value;
}

async function ensureCategoryOwnedOrDefault(categoryId, userId) {
  if (!categoryId) return;
  const category = await categoryRepository.findByIdForUser(categoryId, userId);
  if (!category) throw new HttpError(400, 'Category does not exist for current user');
}

function ensureMonth(value) {
  if (!/^\d{4}-\d{2}$/.test(value)) {
    throw new HttpError(400, 'Month must match YYYY-MM format');
  }
}

function applyTransactionFilters(items, query) {
  return items.filter((item) => {
    if (query.month && monthFromIso(item.transactionDate) !== query.month) return false;
    if (query.type && item.type !== query.type) return false;
    if (query.categoryId && item.categoryId !== query.categoryId) return false;
    return true;
  });
}

function buildTotals(items) {
  const totalIncome = items.filter((i) => i.type === 'income').reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = items.filter((i) => i.type === 'expense').reduce((sum, i) => sum + i.amount, 0);
  return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
}

async function getTransactionsSummary(userId, month) {
  ensureMonth(month);
  const items = applyTransactionFilters(await transactionRepository.findByUserId(userId), { month });
  const totals = buildTotals(items);
  return {
    month,
    ...totals,
    transactionCount: items.length
  };
}

async function getTransactionsChart(userId, month) {
  ensureMonth(month);

  const breakdown = await internalCategoryBreakdown(userId, month);
  const expenseByCategory = (breakdown.data || [])
    .filter((x) => x.expense > 0)
    .map((x) => ({
      categoryId: x.categoryId,
      categoryName: x.categoryName,
      amount: x.expense
    }));

  const tx = applyTransactionFilters(await transactionRepository.findByUserId(userId), { month });
  const byDay = {};
  tx.forEach((t) => {
    const d = dayFromIso(t.transactionDate);
    if (!byDay[d]) byDay[d] = { date: d, income: 0, expense: 0, net: 0 };
    if (t.type === 'income') byDay[d].income += t.amount;
    if (t.type === 'expense') byDay[d].expense += t.amount;
    byDay[d].net = byDay[d].income - byDay[d].expense;
  });

  const incomeVsExpenseByDay = Object.values(byDay).sort((a, b) => (a.date < b.date ? -1 : 1));
  const summary = await getTransactionsSummary(userId, month);

  return {
    month,
    summary,
    expenseByCategory,
    incomeVsExpenseByDay
  };
}

async function getBudgetStatus(userId, month) {
  ensureMonth(month);
  const monthBudgets = await budgetRepository.findCurrentByMonth(userId, month);

  const totalBudgetRow = monthBudgets.find((b) => !b.categoryId);
  const monthlyBudget = totalBudgetRow
    ? totalBudgetRow.limitAmount
    : monthBudgets.reduce((sum, b) => sum + (b.limitAmount || 0), 0);

  const monthTx = applyTransactionFilters(await transactionRepository.findByUserId(userId), { month });
  const spentAmount = monthTx.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const usagePercent = monthlyBudget > 0 ? Number(((spentAmount / monthlyBudget) * 100).toFixed(2)) : 0;
  const remainingAmount = Number((monthlyBudget - spentAmount).toFixed(2));

  return {
    month,
    monthlyBudget,
    spentAmount,
    usagePercent,
    remainingAmount
  };
}

function buildBudgetAlerts(budgetStatus) {
  if (!budgetStatus || !budgetStatus.monthlyBudget) {
    return [{ type: 'info', message: 'Bạn chưa đặt ngân sách tháng này.' }];
  }
  if (budgetStatus.usagePercent >= 100) {
    return [{ type: 'critical', message: `Bạn đã vượt ngân sách tháng này (${budgetStatus.usagePercent}%).` }];
  }
  if (budgetStatus.usagePercent >= 80) {
    return [{ type: 'warning', message: `Bạn đã dùng ${budgetStatus.usagePercent}% ngân sách tháng này.` }];
  }
  return [{ type: 'safe', message: 'Ngân sách đang trong mức an toàn.' }];
}

async function listTransactions(userId, query) {
  const items = await transactionRepository.findByUserId(userId);
  const filtered = applyTransactionFilters(items, query);
  return {
    filters: query,
    totals: buildTotals(filtered),
    data: filtered
  };
}

async function getTransactionById(userId, id) {
  const transaction = await transactionRepository.findByIdAndUserId(id, userId);
  if (!transaction) throw new HttpError(404, 'Transaction not found');
  return transaction;
}

async function createTransaction(userId, payload) {
  await ensureCategoryOwnedOrDefault(payload.categoryId, userId);
  return transactionRepository.create({ ...payload, userId });
}

async function createTransactionWithImpact(userId, payload) {
  const transaction = await createTransaction(userId, payload);
  const month = monthFromIso(transaction.transactionDate);
  const summary = await getTransactionsSummary(userId, month);
  const budgetStatus = await getBudgetStatus(userId, month);
  const alerts = buildBudgetAlerts(budgetStatus);

  return {
    message: 'Transaction created successfully',
    transaction,
    summary,
    budgetStatus,
    alerts
  };
}

async function updateTransaction(userId, id, payload) {
  await ensureCategoryOwnedOrDefault(payload.categoryId, userId);
  const updated = await transactionRepository.updateByIdAndUserId(id, userId, payload);
  if (!updated) throw new HttpError(404, 'Transaction not found');
  return updated;
}

async function deleteTransaction(userId, id) {
  const deleted = await transactionRepository.deleteByIdAndUserId(id, userId);
  if (!deleted) throw new HttpError(404, 'Transaction not found');
}

async function listCategories(userId) {
  return categoryRepository.findVisibleByUserId(userId);
}

async function createCategory(userId, payload) {
  if (await categoryRepository.existsByNameAndTypeForUser(payload.name, payload.type, userId)) {
    throw new HttpError(400, 'Category already exists');
  }
  return categoryRepository.create({ ...payload, userId, systemDefault: false });
}

async function createBudget(userId, payload) {
  ensureMonth(payload.month);
  const normalizedCategoryId = normalizeCategoryId(payload.categoryId);
  await ensureCategoryOwnedOrDefault(normalizedCategoryId, userId);

  return budgetRepository.create({
    ...payload,
    categoryId: normalizedCategoryId,
    userId
  });
}

async function listBudgets(userId) {
  return budgetRepository.findByUserId(userId);
}

async function getCurrentBudgets(userId, month) {
  ensureMonth(month);
  return budgetRepository.findCurrentByMonth(userId, month);
}

async function updateBudget(userId, id, payload) {
  ensureMonth(payload.month);
  const normalizedCategoryId = normalizeCategoryId(payload.categoryId);
  await ensureCategoryOwnedOrDefault(normalizedCategoryId, userId);

  const updated = await budgetRepository.updateByIdAndUserId(id, userId, {
    ...payload,
    categoryId: normalizedCategoryId
  });
  if (!updated) throw new HttpError(404, 'Budget not found');
  return updated;
}

async function deleteBudget(userId, id) {
  const deleted = await budgetRepository.deleteByIdAndUserId(id, userId);
  if (!deleted) throw new HttpError(404, 'Budget not found');
}

async function internalSummary(userId, month) {
  ensureMonth(month);
  const items = applyTransactionFilters(await transactionRepository.findByUserId(userId), { month });
  return {
    month,
    ...buildTotals(items)
  };
}

async function internalCategoryBreakdown(userId, month) {
  ensureMonth(month);
  const visibleCategories = await categoryRepository.findVisibleByUserId(userId);
  const categoryMap = visibleCategories.reduce((map, category) => {
    map[category.id] = category;
    return map;
  }, {});

  const items = applyTransactionFilters(await transactionRepository.findByUserId(userId), { month });
  const result = {};

  items.forEach((item) => {
    const category = categoryMap[item.categoryId];
    const key = item.categoryId;
    if (!result[key]) {
      result[key] = {
        categoryId: item.categoryId,
        categoryName: category ? category.name : 'Unknown',
        type: category ? category.type : item.type,
        income: 0,
        expense: 0
      };
    }

    if (item.type === 'income') result[key].income += item.amount;
    if (item.type === 'expense') result[key].expense += item.amount;
  });

  return {
    month,
    data: Object.values(result)
  };
}

async function internalMonthlyAnalytics(userId, month) {
  return {
    month,
    summary: await internalSummary(userId, month),
    categories: (await internalCategoryBreakdown(userId, month)).data
  };
}

async function internalAlerts(userId, month) {
  ensureMonth(month);
  const monthBudgets = await budgetRepository.findCurrentByMonth(userId, month);
  const allTx = await transactionRepository.findByUserId(userId);
  const monthTransactions = applyTransactionFilters(allTx, { month });

  return monthBudgets.map((budget) => {
    const spentAmount = monthTransactions
      .filter((item) => item.type === 'expense')
      .filter((item) => !budget.categoryId || item.categoryId === budget.categoryId)
      .reduce((sum, item) => sum + item.amount, 0);

    const spentRatio = budget.limitAmount ? (spentAmount / budget.limitAmount) * 100 : 0;
    const status =
      spentRatio >= 100 ? 'exceeded' : spentRatio >= budget.alertThreshold ? 'near_limit' : 'safe';

    return {
      budgetId: budget.id,
      month: budget.month,
      categoryId: budget.categoryId,
      limitAmount: budget.limitAmount,
      alertThreshold: budget.alertThreshold,
      spentAmount,
      spentRatio: Number(spentRatio.toFixed(2)),
      status
    };
  });
}

module.exports = {
  listTransactions,
  getTransactionsSummary,
  getTransactionsChart,
  getBudgetStatus,
  getTransactionById,
  createTransaction,
  createTransactionWithImpact,
  updateTransaction,
  deleteTransaction,
  listCategories,
  createCategory,
  createBudget,
  listBudgets,
  getCurrentBudgets,
  updateBudget,
  deleteBudget,
  internalSummary,
  internalCategoryBreakdown,
  internalMonthlyAnalytics,
  internalAlerts
};

const financeService = require('../services/finance-service');
const {
  transactionSchema,
  categorySchema,
  budgetSchema,
  listTransactionsQuerySchema,
  monthQuerySchema
} = require('../validations/finance-validation');

function validate(schema, payload) {
  const { error, value } = schema.validate(payload, { abortEarly: false });
  if (error) {
    error.status = 400;
    error.details = error.details.map((detail) => detail.message);
    throw error;
  }
  return value;
}

async function listTransactions(req, res, next) {
  try {
    const query = validate(listTransactionsQuerySchema, req.query);
    const result = await financeService.listTransactions(req.user.sub, query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getTransaction(req, res, next) {
  try {
    const result = await financeService.getTransactionById(req.user.sub, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function createTransaction(req, res, next) {
  try {
    const payload = validate(transactionSchema, req.body);
    const result = await financeService.createTransaction(req.user.sub, payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function updateTransaction(req, res, next) {
  try {
    const payload = validate(transactionSchema, req.body);
    const result = await financeService.updateTransaction(req.user.sub, req.params.id, payload);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function removeTransaction(req, res, next) {
  try {
    await financeService.deleteTransaction(req.user.sub, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function listCategories(req, res, next) {
  try {
    const result = await financeService.listCategories(req.user.sub);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const payload = validate(categorySchema, req.body);
    const result = await financeService.createCategory(req.user.sub, payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function listBudgets(req, res, next) {
  try {
    const result = await financeService.listBudgets(req.user.sub);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function createBudget(req, res, next) {
  try {
    const payload = validate(budgetSchema, req.body);
    const result = await financeService.createBudget(req.user.sub, payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function getCurrentBudgets(req, res, next) {
  try {
    const query = validate(monthQuerySchema, req.query);
    const result = await financeService.getCurrentBudgets(req.user.sub, query.month);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function updateBudget(req, res, next) {
  try {
    const payload = validate(budgetSchema, req.body);
    const result = await financeService.updateBudget(req.user.sub, req.params.id, payload);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function internalSummary(req, res, next) {
  try {
    const query = validate(monthQuerySchema, req.query);
    const result = await financeService.internalSummary(req.user.sub, query.month);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function internalCategoryBreakdown(req, res, next) {
  try {
    const query = validate(monthQuerySchema, req.query);
    const result = await financeService.internalCategoryBreakdown(req.user.sub, query.month);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function internalMonthlyAnalytics(req, res, next) {
  try {
    const query = validate(monthQuerySchema, req.query);
    const result = await financeService.internalMonthlyAnalytics(req.user.sub, query.month);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function internalAlerts(req, res, next) {
  try {
    const query = validate(monthQuerySchema, req.query);
    const result = await financeService.internalAlerts(req.user.sub, query.month);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  removeTransaction,
  listCategories,
  createCategory,
  listBudgets,
  createBudget,
  getCurrentBudgets,
  updateBudget,
  internalSummary,
  internalCategoryBreakdown,
  internalMonthlyAnalytics,
  internalAlerts
};

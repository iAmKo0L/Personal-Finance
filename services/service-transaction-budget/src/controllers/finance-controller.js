const financeService = require('../services/finance-service');
const {
  transactionSchema,
  categorySchema,
  budgetSchema,
  listTransactionsQuerySchema,
  monthQuerySchema
} = require('../validations/finance-validation');

function validate(schema, payload) {
  const { error, value } = schema.validate(payload, {
    abortEarly: false,
    convert: true,
    stripUnknown: true
  });
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

async function transactionsSummary(req, res, next) {
  try {
    const query = validate(monthQuerySchema, req.query);
    const result = await financeService.getTransactionsSummary(req.user.sub, query.month);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function transactionsChart(req, res, next) {
  try {
    const query = validate(monthQuerySchema, req.query);
    const result = await financeService.getTransactionsChart(req.user.sub, query.month);
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
    // For smooth demo: return transaction + summary + budget status + alerts in one response.
    const result = await financeService.createTransactionWithImpact(req.user.sub, payload);
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
    // Refactored for use-case: return a single budget status object for the month.
    const result = await financeService.getBudgetStatus(req.user.sub, query.month);
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

async function removeBudget(req, res, next) {
  try {
    await financeService.deleteBudget(req.user.sub, req.params.id);
    res.status(204).send();
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
  transactionsSummary,
  transactionsChart,
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
  removeBudget,
  internalSummary,
  internalCategoryBreakdown,
  internalMonthlyAnalytics,
  internalAlerts
};

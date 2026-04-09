const { monthQuerySchema } = require('../validators/report-validation');
const reportService = require('../services/report-service');
const notificationService = require('../services/notification-service');

function defaultMonth() {
  return new Date().toISOString().slice(0, 7);
}

function validateMonth(query, required = false) {
  const month = query.month || (required ? null : defaultMonth());
  const { error, value } = monthQuerySchema.validate({ month });
  if (error) {
    error.status = 400;
    error.details = error.details.map((detail) => detail.message);
    throw error;
  }
  return value.month;
}

async function monthlySummary(req, res, next) {
  try {
    const month = validateMonth(req.query);
    const result = await reportService.getMonthlySummary(req.accessToken, month);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function categoryBreakdown(req, res, next) {
  try {
    const month = validateMonth(req.query);
    const result = await reportService.getCategoryBreakdown(req.accessToken, month);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function cashflow(req, res, next) {
  try {
    const month = validateMonth(req.query);
    const result = await reportService.getCashflow(req.accessToken, month);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function budgetAlerts(req, res, next) {
  try {
    const month = validateMonth(req.query);
    const result = await reportService.getBudgetAlerts(req.accessToken, month);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function notifications(req, res, next) {
  try {
    const result = await notificationService.listNotifications(req.user.sub);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
}

async function checkBudgetAlerts(req, res, next) {
  try {
    const month = validateMonth(req.query);
    const result = await notificationService.checkBudgetAlerts(req.user.sub, req.accessToken, month);
    res.json({ month, created: result.length, data: result });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  monthlySummary,
  categoryBreakdown,
  cashflow,
  notifications,
  checkBudgetAlerts,
  budgetAlerts
};

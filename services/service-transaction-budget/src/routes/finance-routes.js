const express = require('express');
const controller = require('../controllers/finance-controller');
const { requireAuth } = require('../middleware/auth-middleware');

const router = express.Router();

router.use(requireAuth);

// Core use-case endpoints
router.post('/transactions', controller.createTransaction);
router.get('/transactions', controller.listTransactions);
router.get('/transactions/summary', controller.transactionsSummary);
router.get('/transactions/chart', controller.transactionsChart);
router.get('/transactions/:id', controller.getTransaction);
router.put('/transactions/:id', controller.updateTransaction);
router.delete('/transactions/:id', controller.removeTransaction);

router.get('/categories', controller.listCategories);
router.post('/categories', controller.createCategory);

router.post('/budgets', controller.createBudget);
router.get('/budgets', controller.listBudgets);
router.get('/budgets/current', controller.getCurrentBudgets);
router.put('/budgets/:id', controller.updateBudget);
router.delete('/budgets/:id', controller.removeBudget);

// Internal endpoints for report service.
router.get('/internal/summary', controller.internalSummary);
router.get('/internal/category-breakdown', controller.internalCategoryBreakdown);
router.get('/internal/analytics/monthly', controller.internalMonthlyAnalytics);
router.get('/internal/alerts', controller.internalAlerts);

module.exports = router;

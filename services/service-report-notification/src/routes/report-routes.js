const express = require('express');
const controller = require('../controllers/report-controller');
const { requireAuth } = require('../middleware/auth-middleware');

const router = express.Router();

router.use(requireAuth);

router.get('/reports/monthly-summary', controller.monthlySummary);
router.get('/reports/category-breakdown', controller.categoryBreakdown);
router.get('/reports/cashflow', controller.cashflow);
router.get('/notifications', controller.notifications);
router.post('/notifications/check-budget-alerts', controller.checkBudgetAlerts);

// Backward-compatible routes for gateway prefix /api/reports/*
router.get('/monthly-summary', controller.monthlySummary);
router.get('/category-breakdown', controller.categoryBreakdown);
router.get('/cashflow', controller.cashflow);
router.get('/alerts', controller.notifications);
router.post('/check-budget-alerts', controller.checkBudgetAlerts);

module.exports = router;

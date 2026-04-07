const express = require('express');
const reportRoutes = require('./report-routes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Assignment contract routes.
router.use('/', reportRoutes);

// Backward-compatible alias for current gateway mapping.
router.use('/api/reports', reportRoutes);

module.exports = router;

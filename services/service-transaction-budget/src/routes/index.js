const express = require('express');
const financeRoutes = require('./finance-routes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Assignment contract routes.
router.use('/', financeRoutes);

// Backward-compatible alias for gateway mapping.
router.use('/api/finance', financeRoutes);

module.exports = router;

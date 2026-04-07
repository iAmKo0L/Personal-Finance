const express = require('express');
const authRoutes = require('./auth-routes');
const userRoutes = require('./user-routes');
const authController = require('../controllers/auth-controller');
const { requireAuth } = require('../middleware/auth-middleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Alias for frontend fallback path PUT /api/auth/settings (same as /api/auth/users/settings).
router.put('/api/auth/settings', requireAuth, authController.updateSettings);

// Main contract endpoints requested by assignment.
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Backward-compatible aliases for existing gateway mapping.
// Mount /api/auth/users before /api/auth so paths like /api/auth/users/me resolve.
router.use('/api/auth/users', userRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);

module.exports = router;

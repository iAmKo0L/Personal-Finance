const express = require('express');
const controller = require('../controllers/auth-controller');
const { requireAuth } = require('../middleware/auth-middleware');

const router = express.Router();

// Protect all /users endpoints with Bearer JWT.
router.use(requireAuth);
router.get('/me', controller.me);
router.put('/me', controller.updateMe);
router.put('/settings', controller.updateSettings);

module.exports = router;

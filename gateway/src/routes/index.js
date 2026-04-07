const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');

const router = express.Router();

// Root: gateway only proxies /api/* — avoid confusing 404 when opening http://localhost:8080/ in a browser.
router.get('/', (req, res) => {
  res.json({
    name: 'Personal Finance API Gateway',
    status: 'ok',
    health: '/health',
    api: {
      auth: '/api/auth',
      users: '/api/users',
      finance: '/api/finance',
      reports: '/api/reports'
    },
    hint: 'This is the REST API. Open the web app on port 3000 (e.g. http://localhost:3000), not here.'
  });
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

function buildProxy(target) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    xfwd: true,
    proxyTimeout: config.proxyTimeoutMs,
    timeout: config.proxyTimeoutMs,
    // Express strips the mount path (/api/auth) from req.url, so the proxy would forward
    // POST /register instead of POST /api/auth/register — upstream returns 404.
    pathRewrite: (path, req) => {
      const full = req.originalUrl || path;
      return full;
    },
    onError(err, req, res) {
      res.status(502).json({
        message: 'Bad gateway',
        details: `Upstream request failed: ${err.message}`
      });
    }
  });
}

router.use('/api/auth', buildProxy(config.services.authUser));
router.use('/api/users', buildProxy(config.services.authUser));
router.use('/api/finance', buildProxy(config.services.transactionBudget));
router.use('/api/reports', buildProxy(config.services.reportNotification));

module.exports = router;


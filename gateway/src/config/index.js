const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  port: Number(process.env.PORT || 8000),
  proxyTimeoutMs: Number(process.env.PROXY_TIMEOUT_MS || 8000),
  services: {
    authUser: process.env.AUTH_USER_SERVICE_URL || 'http://service-auth-user:5000',
    transactionBudget:
      process.env.TRANSACTION_BUDGET_SERVICE_URL || 'http://service-transaction-budget:5000',
    reportNotification:
      process.env.REPORT_NOTIFICATION_SERVICE_URL || 'http://service-report-notification:5000'
  }
};


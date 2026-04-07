const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  port: Number(process.env.PORT || 5000),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  financeServiceUrl: process.env.TRANSACTION_BUDGET_SERVICE_URL || 'http://service-transaction-budget:5000',
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS || 5000),
  useMockClient: (process.env.USE_MOCK_ADAPTER || 'false').toLowerCase() === 'true',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'finance_user',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'report_db'
  }
};

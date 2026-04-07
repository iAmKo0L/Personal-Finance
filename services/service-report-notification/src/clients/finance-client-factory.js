const config = require('../config');
const httpClient = require('./finance-client');
const mockClient = require('./mock-finance-client');

function getFinanceClient() {
  return config.useMockClient ? mockClient : httpClient;
}

module.exports = {
  getFinanceClient
};

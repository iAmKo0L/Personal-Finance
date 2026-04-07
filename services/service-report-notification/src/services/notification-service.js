const { getFinanceClient } = require('../clients/finance-client-factory');
const notificationRepository = require('../repositories/notification-repository');

function buildBudgetAlertNotification(alert) {
  const isExceeded = alert.status === 'exceeded';
  const title = isExceeded ? 'Budget exceeded' : 'Budget alert';
  const message = isExceeded
    ? `Your spending reached ${alert.spentRatio}% of budget ${alert.limitAmount}.`
    : `Your spending reached ${alert.spentRatio}% (threshold ${alert.alertThreshold}%).`;

  return {
    type: 'budget_alert',
    title,
    message,
    status: isExceeded ? 'critical' : 'warning',
    metadata: alert
  };
}

async function checkBudgetAlerts(userId, accessToken, month) {
  const financeClient = getFinanceClient();
  const alerts = await financeClient.fetchBudgetAlerts(accessToken, month);

  const payloads = alerts
    .filter((item) => item.status === 'near_limit' || item.status === 'exceeded')
    .map((item) => buildBudgetAlertNotification(item));

  const notifications = await notificationRepository.replaceForUser(userId, payloads);
  return notifications;
}

async function listNotifications(userId) {
  return notificationRepository.listByUser(userId);
}

module.exports = {
  checkBudgetAlerts,
  listNotifications
};

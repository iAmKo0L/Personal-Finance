function createUserSettingsEntity({ userId, defaultCurrency = 'USD', monthlySpendingLimit = 0 }) {
  return {
    userId,
    defaultCurrency,
    monthlySpendingLimit
  };
}

module.exports = {
  createUserSettingsEntity
};

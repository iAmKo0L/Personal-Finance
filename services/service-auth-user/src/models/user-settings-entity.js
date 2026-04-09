function createUserSettingsEntity({ userId, defaultCurrency = 'VND' }) {
  return {
    userId,
    defaultCurrency
  };
}

module.exports = {
  createUserSettingsEntity
};

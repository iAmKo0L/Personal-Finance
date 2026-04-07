function createBudgetEntity(payload, id) {
  const now = new Date().toISOString();
  return {
    id,
    userId: payload.userId,
    month: payload.month,
    categoryId: payload.categoryId || null,
    limitAmount: payload.limitAmount,
    alertThreshold: payload.alertThreshold,
    createdAt: now,
    updatedAt: now
  };
}

module.exports = { createBudgetEntity };

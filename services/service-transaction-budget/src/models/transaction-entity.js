function createTransactionEntity(payload, id) {
  const now = new Date().toISOString();
  return {
    id,
    userId: payload.userId,
    type: payload.type,
    amount: payload.amount,
    categoryId: payload.categoryId,
    note: payload.note || '',
    transactionDate: payload.transactionDate,
    createdAt: now,
    updatedAt: now
  };
}

module.exports = { createTransactionEntity };

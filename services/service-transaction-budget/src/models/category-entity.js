function createCategoryEntity(payload, id) {
  return {
    id,
    userId: payload.userId || null,
    systemDefault: Boolean(payload.systemDefault),
    name: payload.name,
    type: payload.type
  };
}

module.exports = { createCategoryEntity };

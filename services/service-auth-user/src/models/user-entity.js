function createUserEntity({ id, fullName, email, passwordHash }) {
  const now = new Date().toISOString();
  return {
    id,
    fullName,
    email,
    passwordHash,
    createdAt: now,
    updatedAt: now
  };
}

module.exports = {
  createUserEntity
};

const pool = require('../db/pool');

function toIso(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

function mapBudget(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    userId: String(row.user_id),
    month: row.month,
    categoryId: row.category_id != null ? String(row.category_id) : null,
    limitAmount: Number(row.limit_amount),
    alertThreshold: Number(row.alert_threshold),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at)
  };
}

async function create(payload) {
  const [result] = await pool.query(
    `INSERT INTO budgets (user_id, month, category_id, limit_amount, alert_threshold)
     VALUES (?, ?, ?, ?, ?)`,
    [
      Number(payload.userId),
      payload.month,
      payload.categoryId ? Number(payload.categoryId) : null,
      payload.limitAmount,
      payload.alertThreshold
    ]
  );
  return findByIdAndUserId(String(result.insertId), String(payload.userId));
}

async function findByUserId(userId) {
  const [rows] = await pool.query(
    'SELECT * FROM budgets WHERE user_id = ? ORDER BY month DESC, id DESC',
    [Number(userId)]
  );
  return rows.map(mapBudget);
}

async function findByIdAndUserId(id, userId) {
  const [rows] = await pool.query(
    'SELECT * FROM budgets WHERE id = ? AND user_id = ? LIMIT 1',
    [id, Number(userId)]
  );
  return mapBudget(rows[0]);
}

async function findCurrentByMonth(userId, month) {
  const [rows] = await pool.query(
    'SELECT * FROM budgets WHERE user_id = ? AND month = ? ORDER BY id ASC',
    [Number(userId), month]
  );
  return rows.map(mapBudget);
}

async function updateByIdAndUserId(id, userId, updates) {
  const existing = await findByIdAndUserId(id, userId);
  if (!existing) return null;

  await pool.query(
    `UPDATE budgets SET
       month = ?,
       category_id = ?,
       limit_amount = ?,
       alert_threshold = ?,
       updated_at = CURRENT_TIMESTAMP(3)
     WHERE id = ? AND user_id = ?`,
    [
      updates.month,
      updates.categoryId ? Number(updates.categoryId) : null,
      updates.limitAmount,
      updates.alertThreshold,
      id,
      Number(userId)
    ]
  );

  return findByIdAndUserId(id, userId);
}

module.exports = {
  create,
  findByUserId,
  findByIdAndUserId,
  findCurrentByMonth,
  updateByIdAndUserId
};

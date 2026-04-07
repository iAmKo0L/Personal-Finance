const pool = require('../db/pool');

/** Joi may coerce transactionDate to a Date; String(date).slice(0,10) is NOT YYYY-MM-DD. */
function toSqlDate(value) {
  if (!value && value !== 0) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function toIso(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

function mapTransaction(row) {
  if (!row) return null;
  const dateStr =
    row.transaction_date instanceof Date
      ? row.transaction_date.toISOString().slice(0, 10)
      : String(row.transaction_date).slice(0, 10);
  return {
    id: String(row.id),
    userId: String(row.user_id),
    type: row.type,
    amount: Number(row.amount),
    categoryId: row.category_id != null ? String(row.category_id) : null,
    note: row.note || '',
    transactionDate: dateStr,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at)
  };
}

async function create(payload) {
  const userId = Number(payload.userId);
  const [result] = await pool.query(
    `INSERT INTO transactions (user_id, type, amount, category_id, note, transaction_date)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      userId,
      payload.type,
      payload.amount,
      payload.categoryId ? Number(payload.categoryId) : null,
      payload.note || '',
      toSqlDate(payload.transactionDate)
    ]
  );
  return findByIdAndUserId(String(result.insertId), String(userId));
}

async function findByUserId(userId) {
  const [rows] = await pool.query(
    `SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC, id DESC`,
    [Number(userId)]
  );
  return rows.map(mapTransaction);
}

async function findByIdAndUserId(id, userId) {
  const [rows] = await pool.query(
    'SELECT * FROM transactions WHERE id = ? AND user_id = ? LIMIT 1',
    [id, Number(userId)]
  );
  return mapTransaction(rows[0]);
}

async function updateByIdAndUserId(id, userId, updates) {
  const existing = await findByIdAndUserId(id, userId);
  if (!existing) return null;

  await pool.query(
    `UPDATE transactions SET
       type = ?,
       amount = ?,
       category_id = ?,
       note = ?,
       transaction_date = ?,
       updated_at = CURRENT_TIMESTAMP(3)
     WHERE id = ? AND user_id = ?`,
    [
      updates.type,
      updates.amount,
      updates.categoryId ? Number(updates.categoryId) : null,
      updates.note || '',
      toSqlDate(updates.transactionDate),
      id,
      Number(userId)
    ]
  );

  return findByIdAndUserId(id, userId);
}

async function deleteByIdAndUserId(id, userId) {
  const [result] = await pool.query('DELETE FROM transactions WHERE id = ? AND user_id = ?', [
    id,
    Number(userId)
  ]);
  return result.affectedRows > 0;
}

module.exports = {
  create,
  findByUserId,
  findByIdAndUserId,
  updateByIdAndUserId,
  deleteByIdAndUserId
};

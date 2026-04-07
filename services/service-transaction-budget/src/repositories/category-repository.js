const pool = require('../db/pool');

function mapCategory(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    userId: row.user_id != null ? String(row.user_id) : null,
    systemDefault: Boolean(row.system_default),
    name: row.name,
    type: row.type
  };
}

async function create(payload) {
  const [result] = await pool.query(
    `INSERT INTO categories (user_id, system_default, name, type)
     VALUES (?, ?, ?, ?)`,
    [payload.userId || null, payload.systemDefault ? 1 : 0, payload.name, payload.type]
  );
  const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
  return mapCategory(rows[0]);
}

async function findVisibleByUserId(userId) {
  const numericUserId = Number(userId);
  const [rows] = await pool.query(
    `SELECT * FROM categories
     WHERE system_default = 1 OR user_id = ?
     ORDER BY system_default DESC, name ASC`,
    [numericUserId]
  );
  return rows.map(mapCategory);
}

async function findByIdForUser(id, userId) {
  const numericUserId = Number(userId);
  const [rows] = await pool.query(
    `SELECT * FROM categories
     WHERE id = ? AND (system_default = 1 OR user_id = ?)
     LIMIT 1`,
    [id, numericUserId]
  );
  return mapCategory(rows[0]);
}

async function existsByNameAndTypeForUser(name, type, userId) {
  const numericUserId = Number(userId);
  const [rows] = await pool.query(
    `SELECT id FROM categories
     WHERE LOWER(name) = LOWER(?) AND type = ? AND (system_default = 1 OR user_id = ?)
     LIMIT 1`,
    [name, type, numericUserId]
  );
  return rows.length > 0;
}

async function seedDefaults() {
  const [[{ cnt }]] = await pool.query(
    'SELECT COUNT(*) AS cnt FROM categories WHERE system_default = 1'
  );
  if (cnt > 0) return;

  const defaults = [
    { name: 'Salary', type: 'income' },
    { name: 'Bonus', type: 'income' },
    { name: 'Food', type: 'expense' },
    { name: 'Transport', type: 'expense' },
    { name: 'Shopping', type: 'expense' }
  ];

  for (const item of defaults) {
    await pool.query(
      `INSERT INTO categories (user_id, system_default, name, type) VALUES (NULL, 1, ?, ?)`,
      [item.name, item.type]
    );
  }
}

module.exports = {
  create,
  findVisibleByUserId,
  findByIdForUser,
  existsByNameAndTypeForUser,
  seedDefaults
};

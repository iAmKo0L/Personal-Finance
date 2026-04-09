const pool = require('../db/pool');

function toIso(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

function mapUser(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    fullName: row.full_name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at)
  };
}

function mapSettings(row) {
  if (!row) return null;
  return {
    userId: String(row.user_id),
    defaultCurrency: row.default_currency
  };
}

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return mapUser(rows[0]);
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return mapUser(rows[0]);
}

async function findSettingsByUserId(userId) {
  const [rows] = await pool.query('SELECT * FROM user_settings WHERE user_id = ? LIMIT 1', [userId]);
  return mapSettings(rows[0]);
}

async function createUser(payload) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
      [payload.fullName, payload.email, payload.passwordHash]
    );
    const userId = result.insertId;
    await conn.query('INSERT INTO user_settings (user_id) VALUES (?)', [userId]);
    await conn.commit();

    const user = await findById(userId);
    const settings = await findSettingsByUserId(userId);
    return { user, settings };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function updateUser(id, updates) {
  await pool.query('UPDATE users SET full_name = ?, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?', [
    updates.fullName,
    id
  ]);
  return findById(id);
}

async function upsertSettings(userId, updates) {
  const currency = updates.defaultCurrency ?? 'VND';

  await pool.query(
    `INSERT INTO user_settings (user_id, default_currency)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE
      default_currency = VALUES(default_currency)`,
    [userId, currency]
  );

  return findSettingsByUserId(userId);
}

module.exports = {
  findByEmail,
  findById,
  findSettingsByUserId,
  createUser,
  updateUser,
  upsertSettings
};

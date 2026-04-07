const pool = require('../db/pool');

const MAX_TITLE = 255;
const MAX_MESSAGE = 1000;

function trunc(str, max) {
  if (str == null) return '';
  return String(str).slice(0, max);
}

/** Clone for storage: drop NaN/Infinity/BigInt. */
function sanitizeMetadata(value) {
  if (value == null) return null;
  try {
    return JSON.parse(
      JSON.stringify(value, (k, v) => {
        if (typeof v === 'bigint') return String(v);
        if (typeof v === 'number' && !Number.isFinite(v)) return null;
        return v;
      })
    );
  } catch {
    return { error: 'metadata_unserializable' };
  }
}

/** Store as TEXT (avoids MySQL JSON column quirks with drivers). */
function metadataToDb(value) {
  const obj = sanitizeMetadata(value);
  if (obj == null) return null;
  return JSON.stringify(obj);
}

function parseMetadataFromDb(raw) {
  if (raw == null || raw === '') return null;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function toIso(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

function mapRow(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    userId: String(row.user_id),
    type: row.type,
    title: row.title,
    message: row.message,
    status: row.status,
    metadata: parseMetadataFromDb(row.metadata),
    createdAt: toIso(row.created_at)
  };
}

async function listByUser(userId) {
  const [rows] = await pool.query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC, id DESC',
    [Number(userId)]
  );
  return rows.map(mapRow);
}

async function replaceForUser(userId, items) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM notifications WHERE user_id = ?', [Number(userId)]);
    const created = [];
    for (const item of items) {
      const [result] = await conn.query(
        `INSERT INTO notifications (user_id, type, title, message, status, metadata)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          Number(userId),
          item.type,
          trunc(item.title, MAX_TITLE),
          trunc(item.message, MAX_MESSAGE),
          item.status,
          metadataToDb(item.metadata)
        ]
      );
      const [rows] = await conn.query('SELECT * FROM notifications WHERE id = ?', [result.insertId]);
      created.push(mapRow(rows[0]));
    }
    await conn.commit();
    return created;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  listByUser,
  replaceForUser
};

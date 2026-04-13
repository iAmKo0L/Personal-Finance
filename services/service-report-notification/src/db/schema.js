const pool = require('./pool');

async function ensureSchema() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        type VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message VARCHAR(1000) NOT NULL,
        status VARCHAR(32) NOT NULL,
        metadata TEXT NULL,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        KEY idx_notifications_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    try {
      await conn.query(
        'ALTER TABLE notifications MODIFY COLUMN metadata TEXT NULL'
      );
    } catch (e) {
      console.warn('[report-db] notifications.metadata migration:', e.message);
    }
  } finally {
    conn.release();
  }
}

module.exports = { ensureSchema };

const pool = require('./pool');

async function ensureSchema() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY users_email_unique (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        user_id BIGINT UNSIGNED NOT NULL,
        default_currency VARCHAR(10) NOT NULL DEFAULT 'VND',
        PRIMARY KEY (user_id),
        CONSTRAINT fk_user_settings_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await conn.query(
      'ALTER TABLE user_settings ALTER COLUMN default_currency SET DEFAULT \'VND\''
    );
    const [columnRows] = await conn.query(
      `SELECT 1
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'user_settings'
         AND COLUMN_NAME = 'monthly_spending_limit'
       LIMIT 1`
    );
    if (columnRows.length > 0) {
      await conn.query('ALTER TABLE user_settings DROP COLUMN monthly_spending_limit');
    }
  } finally {
    conn.release();
  }
}

module.exports = { ensureSchema };

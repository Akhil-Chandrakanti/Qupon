// One-time helper: (re)creates a working admin account.
// Run this from inside the server/ folder, after `npm install`:
//
//   node reset-admin.js
//
// It will create admin@qupon.com / admin123 if missing, or reset
// the password on the existing admin@qupon.com if it's already there.
// Safe to delete this file afterwards.

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const pool = require('./config/db');

const ADMIN_EMAIL = 'admin@qupon.com';
const ADMIN_PASSWORD = 'admin123';

async function main() {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [ADMIN_EMAIL]);

  if (rows.length) {
    await pool.query(
      'UPDATE users SET password = $1, is_admin = TRUE WHERE email = $2',
      [hash, ADMIN_EMAIL]
    );
    console.log(`✅ Reset password for existing admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } else {
    const id = uuidv4();
    await pool.query(
      `INSERT INTO users (id, name, email, phone, password, is_admin, level, points)
       VALUES ($1, 'Admin', $2, '9000000000', $3, TRUE, 5, 9999)`,
      [id, ADMIN_EMAIL, hash]
    );
    console.log(`✅ Created new admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});

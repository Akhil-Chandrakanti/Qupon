const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');
const { serializeUser } = require('../utils/serialize');
const { sendOtpEmail } = require('../utils/mailer');

const router = express.Router();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Step 1: submit registration details -> email an OTP, don't create the account yet
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password)
      return res.status(400).json({ message: 'All fields required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length)
      return res.status(400).json({ message: 'Email already registered' });

    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000;
    const passwordHash = await bcrypt.hash(password, 10);

    // Send the email FIRST - only persist the pending signup if it actually sent,
    // so we never leave someone waiting on an OTP that never arrived.
    await sendOtpEmail(email, name, otp);

    await pool.query(
      `INSERT INTO otp_store (email, name, phone, password_hash, otp, expires, attempts)
       VALUES ($1, $2, $3, $4, $5, $6, 0)
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name, phone = EXCLUDED.phone,
         password_hash = EXCLUDED.password_hash, otp = EXCLUDED.otp,
         expires = EXCLUDED.expires, attempts = 0`,
      [email, name, phone, passwordHash, otp, expires]
    );

    res.json({ message: 'OTP sent to your email', otpSent: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Resend a fresh OTP for a pending signup
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const { rows } = await pool.query('SELECT * FROM otp_store WHERE email = $1', [email]);
    const pending = rows[0];
    if (!pending) return res.status(400).json({ message: 'No pending signup found for this email. Please register again.' });

    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000;

    await sendOtpEmail(email, pending.name, otp);
    await pool.query(
      'UPDATE otp_store SET otp = $1, expires = $2, attempts = 0 WHERE email = $3',
      [otp, expires, email]
    );

    res.json({ message: 'OTP resent to your email', otpSent: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Step 2: verify the OTP -> actually create the account
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

    const { rows } = await pool.query('SELECT * FROM otp_store WHERE email = $1', [email]);
    const stored = rows[0];
    if (!stored) return res.status(400).json({ message: 'No OTP found. Please register first.' });

    if (Date.now() > Number(stored.expires)) {
      await pool.query('DELETE FROM otp_store WHERE email = $1', [email]);
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }
    if (stored.attempts >= 5) {
      await pool.query('DELETE FROM otp_store WHERE email = $1', [email]);
      return res.status(400).json({ message: 'Too many incorrect attempts. Please register again.' });
    }
    if (stored.otp !== otp) {
      await pool.query('UPDATE otp_store SET attempts = attempts + 1 WHERE email = $1', [email]);
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length) {
      await pool.query('DELETE FROM otp_store WHERE email = $1', [email]);
      return res.status(400).json({ message: 'Email already registered' });
    }

    const newUserId = uuidv4();
    const { rows: userRows } = await pool.query(
      `INSERT INTO users (id, name, email, phone, password, is_admin, level, points)
       VALUES ($1, $2, $3, $4, $5, false, 1, 0)
       RETURNING *`,
      [newUserId, stored.name, email, stored.phone, stored.password_hash]
    );
    await pool.query('DELETE FROM otp_store WHERE email = $1', [email]);

    const token = jwt.sign({ id: newUserId }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: serializeUser(userRows[0]) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: serializeUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user
router.get('/me', authMiddleware, (req, res) => {
  res.json(serializeUser(req.user));
});

module.exports = router;

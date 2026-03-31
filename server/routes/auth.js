const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB } = require('../db');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password)
      return res.status(400).json({ message: 'All fields required' });

    const db = readDB();
    if (db.users.find(u => u.email === email))
      return res.status(400).json({ message: 'Email already registered' });

    // Generate OTP (simulate sending)
    const otp = generateOTP();
    db.otpStore = db.otpStore || {};
    db.otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 };
    writeDB(db);

    console.log(`📱 OTP for ${email}: ${otp}`);
    res.json({ message: 'OTP sent to your email', otpSent: true, devOtp: otp });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify OTP and complete registration
router.post('/verify-otp', async (req, res) => {
  try {
    const { name, email, phone, password, otp } = req.body;
    const db = readDB();
    db.otpStore = db.otpStore || {};

    const stored = db.otpStore[email];
    if (!stored) return res.status(400).json({ message: 'No OTP found. Please register first.' });
    if (Date.now() > stored.expires) return res.status(400).json({ message: 'OTP expired' });
    if (stored.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      name, email, phone,
      password: hashedPassword,
      isAdmin: false,
      level: 1,
      points: 0,
      purchases: [],
      listings: [],
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    delete db.otpStore[email];
    writeDB(db);

    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPass } = newUser;
    res.json({ token, user: userWithoutPass });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.email === email);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPass } = user;
    res.json({ token, user: userWithoutPass });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user
router.get('/me', authMiddleware, (req, res) => {
  const { password, ...userWithoutPass } = req.user;
  res.json(userWithoutPass);
});

module.exports = router;

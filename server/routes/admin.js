const express = require('express');
const { readDB, writeDB } = require('../db');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all coupons for admin
router.get('/coupons', adminMiddleware, (req, res) => {
  const db = readDB();
  const { status } = req.query;
  let coupons = db.coupons;
  if (status) coupons = coupons.filter(c => c.status === status);
  // Attach seller info
  const withSeller = coupons.map(c => {
    const seller = db.users.find(u => u.id === c.sellerId);
    return { ...c, sellerName: seller?.name || 'Unknown', sellerEmail: seller?.email || '' };
  });
  res.json(withSeller.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// Verify coupon
router.put('/coupons/:id/verify', adminMiddleware, (req, res) => {
  const db = readDB();
  const idx = db.coupons.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Coupon not found' });
  db.coupons[idx].status = 'verified';
  db.coupons[idx].verifiedAt = new Date().toISOString();
  writeDB(db);
  res.json({ message: 'Coupon verified', coupon: db.coupons[idx] });
});

// Reject coupon
router.put('/coupons/:id/reject', adminMiddleware, (req, res) => {
  const db = readDB();
  const idx = db.coupons.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Coupon not found' });
  db.coupons[idx].status = 'rejected';
  writeDB(db);
  res.json({ message: 'Coupon rejected', coupon: db.coupons[idx] });
});

// Get all users
router.get('/users', adminMiddleware, (req, res) => {
  const db = readDB();
  const users = db.users.map(({ password, ...u }) => u);
  res.json(users);
});

// Get stats
router.get('/stats', adminMiddleware, (req, res) => {
  const db = readDB();
  res.json({
    totalUsers: db.users.length,
    totalCoupons: db.coupons.length,
    pendingCoupons: db.coupons.filter(c => c.status === 'pending').length,
    verifiedCoupons: db.coupons.filter(c => c.status === 'verified').length,
    soldCoupons: db.coupons.filter(c => c.status === 'sold').length,
    totalRevenue: db.transactions.reduce((sum, t) => sum + t.amount, 0),
    totalTransactions: db.transactions.length,
  });
});

module.exports = router;

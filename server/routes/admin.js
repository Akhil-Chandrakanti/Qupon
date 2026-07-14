const express = require('express');
const pool = require('../config/db');
const { adminMiddleware } = require('../middleware/auth');
const { serializeCoupon, serializeUser } = require('../utils/serialize');

const router = express.Router();

// Get all coupons for admin (optionally filtered by status), with seller info attached
router.get('/coupons', adminMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    // Note: aliases are quoted so Postgres preserves the camelCase casing
    // (unquoted identifiers get lowercased) - utils/serialize.js reads c.sellerName/c.sellerEmail.
    let sql = `
      SELECT c.*, u.name AS "sellerName", u.email AS "sellerEmail"
      FROM coupons c
      LEFT JOIN users u ON u.id = c.seller_id
    `;
    const params = [];
    if (status) {
      params.push(status);
      sql += ` WHERE c.status = $${params.length}`;
    }
    sql += ' ORDER BY c.created_at DESC';

    const { rows } = await pool.query(sql, params);
    res.json(rows.map(serializeCoupon));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify coupon
router.put('/coupons/:id/verify', adminMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE coupons SET status = 'verified', verified_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ message: 'Coupon verified', coupon: serializeCoupon(rows[0]) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reject coupon
router.put('/coupons/:id/reject', adminMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE coupons SET status = 'rejected' WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ message: 'Coupon rejected', coupon: serializeCoupon(rows[0]) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users');
    res.json(rows.map(serializeUser));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get stats
router.get('/stats', adminMiddleware, async (req, res) => {
  try {
    const { rows: [userCount] } = await pool.query('SELECT COUNT(*) AS count FROM users');
    const { rows: [couponCount] } = await pool.query('SELECT COUNT(*) AS count FROM coupons');
    const { rows: [pending] } = await pool.query(`SELECT COUNT(*) AS count FROM coupons WHERE status = 'pending'`);
    const { rows: [verified] } = await pool.query(`SELECT COUNT(*) AS count FROM coupons WHERE status = 'verified'`);
    const { rows: [sold] } = await pool.query(`SELECT COUNT(*) AS count FROM coupons WHERE status = 'sold'`);
    const { rows: [txnStats] } = await pool.query('SELECT COUNT(*) AS count, COALESCE(SUM(amount), 0) AS revenue FROM transactions');

    res.json({
      totalUsers: Number(userCount.count),
      totalCoupons: Number(couponCount.count),
      pendingCoupons: Number(pending.count),
      verifiedCoupons: Number(verified.count),
      soldCoupons: Number(sold.count),
      totalRevenue: Number(txnStats.revenue),
      totalTransactions: Number(txnStats.count),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

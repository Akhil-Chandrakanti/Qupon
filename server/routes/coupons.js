const express = require('express');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');
const { serializeCoupon, serializeTransaction } = require('../utils/serialize');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Get all verified, unsold coupons (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, minPrice, maxPrice } = req.query;

    let sql = `SELECT * FROM coupons WHERE status = 'verified' AND buyer_id IS NULL`;
    const params = [];

    if (category && category !== 'All') {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }
    if (search) {
      const q = `%${search.toLowerCase()}%`;
      params.push(q, q, q);
      sql += ` AND (LOWER(title) LIKE $${params.length - 2} OR LOWER(brand) LIKE $${params.length - 1} OR LOWER(description) LIKE $${params.length})`;
    }
    if (minPrice) {
      params.push(Number(minPrice));
      sql += ` AND selling_price >= $${params.length}`;
    }
    if (maxPrice) {
      params.push(Number(maxPrice));
      sql += ` AND selling_price <= $${params.length}`;
    }

    if (sort === 'price_asc') sql += ' ORDER BY selling_price ASC';
    else if (sort === 'price_desc') sql += ' ORDER BY selling_price DESC';
    else if (sort === 'value_desc') sql += ' ORDER BY original_value DESC';
    else if (sort === 'expiry') sql += ' ORDER BY expiry_date ASC';
    else sql += ' ORDER BY created_at DESC';

    const { rows } = await pool.query(sql, params);
    res.json(rows.map(serializeCoupon));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single coupon (public, but hide code unless buyer/seller/admin)
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM coupons WHERE id = $1', [req.params.id]);
    const coupon = rows[0];
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    const authHeader = req.headers.authorization;
    let userId = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        userId = decoded.id;
      } catch {}
    }

    const isOwner = userId && (coupon.seller_id === userId || coupon.buyer_id === userId);
    let isAdmin = false;
    if (userId) {
      const { rows: userRows } = await pool.query('SELECT is_admin FROM users WHERE id = $1', [userId]);
      isAdmin = !!userRows[0]?.is_admin;
    }

    const serialized = serializeCoupon(coupon);
    if (!isOwner && !isAdmin) {
      serialized.code = '••••••••';
    }
    res.json(serialized);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Sell coupon (authenticated)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, brand, category, description, code, originalValue, sellingPrice, expiryDate } = req.body;

    if (!title || !brand || !category || !code || !originalValue || !sellingPrice || !expiryDate)
      return res.status(400).json({ message: 'All fields required' });

    const id = uuidv4();
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const { rows } = await pool.query(
      `INSERT INTO coupons
        (id, title, brand, category, description, code, original_value, selling_price, expiry_date, status, seller_id, buyer_id, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10, NULL, $11)
       RETURNING *`,
      [id, title, brand, category, description || null, code, Number(originalValue), Number(sellingPrice), expiryDate, req.user.id, image]
    );

    res.status(201).json(serializeCoupon(rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Buy coupon (authenticated)
router.post('/:id/buy', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: couponRows } = await client.query('SELECT * FROM coupons WHERE id = $1 FOR UPDATE', [req.params.id]);
    const coupon = couponRows[0];
    if (!coupon) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Coupon not found' });
    }
    if (coupon.status !== 'verified') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Coupon not available' });
    }
    if (coupon.buyer_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Coupon already sold' });
    }
    if (coupon.seller_id === req.user.id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Cannot buy your own coupon' });
    }

    const { upiId } = req.body;
    if (!upiId) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'UPI ID required' });
    }

    const transactionId = uuidv4();
    const amount = Number(coupon.selling_price);

    await client.query(
      `INSERT INTO transactions (id, coupon_id, buyer_id, seller_id, amount, upi_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'completed')`,
      [transactionId, coupon.id, req.user.id, coupon.seller_id, amount, upiId]
    );

    await client.query(
      `UPDATE coupons SET buyer_id = $1, status = 'sold' WHERE id = $2`,
      [req.user.id, coupon.id]
    );

    const buyerPointsGain = Math.floor(amount * 0.1);
    const sellerPointsGain = Math.floor(amount * 0.05);

    await client.query('UPDATE users SET points = points + $1 WHERE id = $2', [buyerPointsGain, req.user.id]);
    await client.query('UPDATE users SET points = points + $1 WHERE id = $2', [sellerPointsGain, coupon.seller_id]);

    // Recompute levels for both buyer and seller based on their new points
    for (const userId of [req.user.id, coupon.seller_id]) {
      const { rows: uRows } = await client.query('SELECT points FROM users WHERE id = $1', [userId]);
      const pts = uRows[0].points;
      let level = 1;
      if (pts >= 2000) level = 5;
      else if (pts >= 800) level = 4;
      else if (pts >= 300) level = 3;
      else if (pts >= 100) level = 2;
      await client.query('UPDATE users SET level = $1 WHERE id = $2', [level, userId]);
    }

    await client.query('COMMIT');

    const { rows: txnRows } = await pool.query('SELECT * FROM transactions WHERE id = $1', [transactionId]);
    res.json({ message: 'Purchase successful', transaction: serializeTransaction(txnRows[0]), code: coupon.code });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;

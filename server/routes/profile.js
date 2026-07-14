const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { serializeUser, serializeCoupon, serializeTransaction } = require('../utils/serialize');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    const { rows: purchaseRows } = await pool.query('SELECT * FROM coupons WHERE buyer_id = $1', [user.id]);
    const { rows: listingRows } = await pool.query('SELECT * FROM coupons WHERE seller_id = $1', [user.id]);
    const { rows: transactionRows } = await pool.query(
      'SELECT * FROM transactions WHERE buyer_id = $1 OR seller_id = $1',
      [user.id]
    );

    const levelNames = { 1: 'Bronze', 2: 'Silver', 3: 'Gold', 4: 'Platinum', 5: 'Diamond' };
    const levelColors = { 1: '#CD7F32', 2: '#C0C0C0', 3: '#FFD700', 4: '#E5E4E2', 5: '#b9f2ff' };
    const nextLevelPoints = { 1: 100, 2: 300, 3: 800, 4: 2000, 5: 9999 };

    res.json({
      ...serializeUser(user),
      levelName: levelNames[user.level] || 'Bronze',
      levelColor: levelColors[user.level] || '#CD7F32',
      nextLevelPoints: nextLevelPoints[user.level] || 100,
      purchases: purchaseRows.map(serializeCoupon),
      listings: listingRows.map(serializeCoupon),
      transactions: transactionRows.map(serializeTransaction),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

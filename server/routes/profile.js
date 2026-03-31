const express = require('express');
const { readDB } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  const { password, ...userWithoutPass } = user;

  const purchases = db.coupons.filter(c => user.purchases.includes(c.id));
  const listings = db.coupons.filter(c => user.listings.includes(c.id));
  const transactions = db.transactions.filter(t => t.buyerId === user.id || t.sellerId === user.id);

  const levelNames = { 1: 'Bronze', 2: 'Silver', 3: 'Gold', 4: 'Platinum', 5: 'Diamond' };
  const levelColors = { 1: '#CD7F32', 2: '#C0C0C0', 3: '#FFD700', 4: '#E5E4E2', 5: '#b9f2ff' };
  const nextLevelPoints = { 1: 100, 2: 300, 3: 800, 4: 2000, 5: 9999 };

  res.json({
    ...userWithoutPass,
    levelName: levelNames[user.level] || 'Bronze',
    levelColor: levelColors[user.level] || '#CD7F32',
    nextLevelPoints: nextLevelPoints[user.level] || 100,
    purchases,
    listings,
    transactions
  });
});

module.exports = router;

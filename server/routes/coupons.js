const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Get all verified coupons (public)
router.get('/', (req, res) => {
  const db = readDB();
  const { category, search, sort, minPrice, maxPrice } = req.query;

  let coupons = db.coupons.filter(c => c.status === 'verified' && !c.buyerId);

  if (category && category !== 'All') {
    coupons = coupons.filter(c => c.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    coupons = coupons.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.brand.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  }
  if (minPrice) coupons = coupons.filter(c => c.sellingPrice >= Number(minPrice));
  if (maxPrice) coupons = coupons.filter(c => c.sellingPrice <= Number(maxPrice));

  if (sort === 'price_asc') coupons.sort((a, b) => a.sellingPrice - b.sellingPrice);
  else if (sort === 'price_desc') coupons.sort((a, b) => b.sellingPrice - a.sellingPrice);
  else if (sort === 'value_desc') coupons.sort((a, b) => b.originalValue - a.originalValue);
  else if (sort === 'expiry') coupons.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  else coupons.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(coupons);
});

// Get single coupon (public, but hide code unless buyer/seller)
router.get('/:id', (req, res) => {
  const db = readDB();
  const coupon = db.coupons.find(c => c.id === req.params.id);
  if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

  const authHeader = req.headers.authorization;
  let userId = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const jwt = require('jsonwebtoken');
      const { JWT_SECRET } = require('../middleware/auth');
      const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
      userId = decoded.id;
    } catch {}
  }

  const isOwner = userId && (coupon.sellerId === userId || coupon.buyerId === userId);
  const db2 = readDB();
  const adminUser = db2.users.find(u => u.id === userId);
  const isAdmin = adminUser?.isAdmin;

  if (!isOwner && !isAdmin) {
    const { code, ...rest } = coupon;
    return res.json({ ...rest, code: '••••••••' });
  }

  res.json(coupon);
});

// Sell coupon (authenticated)
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  try {
    const { title, brand, category, description, code, originalValue, sellingPrice, expiryDate } = req.body;

    if (!title || !brand || !category || !code || !originalValue || !sellingPrice || !expiryDate)
      return res.status(400).json({ message: 'All fields required' });

    const db = readDB();
    const newCoupon = {
      id: uuidv4(),
      title, brand, category, description, code,
      originalValue: Number(originalValue),
      sellingPrice: Number(sellingPrice),
      expiryDate,
      status: 'pending',
      sellerId: req.user.id,
      buyerId: null,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      createdAt: new Date().toISOString()
    };

    db.coupons.push(newCoupon);
    const userIdx = db.users.findIndex(u => u.id === req.user.id);
    db.users[userIdx].listings.push(newCoupon.id);
    writeDB(db);

    res.status(201).json(newCoupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Buy coupon (authenticated)
router.post('/:id/buy', authMiddleware, (req, res) => {
  try {
    const db = readDB();
    const couponIdx = db.coupons.findIndex(c => c.id === req.params.id);
    if (couponIdx === -1) return res.status(404).json({ message: 'Coupon not found' });

    const coupon = db.coupons[couponIdx];
    if (coupon.status !== 'verified') return res.status(400).json({ message: 'Coupon not available' });
    if (coupon.buyerId) return res.status(400).json({ message: 'Coupon already sold' });
    if (coupon.sellerId === req.user.id) return res.status(400).json({ message: 'Cannot buy your own coupon' });

    const { upiId } = req.body;
    if (!upiId) return res.status(400).json({ message: 'UPI ID required' });

    // Create transaction
    const transaction = {
      id: uuidv4(),
      couponId: coupon.id,
      buyerId: req.user.id,
      sellerId: coupon.sellerId,
      amount: coupon.sellingPrice,
      upiId,
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    db.transactions.push(transaction);
    db.coupons[couponIdx].buyerId = req.user.id;
    db.coupons[couponIdx].status = 'sold';

    // Update buyer
    const buyerIdx = db.users.findIndex(u => u.id === req.user.id);
    db.users[buyerIdx].purchases.push(coupon.id);
    db.users[buyerIdx].points = (db.users[buyerIdx].points || 0) + Math.floor(coupon.sellingPrice * 0.1);

    // Update seller points
    const sellerIdx = db.users.findIndex(u => u.id === coupon.sellerId);
    if (sellerIdx !== -1) {
      db.users[sellerIdx].points = (db.users[sellerIdx].points || 0) + Math.floor(coupon.sellingPrice * 0.05);
    }

    // Update levels
    [buyerIdx, sellerIdx].forEach(idx => {
      if (idx === -1) return;
      const pts = db.users[idx].points;
      if (pts >= 2000) db.users[idx].level = 5;
      else if (pts >= 800) db.users[idx].level = 4;
      else if (pts >= 300) db.users[idx].level = 3;
      else if (pts >= 100) db.users[idx].level = 2;
      else db.users[idx].level = 1;
    });

    writeDB(db);
    res.json({ message: 'Purchase successful', transaction, code: coupon.code });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

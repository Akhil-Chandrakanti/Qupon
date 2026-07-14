const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const pool = require('./config/db');

async function initDB() {
  if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
  }

  // Create tables from schema.sql if they don't exist yet.
  // Strip full-line comments first so a comment block before a statement
  // doesn't cause the whole statement to be mistaken for a comment.
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  const noComments = schema
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n');
  const statements = noComments
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const conn = await pool.connect();
  try {
    for (const stmt of statements) {
      await conn.query(stmt);
    }
  } finally {
    conn.release();
  }

  // Seed sample data only if the users table is empty
  const { rows } = await pool.query('SELECT COUNT(*) AS count FROM users');
  if (Number(rows[0].count) > 0) {
    console.log('✅ Connected to Supabase (existing data found, skipping seed)');
    return;
  }

  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('password123', 10);

  const adminId = uuidv4();
  const user1Id = uuidv4();
  const user2Id = uuidv4();

  const users = [
    [adminId, 'Admin', 'admin@qupon.com', '9000000000', adminHash, true, 5, 9999],
    [user1Id, 'Rahul Sharma', 'rahul@example.com', '9876543210', userHash, false, 2, 320],
    [user2Id, 'Priya Patel', 'priya@example.com', '9876543211', userHash, false, 3, 650],
  ];
  for (const u of users) {
    await pool.query(
      `INSERT INTO users (id, name, email, phone, password, is_admin, level, points)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      u
    );
  }

  const coupons = [
    ['Swiggy 50% Off (Max ₹100)', 'Swiggy', 'Food & Dining', 'Get 50% off on your order above ₹199. Valid on all restaurants.', 'SWIGGY50NOW', 100, 35, '2026-12-30', user1Id],
    ['Zomato Gold Free Delivery', 'Zomato', 'Food & Dining', 'Enjoy 3 months of Zomato Gold free delivery on all orders.', 'ZOMGOLD3M', 299, 99, '2026-12-15', user2Id],
    ['Amazon 20% Off Electronics', 'Amazon', 'Electronics', 'Flat 20% off on all electronics above ₹2000. Maximum discount ₹500.', 'AZNELEC20', 500, 180, '2026-12-30', user1Id],
    ['Flipkart ₹300 Off Fashion', 'Flipkart', 'Fashion', 'Get ₹300 off on fashion purchase above ₹1499. One time use only.', 'FKFASH300', 300, 110, '2026-12-31', user2Id],
    ['BookMyShow ₹200 Off Movies', 'BookMyShow', 'Entertainment', 'Flat ₹200 off on movie tickets booking above ₹400.', 'BMSMOV200', 200, 75, '2026-12-31', user1Id],
    ['MakeMyTrip ₹800 Hotel Deal', 'MakeMyTrip', 'Travel', 'Get ₹800 off on hotel booking above ₹3000. Valid on domestic properties.', 'MMTHOTEL800', 800, 290, '2026-12-31', user2Id],
    ['Myntra 40% Off Apparel', 'Myntra', 'Fashion', 'Flat 40% off on apparel above ₹999. No maximum cap.', 'MYNTRA40', 400, 149, '2026-12-15', user1Id],
    ['Nykaa ₹250 Beauty Voucher', 'Nykaa', 'Health & Beauty', 'Redeem ₹250 off on skincare and beauty products above ₹800.', 'NYKAA250', 250, 89, '2026-12-01', user2Id],
    ['BigBasket ₹150 Grocery Save', 'BigBasket', 'Groceries', 'Save ₹150 on grocery orders above ₹800. Valid for new users.', 'BBGROCERY150', 150, 55, '2026-12-20', user1Id],
    ['Uber ₹200 Ride Credit', 'Uber', 'Travel', 'Get ₹200 off on your next 2 Uber rides (₹100 each).', 'UBERRIDE200', 200, 79, '2026-12-01', user2Id],
    ['PharmEasy 30% Medicines', 'PharmEasy', 'Health & Beauty', 'Flat 30% off on all medicines and health products.', 'PHARME30', 200, 70, '2026-12-30', user1Id],
    ['Cleartrip Flight ₹500 Off', 'Cleartrip', 'Travel', 'Get ₹500 discount on domestic flight booking above ₹3500.', 'CTFLIGHT500', 500, 189, '2026-12-15', user2Id],
    ['Puma 35% Footwear', 'Puma', 'Fashion', 'Flat 35% off on Puma footwear above ₹2000. Limited time offer.', 'PUMA35FOOT', 700, 259, '2026-12-20', user1Id],
    ['Ola Cab ₹100 Off', 'Ola', 'Travel', 'Get ₹100 off on your next Ola ride. Min fare ₹150.', 'OLACAB100', 100, 35, '2026-12-25', user2Id],
    ['Ajio ₹300 Fashion Coupon', 'Ajio', 'Fashion', 'Get ₹300 off on AJIO purchase above ₹1200.', 'AJIO300OFF', 300, 110, '2026-12-30', user1Id],
  ];

  for (const c of coupons) {
    const [title, brand, category, description, code, originalValue, sellingPrice, expiryDate, sellerId] = c;
    await pool.query(
      `INSERT INTO coupons
        (id, title, brand, category, description, code, original_value, selling_price, expiry_date, seller_id, status, buyer_id, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'verified', NULL, NULL)`,
      [uuidv4(), title, brand, category, description, code, originalValue, sellingPrice, expiryDate, sellerId]
    );
  }

  console.log('✅ Connected to Supabase and seeded sample data');
}

module.exports = { initDB, pool };

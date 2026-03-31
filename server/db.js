const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, 'data', 'db.json');

function readDB() {
  if (!fs.existsSync(DB_PATH)) return null;
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

async function initDB() {
  if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
  }
  if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) return;

  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('password123', 10);

  const adminId = uuidv4();
  const user1Id = uuidv4();
  const user2Id = uuidv4();

  const now = new Date().toISOString();

  const coupons = [
    { id: uuidv4(), title: 'Swiggy 50% Off (Max ₹100)', brand: 'Swiggy', category: 'Food & Dining', code: 'SWIGGY50NOW', description: 'Get 50% off on your order above ₹199. Valid on all restaurants.', originalValue: 100, sellingPrice: 35, expiryDate: '2026-06-30', status: 'verified', sellerId: user1Id, buyerId: null, image: null, createdAt: now },
    { id: uuidv4(), title: 'Zomato Gold Free Delivery', brand: 'Zomato', category: 'Food & Dining', code: 'ZOMGOLD3M', description: 'Enjoy 3 months of Zomato Gold free delivery on all orders.', originalValue: 299, sellingPrice: 99, expiryDate: '2026-05-15', status: 'verified', sellerId: user2Id, buyerId: null, image: null, createdAt: now },
    { id: uuidv4(), title: 'Amazon 20% Off Electronics', brand: 'Amazon', category: 'Electronics', code: 'AZNELEC20', description: 'Flat 20% off on all electronics above ₹2000. Maximum discount ₹500.', originalValue: 500, sellingPrice: 180, expiryDate: '2026-04-30', status: 'verified', sellerId: user1Id, buyerId: null, image: null, createdAt: now },
    { id: uuidv4(), title: 'Flipkart ₹300 Off Fashion', brand: 'Flipkart', category: 'Fashion', code: 'FKFASH300', description: 'Get ₹300 off on fashion purchase above ₹1499. One time use only.', originalValue: 300, sellingPrice: 110, expiryDate: '2026-07-31', status: 'verified', sellerId: user2Id, buyerId: null, image: null, createdAt: now },
    { id: uuidv4(), title: 'BookMyShow ₹200 Off Movies', brand: 'BookMyShow', category: 'Entertainment', code: 'BMSMOV200', description: 'Flat ₹200 off on movie tickets booking above ₹400.', originalValue: 200, sellingPrice: 75, expiryDate: '2026-05-31', status: 'verified', sellerId: user1Id, buyerId: null, image: null, createdAt: now },
    { id: uuidv4(), title: 'MakeMyTrip ₹800 Hotel Deal', brand: 'MakeMyTrip', category: 'Travel', code: 'MMTHOTEL800', description: 'Get ₹800 off on hotel booking above ₹3000. Valid on domestic properties.', originalValue: 800, sellingPrice: 290, expiryDate: '2026-08-31', status: 'verified', sellerId: user2Id, buyerId: null, image: null, createdAt: now },
    { id: uuidv4(), title: 'Myntra 40% Off Apparel', brand: 'Myntra', category: 'Fashion', code: 'MYNTRA40', description: 'Flat 40% off on apparel above ₹999. No maximum cap.', originalValue: 400, sellingPrice: 149, expiryDate: '2026-06-15', status: 'verified', sellerId: user1Id, buyerId: null, image: null, createdAt: now },
    { id: uuidv4(), title: 'Nykaa ₹250 Beauty Voucher', brand: 'Nykaa', category: 'Health & Beauty', code: 'NYKAA250', description: 'Redeem ₹250 off on skincare and beauty products above ₹800.', originalValue: 250, sellingPrice: 89, expiryDate: '2026-05-01', status: 'verified', sellerId: user2Id, buyerId: null, image: null, createdAt: now },
    { id: uuidv4(), title: 'BigBasket ₹150 Grocery Save', brand: 'BigBasket', category: 'Groceries', code: 'BBGROCERY150', description: 'Save ₹150 on grocery orders above ₹800. Valid for new users.', originalValue: 150, sellingPrice: 55, expiryDate: '2026-04-20', status: 'verified', sellerId: user1Id, buyerId: null, image: null, createdAt: now },
    { id: uuidv4(), title: 'Uber ₹200 Ride Credit', brand: 'Uber', category: 'Travel', code: 'UBERRIDE200', description: 'Get ₹200 off on your next 2 Uber rides (₹100 each).', originalValue: 200, sellingPrice: 79, expiryDate: '2026-06-01', status: 'verified', sellerId: user2Id, buyerId: null, image: null, createdAt: now },
    { id: uuidv4(), title: 'PharmEasy 30% Medicines', brand: 'PharmEasy', category: 'Health & Beauty', code: 'PHARME30', description: 'Flat 30% off on all medicines and health products.', originalValue: 200, sellingPrice: 70, expiryDate: '2026-09-30', status: 'verified', sellerId: user1Id, buyerId: null, image: null, createdAt: now },
    { id: uuidv4(), title: 'Cleartrip Flight ₹500 Off', brand: 'Cleartrip', category: 'Travel', code: 'CTFLIGHT500', description: 'Get ₹500 discount on domestic flight booking above ₹3500.', originalValue: 500, sellingPrice: 189, expiryDate: '2026-07-15', status: 'verified', sellerId: user2Id, buyerId: null, image: null, createdAt: now },
    { id: uuidv4(), title: 'Puma 35% Footwear', brand: 'Puma', category: 'Fashion', code: 'PUMA35FOOT', description: 'Flat 35% off on Puma footwear above ₹2000. Limited time offer.', originalValue: 700, sellingPrice: 259, expiryDate: '2026-05-20', status: 'verified', sellerId: user1Id, buyerId: null, image: null, createdAt: now },
    { id: uuidv4(), title: 'Ola Cab ₹100 Off', brand: 'Ola', category: 'Travel', code: 'OLACAB100', description: 'Get ₹100 off on your next Ola ride. Min fare ₹150.', originalValue: 100, sellingPrice: 35, expiryDate: '2026-04-25', status: 'verified', sellerId: user2Id, buyerId: null, image: null, createdAt: now },
    { id: uuidv4(), title: 'Ajio ₹300 Fashion Coupon', brand: 'Ajio', category: 'Fashion', code: 'AJIO300OFF', description: 'Get ₹300 off on AJIO purchase above ₹1200.', originalValue: 300, sellingPrice: 110, expiryDate: '2026-06-30', status: 'verified', sellerId: user1Id, buyerId: null, image: null, createdAt: now },
  ];

  const db = {
    users: [
      { id: adminId, name: 'Admin', email: 'admin@qupon.com', phone: '9000000000', password: adminHash, isAdmin: true, level: 5, points: 9999, purchases: [], listings: [], createdAt: now },
      { id: user1Id, name: 'Rahul Sharma', email: 'rahul@example.com', phone: '9876543210', password: userHash, isAdmin: false, level: 2, points: 320, purchases: [], listings: coupons.filter(c => c.sellerId === user1Id).map(c => c.id), createdAt: now },
      { id: user2Id, name: 'Priya Patel', email: 'priya@example.com', phone: '9876543211', password: userHash, isAdmin: false, level: 3, points: 650, purchases: [], listings: coupons.filter(c => c.sellerId === user2Id).map(c => c.id), createdAt: now },
    ],
    coupons,
    transactions: [],
    otpStore: {}
  };

  writeDB(db);
  console.log('✅ Database initialized with sample data');
}

module.exports = { readDB, writeDB, initDB };

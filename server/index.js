require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/profile', require('./routes/profile'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Qupon API running' }));

const PORT = process.env.PORT || 5000;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Qupon server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Failed to connect to Supabase / initialize database:');
  console.error(err.message);
  console.error('Check your server/.env file (DATABASE_URL) and make sure it matches your Supabase project\'s connection string.');
  process.exit(1);
});

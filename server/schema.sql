-- Qupon PostgreSQL schema (Supabase)
-- This is applied automatically on server start (see db.js),
-- but you can also run it manually in the Supabase SQL Editor if you prefer.

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  level INT NOT NULL DEFAULT 1,
  points INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coupons (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  code VARCHAR(100) NOT NULL,
  original_value DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  expiry_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'verified', 'rejected', 'sold')),
  seller_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_id VARCHAR(36) DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
  image VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY,
  coupon_id VARCHAR(36) NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  buyer_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  upi_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Holds a pending signup until the emailed OTP is confirmed.
-- Rows are deleted once verified (account created) or expire naturally.
CREATE TABLE IF NOT EXISTS otp_store (
  email VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  otp VARCHAR(10) NOT NULL,
  expires BIGINT NOT NULL,
  attempts INT NOT NULL DEFAULT 0
);

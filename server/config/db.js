const { Pool, types } = require('pg');
require('dotenv').config();

// Postgres returns DATE columns as JS Date objects by default, which can
// shift the calendar day depending on server timezone. Return them as
// plain 'YYYY-MM-DD' strings instead (matches what the frontend expects
// for coupon.expiryDate, and matches the old MySQL behavior).
types.setTypeParser(1082, val => val); // 1082 = OID for the 'date' type

// Supabase connection.
// Fill in DATABASE_URL in server/.env (copy from .env.example) - grab it
// from your Supabase project: Project Settings -> Database -> Connection
// string -> "Session pooler" (recommended for a long-running server like
// this one; it supports transactions and row locks with no surprises).
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is not set. Copy server/.env.example to server/.env and fill in your Supabase connection string.');
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Supabase requires SSL
  max: 10,
});

module.exports = pool;

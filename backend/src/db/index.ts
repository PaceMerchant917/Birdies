import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Determine if SSL should be enabled
const shouldUseSSL = () => {
  // Enable SSL if:
  // 1. DB_SSL env var is explicitly set to 'true'
  // 2. DATABASE_URL contains 'supabase'
  // 3. NODE_ENV is 'production'
  if (process.env.DB_SSL === 'true') return true;
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase')) return true;
  if (process.env.NODE_ENV === 'production') return true;
  return false;
};

// Configure pool based on whether DATABASE_URL is set
const poolConfig = process.env.DATABASE_URL
  ? {
      // Primary: Use DATABASE_URL (e.g., Supabase)
      connectionString: process.env.DATABASE_URL,
      ssl: shouldUseSSL() ? { rejectUnauthorized: false } : undefined,
    }
  : {
      // Fallback: Local development with individual params
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5433'),
      user: process.env.DB_USER || 'mcgill',
      password: process.env.DB_PASSWORD || 'dating123',
      database: process.env.DB_NAME || 'mcgill_dating',
    };

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  const connType = process.env.DATABASE_URL ? 'DATABASE_URL' : 'local fallback';
  console.log(`✅ Connected to PostgreSQL database (${connType})`);
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

export default pool;

// lib/db.js or lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432, // Default to 5432 if not set
});

export const query = async (text, params) => {
    try {
      const res = await pool.query(text, params);
      return res;
    } catch (error) {
      console.error('Database query error:', error);
      throw new Error('Error executing database query');
    }
  };

  pool.connect()
  .then(() => console.log('Connected to the PostgreSQL database successfully'))
  .catch((err) => console.error('Error connecting to the PostgreSQL database:', err));

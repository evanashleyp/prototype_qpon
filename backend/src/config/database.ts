import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'couponhub',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: false,
});

// Test connection
pool.getConnection()
  .then((conn) => {
    console.log('✅ MySQL connection successful');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ MySQL connection failed:', err.message);
    console.log('Make sure MySQL is running and credentials in .env are correct');
  });

export default pool;

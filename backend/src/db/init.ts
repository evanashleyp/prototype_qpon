import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  console.log('🔧 Initializing CouponHub database...');

  const connection = await pool.getConnection();

  try {
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Split by semicolon and execute each statement
    const statements = schema
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    for (const statement of statements) {
      try {
        await connection.query(statement);
        console.log('  ✓', statement.substring(0, 50) + '...');
      } catch (err) {
        console.error('  ✗ Error executing statement:', err);
      }
    }

    console.log('✅ Database initialized successfully!');

    // Seed demo data
    console.log('\n📊 Seeding demo data...');
    await seedDemoData(connection);

    console.log('✅ Demo data seeded successfully!');
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
    throw err;
  } finally {
    connection.release();
    await pool.end();
    process.exit(0);
  }
}

async function seedDemoData(connection: any) {
  // Create demo users (user and merchants)
  const { v4: uuidv4 } = await import('uuid');
  const bcryptjs = await import('bcryptjs');

  const password = await bcryptjs.default.hash('password', 10);

  // Demo user
  const userId = uuidv4();
  await connection.query(
    'INSERT IGNORE INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    [userId, 'Demo User', 'user@demo.com', password, 'user']
  );

  // Demo merchants
  const merchant1Id = uuidv4();
  const merchant1UserId = uuidv4();
  await connection.query(
    'INSERT IGNORE INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    [merchant1UserId, 'Burger Paradise', 'burger@demo.com', password, 'merchant']
  );
  await connection.query(
    'INSERT IGNORE INTO merchants (id, user_id, business_name) VALUES (?, ?, ?)',
    [merchant1Id, merchant1UserId, 'Burger Paradise']
  );

  const merchant2Id = uuidv4();
  const merchant2UserId = uuidv4();
  await connection.query(
    'INSERT IGNORE INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    [merchant2UserId, 'Coffee Corner', 'coffee@demo.com', password, 'merchant']
  );
  await connection.query(
    'INSERT IGNORE INTO merchants (id, user_id, business_name) VALUES (?, ?, ?)',
    [merchant2Id, merchant2UserId, 'Coffee Corner']
  );

  // Create sample coupons
  const now = new Date();
  const expiryDate = new Date(now);
  expiryDate.setDate(expiryDate.getDate() + 30);

  const coupon1Id = uuidv4();
  await connection.query(
    `
    INSERT IGNORE INTO coupons 
    (id, merchant_id, title, description, price, discount_percentage, expiration_date, stock) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      coupon1Id,
      merchant1Id,
      'Deluxe Burger Combo',
      'Premium burger with fries and drink',
      15.99,
      25,
      expiryDate,
      50,
    ]
  );

  // Add items to coupon
  await connection.query(
    'INSERT IGNORE INTO coupon_items (id, coupon_id, item_name, quantity) VALUES (?, ?, ?, ?)',
    [uuidv4(), coupon1Id, 'Deluxe Burger', 1]
  );
  await connection.query(
    'INSERT IGNORE INTO coupon_items (id, coupon_id, item_name, quantity) VALUES (?, ?, ?, ?)',
    [uuidv4(), coupon1Id, 'Fries', 1]
  );
  await connection.query(
    'INSERT IGNORE INTO coupon_items (id, coupon_id, item_name, quantity) VALUES (?, ?, ?, ?)',
    [uuidv4(), coupon1Id, 'Drink', 1]
  );

  const coupon2Id = uuidv4();
  await connection.query(
    `
    INSERT IGNORE INTO coupons 
    (id, merchant_id, title, description, price, discount_percentage, expiration_date, stock) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      coupon2Id,
      merchant2Id,
      'Premium Coffee Voucher',
      'Get any premium coffee at 50% off',
      8.99,
      50,
      expiryDate,
      100,
    ]
  );

  // Add items to coupon
  await connection.query(
    'INSERT IGNORE INTO coupon_items (id, coupon_id, item_name, quantity) VALUES (?, ?, ?, ?)',
    [uuidv4(), coupon2Id, 'Premium Coffee', 1]
  );

  console.log('  ✓ Created demo users (user@demo.com, burger@demo.com, coffee@demo.com)');
  console.log('  ✓ Created sample coupons');
  console.log('  ℹ️  Default password for all demo accounts: "password"');
}

// Run initialization
initializeDatabase().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

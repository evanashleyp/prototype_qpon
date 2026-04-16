-- CouponHub Database Schema for MySQL

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'merchant') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Create merchants table (extends users)
CREATE TABLE IF NOT EXISTS merchants (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  business_name VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id VARCHAR(36) PRIMARY KEY,
  merchant_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  discount_percentage INT NOT NULL,
  expiration_date DATETIME NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
  INDEX idx_merchant_id (merchant_id),
  INDEX idx_expiration (expiration_date),
  INDEX idx_created_at (created_at)
);

-- Create coupon_items table (items included in a coupon)
CREATE TABLE IF NOT EXISTS coupon_items (
  id VARCHAR(36) PRIMARY KEY,
  coupon_id VARCHAR(36) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  INDEX idx_coupon_id (coupon_id)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  coupon_id VARCHAR(36) NOT NULL,
  price_bought_at DECIMAL(10, 2) NOT NULL,
  purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_coupon_id (coupon_id),
  INDEX idx_purchase_date (purchase_date)
);

-- Create user_coupons table (purchased coupons with QR code)
CREATE TABLE IF NOT EXISTS user_coupons (
  id VARCHAR(36) PRIMARY KEY,
  transaction_id VARCHAR(36) NOT NULL UNIQUE,
  user_id VARCHAR(36) NOT NULL,
  coupon_id VARCHAR(36) NOT NULL,
  qr_code VARCHAR(255) NOT NULL UNIQUE,
  is_redeemed BOOLEAN DEFAULT FALSE,
  redeemed_at TIMESTAMP NULL,
  redeemed_by_merchant_id VARCHAR(36),
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  FOREIGN KEY (redeemed_by_merchant_id) REFERENCES merchants(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_coupon_id (coupon_id),
  INDEX idx_qr_code (qr_code),
  INDEX idx_is_redeemed (is_redeemed),
  INDEX idx_expires_at (expires_at)
);

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  code VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  expires_at BIGINT NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE,
  INDEX idx_email (email),
  INDEX idx_expires_at (expires_at)
);

-- Create sessions table (optional, for server-side sessions if needed)
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);

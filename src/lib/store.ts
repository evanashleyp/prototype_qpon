import { Coupon, User, UserCoupon, Transaction, CouponItem, PasswordResetToken } from './types';

// Simple in-memory store simulating backend
const MOCK_MERCHANTS: User[] = [
  { id: 'm1', name: 'Burger Palace', email: 'burger@demo.com', role: 'merchant', created_at: '2024-01-01' },
  { id: 'm2', name: 'Coffee Corner', email: 'coffee@demo.com', role: 'merchant', created_at: '2024-01-05' },
  { id: 'm3', name: 'Pizza Express', email: 'pizza@demo.com', role: 'merchant', created_at: '2024-02-01' },
];

let registeredUsers: User[] = [];

let coupons: Coupon[] = [
  {
    id: 'c1', merchant_id: 'm1', merchant_name: 'Burger Palace',
    title: 'Double Burger Combo', description: 'Get a double burger with fries and drink at 30% off!',
    price: 8.99, discount_percentage: 30, expiration_date: '2026-06-30', stock: 50,
    items: [
      { id: 'ci1', coupon_id: 'c1', item_name: 'Double Burger', quantity: 1 },
      { id: 'ci2', coupon_id: 'c1', item_name: 'Large Fries', quantity: 1 },
      { id: 'ci3', coupon_id: 'c1', item_name: 'Soft Drink', quantity: 1 },
    ],
    created_at: '2024-03-01',
  },
  {
    id: 'c2', merchant_id: 'm2', merchant_name: 'Coffee Corner',
    title: 'Morning Coffee Deal', description: 'Any coffee + pastry for a great price.',
    price: 4.50, discount_percentage: 25, expiration_date: '2026-05-15', stock: 100,
    items: [
      { id: 'ci4', coupon_id: 'c2', item_name: 'Any Coffee (M)', quantity: 1 },
      { id: 'ci5', coupon_id: 'c2', item_name: 'Pastry', quantity: 1 },
    ],
    created_at: '2024-03-05',
  },
  {
    id: 'c3', merchant_id: 'm3', merchant_name: 'Pizza Express',
    title: 'Family Pizza Night', description: '2 large pizzas + garlic bread + drinks for the whole family!',
    price: 22.00, discount_percentage: 40, expiration_date: '2026-07-31', stock: 30,
    items: [
      { id: 'ci6', coupon_id: 'c3', item_name: 'Large Pizza', quantity: 2 },
      { id: 'ci7', coupon_id: 'c3', item_name: 'Garlic Bread', quantity: 1 },
      { id: 'ci8', coupon_id: 'c3', item_name: 'Soft Drink (1.5L)', quantity: 2 },
    ],
    created_at: '2024-03-10',
  },
  {
    id: 'c4', merchant_id: 'm1', merchant_name: 'Burger Palace',
    title: 'Kids Meal Special', description: 'A small burger, juice box, and toy.',
    price: 4.99, discount_percentage: 20, expiration_date: '2026-04-30', stock: 0,
    items: [
      { id: 'ci9', coupon_id: 'c4', item_name: 'Kids Burger', quantity: 1 },
      { id: 'ci10', coupon_id: 'c4', item_name: 'Juice Box', quantity: 1 },
    ],
    created_at: '2024-03-12',
  },
  {
    id: 'c5', merchant_id: 'm2', merchant_name: 'Coffee Corner',
    title: 'Iced Latte Single', description: 'Refreshing iced latte, any size.',
    price: 3.00, discount_percentage: 15, expiration_date: '2026-08-31', stock: 200,
    items: [
      { id: 'ci11', coupon_id: 'c5', item_name: 'Iced Latte', quantity: 1 },
    ],
    created_at: '2024-03-15',
  },
];

let transactions: Transaction[] = [];
let userCoupons: UserCoupon[] = [];
let currentUser: User | null = null;

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function generateQR(): string {
  return `QR-${Date.now()}-${generateId()}`;
}

// Auth
export function login(email: string, password: string): User | null {
  // Validate credentials
  if (!validateCredentials(email, password)) {
    return null;
  }

  // Check registered users first
  const registeredUser = registeredUsers.find(u => u.email === email);
  if (registeredUser) {
    currentUser = registeredUser;
    return currentUser;
  }

  // Demo accounts
  if (email === 'user@demo.com') {
    currentUser = { id: 'u1', name: 'Demo User', email, role: 'user', created_at: '2024-01-01' };
    return currentUser;
  }
  const merchant = MOCK_MERCHANTS.find(m => m.email === email);
  if (merchant) {
    currentUser = merchant;
    return currentUser;
  }
  return null;
}

export function register(name: string, email: string, password: string, role: 'user' | 'merchant'): User {
  const user: User = { id: generateId(), name, email, role, created_at: new Date().toISOString() };
  registeredUsers.push(user);
  currentUser = user;
  // Store password for new user
  MOCK_PASSWORDS.set(email, password);
  return currentUser;
}

export function logout() { currentUser = null; }
export function getCurrentUser(): User | null { return currentUser; }

// Coupons
export function getCoupons(): Coupon[] { return coupons.filter(c => c.stock > 0 && new Date(c.expiration_date) > new Date()); }
export function getAllCoupons(): Coupon[] { return coupons; }
export function getCoupon(id: string): Coupon | undefined { return coupons.find(c => c.id === id); }

export function getMerchantCoupons(merchantId: string): Coupon[] {
  return coupons.filter(c => c.merchant_id === merchantId);
}

export function getMerchantSalesCount(couponId: string): number {
  return transactions.filter(t => t.coupon_id === couponId).length;
}

export function createCoupon(data: Omit<Coupon, 'id' | 'created_at' | 'merchant_id' | 'merchant_name' | 'items'> & { items: Omit<CouponItem, 'id' | 'coupon_id'>[] }): Coupon {
  const id = generateId();
  const coupon: Coupon = {
    ...data,
    id,
    merchant_id: currentUser!.id,
    merchant_name: currentUser!.name,
    items: data.items.map(item => ({ ...item, id: generateId(), coupon_id: id })),
    created_at: new Date().toISOString(),
  };
  coupons.push(coupon);
  return coupon;
}

export function updateCoupon(id: string, data: Partial<Omit<Coupon, 'id' | 'merchant_id' | 'created_at'>>): Coupon | null {
  const idx = coupons.findIndex(c => c.id === id);
  if (idx === -1) return null;
  coupons[idx] = { ...coupons[idx], ...data };
  return coupons[idx];
}

export function deleteCoupon(id: string): boolean {
  const len = coupons.length;
  coupons = coupons.filter(c => c.id !== id);
  return coupons.length < len;
}

// Purchase
export function purchaseCoupon(couponId: string): UserCoupon | null {
  if (!currentUser) return null;
  const coupon = getCoupon(couponId);
  if (!coupon || coupon.stock <= 0) return null;

  coupon.stock -= 1;

  const txn: Transaction = {
    id: generateId(),
    user_id: currentUser.id,
    coupon_id: couponId,
    purchase_date: new Date().toISOString(),
  };
  transactions.push(txn);

  const uc: UserCoupon = {
    id: generateId(),
    transaction_id: txn.id,
    coupon,
    qr_code: generateQR(),
    is_redeemed: false,
    redeemed_at: null,
    expires_at: coupon.expiration_date,
    price_bought_at: coupon.price, // Store the price at which the coupon was bought for future reference
  };
  userCoupons.push(uc);
  return uc;
}

export function getUserCoupons(userId: string): UserCoupon[] {
  return userCoupons.filter(uc => {
    const txn = transactions.find(t => t.id === uc.transaction_id);
    return txn?.user_id === userId;
  });
}

// Redeem
export function redeemCoupon(qrCode: string): { success: boolean; message: string } {
  const uc = userCoupons.find(c => c.qr_code === qrCode);
  if (!uc) return { success: false, message: 'Invalid QR code.' };
  if (uc.is_redeemed) return { success: false, message: 'Coupon already redeemed.' };
  if (new Date(uc.expires_at) < new Date()) return { success: false, message: 'Coupon has expired.' };

  uc.is_redeemed = true;
  uc.redeemed_at = new Date().toISOString();
  return { success: true, message: `Coupon "${uc.coupon.title}" redeemed successfully!` };
}

// Password Reset
const passwordResetTokens: Map<string, PasswordResetToken> = new Map();
const passwordResetRequests: Map<string, number> = new Map(); // Track requests per email
const RESET_CODE_EXPIRY = 60 * 60 * 1000; // 1 hour
const RESET_REQUEST_COOLDOWN = 5 * 60 * 1000; // 5 minutes between requests
const MOCK_PASSWORDS: Map<string, string> = new Map([
  ['user@demo.com', 'password'],
  ['burger@demo.com', 'password'],
  ['coffee@demo.com', 'password'],
  ['pizza@demo.com', 'password'],
]);

function generateResetCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Request a password reset for an email address
 * @returns { code: string, message: string } - Reset code and message (code only shown in demo)
 */
export function requestPasswordReset(email: string): { success: boolean; message: string; code?: string } {
  // Check if email exists in mock users or merchants
  const userExists = email === 'user@demo.com' || MOCK_MERCHANTS.some(m => m.email === email) || 
                     MOCK_PASSWORDS.has(email);
  
  if (!userExists) {
    // For security, don't reveal if email exists
    return { success: true, message: 'If an account with this email exists, you will receive a reset link.' };
  }

  // Check rate limiting - prevent multiple requests in short time
  const lastRequest = passwordResetRequests.get(email);
  if (lastRequest && Date.now() - lastRequest < RESET_REQUEST_COOLDOWN) {
    return { 
      success: false, 
      message: `Please wait ${Math.ceil((RESET_REQUEST_COOLDOWN - (Date.now() - lastRequest)) / 1000)} seconds before requesting again.` 
    };
  }

  // Generate reset code
  const code = generateResetCode();
  const expiresAt = Date.now() + RESET_CODE_EXPIRY;

  // Store reset token
  passwordResetTokens.set(code, {
    code,
    email,
    expiresAt,
    used: false,
  });

  // Update last request timestamp
  passwordResetRequests.set(email, Date.now());

  // In a real app, send email here
  // For demo, log to console
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 PASSWORD RESET REQUEST (DEMO MODE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: ${email}
Reset Code: ${code}
Expires At: ${new Date(expiresAt).toLocaleString()}
Reset Link: ${typeof window !== 'undefined' ? `${window.location.origin}/reset-password/${code}` : 'N/A'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);

  return { 
    success: true, 
    message: 'Password reset link sent to your email!',
    code // Return code for demo purposes
  };
}

/**
 * Validate a password reset code
 */
export function validateResetCode(code: string): { valid: boolean; email?: string; message: string } {
  const token = passwordResetTokens.get(code);

  if (!token) {
    return { valid: false, message: 'Invalid reset code.' };
  }

  if (token.used) {
    return { valid: false, message: 'This reset code has already been used.' };
  }

  if (Date.now() > token.expiresAt) {
    return { valid: false, message: 'This reset code has expired.' };
  }

  return { valid: true, email: token.email, message: 'Reset code is valid.' };
}

/**
 * Reset password with valid reset code
 */
export function resetPassword(code: string, newPassword: string): { success: boolean; message: string } {
  const validation = validateResetCode(code);

  if (!validation.valid) {
    return { success: false, message: validation.message };
  }

  if (!validation.email) {
    return { success: false, message: 'Invalid reset code.' };
  }

  // Update password
  MOCK_PASSWORDS.set(validation.email, newPassword);

  // Mark token as used
  const token = passwordResetTokens.get(code);
  if (token) {
    token.used = true;
  }

  return { 
    success: true, 
    message: 'Password reset successful! You can now login with your new password.' 
  };
}

/**
 * Validate login credentials (used for password verification)
 */
export function validateCredentials(email: string, password: string): boolean {
  const storedPassword = MOCK_PASSWORDS.get(email);
  return storedPassword === password;
}

/**
 * Get all active reset tokens (admin/debug only)
 */
export function getActiveResetTokens(): PasswordResetToken[] {
  const now = Date.now();
  return Array.from(passwordResetTokens.values()).filter(
    token => !token.used && token.expiresAt > now
  );
}

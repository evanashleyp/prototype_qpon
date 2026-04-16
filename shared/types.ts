/**
 * Shared Type Definitions for CouponHub
 * Used by both frontend and backend
 */

export type UserRole = 'user' | 'merchant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface CouponItem {
  id: string;
  coupon_id: string;
  item_name: string;
  quantity: number;
}

export interface Coupon {
  id: string;
  merchant_id: string;
  merchant_name: string;
  title: string;
  description: string;
  price: number;
  discount_percentage: number;
  expiration_date: string;
  stock: number;
  items: CouponItem[];
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  coupon_id: string;
  purchase_date: string;
}

export interface UserCoupon {
  id: string;
  transaction_id: string;
  coupon: Coupon;
  qr_code: string;
  is_redeemed: boolean;
  redeemed_at: string | null;
  expires_at: string;
  price_bought_at: number;
}

export interface PasswordResetToken {
  code: string;
  email: string;
  expiresAt: number;
  used: boolean;
}

export interface PasswordResetRequest {
  email: string;
  timestamp: number;
}

// === API Response/Request Types ===

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface AuthRegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthRegisterResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  code?: string; // Only for demo mode
}

export interface ValidateResetCodeRequest {
  code: string;
}

export interface ValidateResetCodeResponse {
  success: boolean;
  message: string;
  valid: boolean;
}

export interface ResetPasswordRequest {
  code: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface CreateCouponRequest {
  title: string;
  description: string;
  price: number;
  discount_percentage: number;
  expiration_date: string;
  stock: number;
  items: Array<{ item_name: string; quantity: number }>;
}

export interface CreateCouponResponse {
  success: boolean;
  message: string;
  coupon?: Coupon;
}

export interface PurchaseCouponRequest {
  coupon_id: string;
}

export interface PurchaseCouponResponse {
  success: boolean;
  message: string;
  coupon?: UserCoupon;
}

export interface RedeemCouponRequest {
  qr_code: string;
}

export interface RedeemCouponResponse {
  success: boolean;
  message: string;
  coupon?: UserCoupon;
}

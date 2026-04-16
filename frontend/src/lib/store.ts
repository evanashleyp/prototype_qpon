/**
 * Frontend Store - API Integration Layer
 * Wraps API client functions and manages authentication state
 */

import {
  apiLogin,
  apiRegister,
  apiGetCoupons,
  apiGetCoupon,
  apiCreateCoupon,
  apiDeleteCoupon,
  apiPurchaseCoupon,
  apiRedeemCoupon,
  apiGetUserCoupons,
  apiGetUserProfile,
  apiForgotPassword,
  apiValidateResetCode,
  apiResetPassword,
  apiLogout as apiLogoutCall,
  apiValidateToken,
} from './api';
import { Coupon, User, UserCoupon, Transaction, CouponItem, PasswordResetToken } from './types';

// ===== Authentication Management =====

let currentUser: User | null = null;

/**
 * Get current authenticated user
 */
export function getCurrentUser(): User | null {
  if (!currentUser) {
    // Try to restore from session storage
    const stored = sessionStorage.getItem('current_user');
    if (stored) {
      try {
        currentUser = JSON.parse(stored);
      } catch {
        currentUser = null;
      }
    }
  }
  return currentUser;
}

/**
 * Set current user and persist to session storage
 */
function setCurrentUser(user: User | null): void {
  currentUser = user;
  if (user) {
    sessionStorage.setItem('current_user', JSON.stringify(user));
  } else {
    sessionStorage.removeItem('current_user');
  }
}

// ===== Authentication =====

/**
 * Login user with email and password
 * Calls the backend API and stores authentication state
 */
export async function login(email: string, password: string): Promise<User | null> {
  try {
    const response = await apiLogin(email, password);
    if (response.user && response.token) {
      setCurrentUser(response.user);
      return response.user;
    }
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

/**
 * Register new user
 * Calls the backend API and stores authentication state
 */
export async function register(
  name: string,
  email: string,
  password: string,
  role: 'user' | 'merchant'
): Promise<User | null> {
  try {
    const response = await apiRegister(name, email, password, role);
    if (response.user && response.token) {
      setCurrentUser(response.user);
      return response.user;
    }
    return null;
  } catch (error) {
    console.error('Register error:', error);
    return null;
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  await apiLogoutCall();
  setCurrentUser(null);
}

// ===== Coupons =====

/**
 * Get all available coupons from the backend
 * Filters out expired and out-of-stock items
 */
export async function getCoupons(filters?: { search?: string; merchant?: string }): Promise<Coupon[]> {
  try {
    const response = await apiGetCoupons(filters);
    return response.coupons || [];
  } catch (error) {
    console.error('Get coupons error:', error);
    return [];
  }
}

/**
 * Get a specific coupon by ID
 */
export async function getCoupon(id: string): Promise<Coupon | null> {
  try {
    const response = await apiGetCoupon(id);
    return response.coupon || null;
  } catch (error) {
    console.error('Get coupon error:', error);
    return null;
  }
}

/**
 * Get coupons for the current merchant
 */
export async function getMerchantCoupons(): Promise<Coupon[]> {
  try {
    const user = getCurrentUser();
    if (!user || user.role !== 'merchant') {
      return [];
    }
    const response = await apiGetCoupons({ merchant: user.id });
    return response.coupons || [];
  } catch (error) {
    console.error('Get merchant coupons error:', error);
    return [];
  }
}

/**
 * Create a new coupon (merchant only)
 */
export async function createCoupon(data: {
  title: string;
  description: string;
  price: number;
  discount_percentage: number;
  expiration_date: string;
  stock: number;
  items: Array<{ item_name: string; quantity: number }>;
}): Promise<Coupon | null> {
  try {
    const response = await apiCreateCoupon(data);
    return response.coupon || null;
  } catch (error) {
    console.error('Create coupon error:', error);
    return null;
  }
}

/**
 * Delete a coupon (merchant only)
 */
export async function deleteCoupon(id: string): Promise<boolean> {
  try {
    const response = await apiDeleteCoupon(id);
    return response.success;
  } catch (error) {
    console.error('Delete coupon error:', error);
    return false;
  }
}

// ===== Purchase & Redemption =====

/**
 * Purchase a coupon
 */
export async function purchaseCoupon(couponId: string): Promise<UserCoupon | null> {
  try {
    const response = await apiPurchaseCoupon(couponId);
    return response.coupon || null;
  } catch (error) {
    console.error('Purchase coupon error:', error);
    return null;
  }
}

/**
 * Get user's purchased coupons
 */
export async function getUserCoupons(): Promise<UserCoupon[]> {
  try {
    const response = await apiGetUserCoupons();
    return response.coupons || [];
  } catch (error) {
    console.error('Get user coupons error:', error);
    return [];
  }
}

/**
 * Redeem a coupon with QR code
 */
export async function redeemCoupon(
  qrCode: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiRedeemCoupon(qrCode);
    return {
      success: response.success,
      message: response.message || 'Coupon redeemed successfully!',
    };
  } catch (error) {
    console.error('Redeem coupon error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to redeem coupon',
    };
  }
}

// ===== Password Reset =====

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string; code?: string }> {
  try {
    const response = await apiForgotPassword(email);
    return {
      success: response.success,
      message: response.message,
      code: response.code,
    };
  } catch (error) {
    console.error('Password reset request error:', error);
    return {
      success: false,
      message: 'Failed to request password reset',
    };
  }
}

/**
 * Validate password reset code
 */
export async function validateResetCode(code: string): Promise<{ valid: boolean; email?: string; message: string }> {
  try {
    const response = await apiValidateResetCode(code);
    return {
      valid: response.valid,
      message: response.message,
    };
  } catch (error) {
    console.error('Validate reset code error:', error);
    return {
      valid: false,
      message: 'Failed to validate reset code',
    };
  }
}

/**
 * Reset password with code
 */
export async function resetPassword(code: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiResetPassword(code, newPassword);
    return {
      success: response.success,
      message: response.message,
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      message: 'Failed to reset password',
    };
  }
}

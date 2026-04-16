/**
 * Frontend API Client
 * Handles all HTTP communication with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class APIError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  // Add JWT token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Set JSON content type by default
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json() as Record<string, unknown>;

    if (!response.ok) {
      throw new APIError(
        response.status,
        (data.code as string) || response.statusText,
        (data.message as string) || 'API request failed'
      );
    }

    return data as T;
  } catch (err) {
    if (err instanceof APIError) {
      throw err;
    }

    // Handle network errors
    if (err instanceof TypeError) {
      throw new APIError(0, 'NETWORK_ERROR', 'Failed to connect to server');
    }

    throw new APIError(500, 'UNKNOWN_ERROR', 'An unexpected error occurred');
  }
}

// ===== Authentication APIs =====

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: { id: string; email: string; name: string; role: 'user' | 'merchant' };
  token?: string;
}

export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
  const response = await fetchAPI<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  // Store token if successful
  if (response.token) {
    localStorage.setItem('auth_token', response.token);
  }

  return response;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: { id: string; email: string; name: string; role: 'user' | 'merchant' };
  token?: string;
}

export async function apiRegister(
  name: string,
  email: string,
  password: string,
  role: 'user' | 'merchant'
): Promise<RegisterResponse> {
  const response = await fetchAPI<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role }),
  });

  // Store token if successful
  if (response.token) {
    localStorage.setItem('auth_token', response.token);
  }

  return response;
}

export async function apiValidateToken(): Promise<{ success: boolean; user?: unknown }> {
  return fetchAPI('/auth/validate-token', {
    method: 'POST',
  });
}

export async function apiLogout(): Promise<void> {
  localStorage.removeItem('auth_token');
}

// ===== Password Reset APIs =====

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  code?: string; // Demo mode only
}

export async function apiForgotPassword(email: string): Promise<ForgotPasswordResponse> {
  return fetchAPI('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export interface ValidateResetCodeResponse {
  success: boolean;
  message: string;
  valid: boolean;
}

export async function apiValidateResetCode(code: string): Promise<ValidateResetCodeResponse> {
  return fetchAPI('/auth/validate-reset-code', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export async function apiResetPassword(code: string, newPassword: string): Promise<ResetPasswordResponse> {
  return fetchAPI('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ code, newPassword }),
  });
}

// ===== Coupon APIs =====

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
  items: Array<{ id: string; item_name: string; quantity: number }>;
  created_at: string;
}

export interface GetCouponsResponse {
  success: boolean;
  coupons: Coupon[];
  total?: number;
}

export async function apiGetCoupons(filters?: Record<string, string | number>): Promise<GetCouponsResponse> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      params.append(key, String(value));
    });
  }

  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchAPI(`/coupons${query}`);
}

export async function apiGetCoupon(id: string): Promise<{ success: boolean; coupon?: Coupon }> {
  return fetchAPI(`/coupons/${id}`);
}

export interface CreateCouponResponse {
  success: boolean;
  message: string;
  coupon?: Coupon;
}

export async function apiCreateCoupon(data: {
  title: string;
  description: string;
  price: number;
  discount_percentage: number;
  expiration_date: string;
  stock: number;
  items: Array<{ item_name: string; quantity: number }>;
}): Promise<CreateCouponResponse> {
  return fetchAPI('/coupons', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiDeleteCoupon(id: string): Promise<{ success: boolean; message: string }> {
  return fetchAPI(`/coupons/${id}`, {
    method: 'DELETE',
  });
}

export interface UserCoupon {
  id: string;
  transaction_id: string;
  coupon: Coupon;
  qr_code: string;
  is_redeemed: boolean;
  redeemed_at?: string;
  expires_at: string;
  price_bought_at: number;
}

export interface PurchaseCouponResponse {
  success: boolean;
  message: string;
  coupon?: UserCoupon;
}

export async function apiPurchaseCoupon(couponId: string): Promise<PurchaseCouponResponse> {
  return fetchAPI(`/coupons/${couponId}/purchase`, {
    method: 'POST',
  });
}

export interface RedeemCouponResponse {
  success: boolean;
  message: string;
  coupon?: UserCoupon;
}

export async function apiRedeemCoupon(qrCode: string): Promise<RedeemCouponResponse> {
  return fetchAPI(`/coupons/${qrCode}/redeem`, {
    method: 'POST',
  });
}

// ===== User APIs =====

export interface GetUserCouponsResponse {
  success: boolean;
  coupons: UserCoupon[];
}

export async function apiGetUserCoupons(): Promise<GetUserCouponsResponse> {
  return fetchAPI('/users/coupons');
}

export interface GetUserProfileResponse {
  success: boolean;
  user?: { id: string; email: string; name: string; role: 'user' | 'merchant' };
}

export async function apiGetUserProfile(): Promise<GetUserProfileResponse> {
  return fetchAPI('/users/profile');
}

export interface MerchantStats {
  success: boolean;
  totalCoupons: number;
  totalSales: number;
  totalRevenue: number;
  coupons?: Coupon[];
}

export async function apiGetMerchantStats(): Promise<MerchantStats> {
  return fetchAPI('/users/merchant-stats');
}

export { APIError };

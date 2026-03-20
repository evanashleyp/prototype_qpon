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
  price_bought_at: number; // New field to store the price at which the coupon was bought
}

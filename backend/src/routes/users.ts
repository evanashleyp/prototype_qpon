import { Router, Response } from 'express';
import pool from '../config/database.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { RowDataPacket } from 'mysql2';

const router = Router();

/**
 * GET /api/users/coupons
 * Get all coupons purchased by the user
 */
router.get('/coupons', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const connection = await pool.getConnection();

    try {
      // Get user coupons
      const [userCoupons] = await connection.query<RowDataPacket[]>(
        `
        SELECT 
          uc.id, uc.transaction_id, uc.coupon_id, uc.qr_code, 
          uc.is_redeemed, uc.redeemed_at, uc.expires_at, uc.price_bought_at,
          c.id as coupon_id, c.merchant_id, c.title, c.description, c.price, 
          c.discount_percentage, c.expiration_date, c.stock, c.created_at,
          u.name as merchant_name
        FROM user_coupons uc
        JOIN coupons c ON uc.coupon_id = c.id
        JOIN merchants m ON c.merchant_id = m.id
        JOIN users u ON m.user_id = u.id
        WHERE uc.user_id = ?
        ORDER BY uc.created_at DESC
        `,
        [req.user?.id]
      );

      // Get coupon items for each coupon
      const couponsWithItems = await Promise.all(
        Array.isArray(userCoupons)
          ? userCoupons.map(async (uc: RowDataPacket) => {
              const [items] = await connection.query(
                'SELECT id, coupon_id, item_name, quantity FROM coupon_items WHERE coupon_id = ?',
                [uc.coupon_id]
              );
              return {
                id: uc.id,
                transaction_id: uc.transaction_id,
                qr_code: uc.qr_code,
                is_redeemed: uc.is_redeemed,
                redeemed_at: uc.redeemed_at,
                expires_at: uc.expires_at,
                price_bought_at: uc.price_bought_at,
                coupon: {
                  id: uc.coupon_id,
                  merchant_id: uc.merchant_id,
                  merchant_name: uc.merchant_name,
                  title: uc.title,
                  description: uc.description,
                  price: uc.price,
                  discount_percentage: uc.discount_percentage,
                  expiration_date: uc.expiration_date,
                  stock: uc.stock,
                  created_at: uc.created_at,
                  items: Array.isArray(items) ? items : [],
                },
              };
            })
          : []
      );

      res.json({
        success: true,
        coupons: couponsWithItems,
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Get user coupons error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * GET /api/users/profile
 * Get current user's profile
 */
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const connection = await pool.getConnection();

    try {
      // Get user profile
      const [users] = await connection.query(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
        [req.user?.id]
      );

      if (!Array.isArray(users) || users.length === 0) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const user = users[0];

      res.json({
        success: true,
        user,
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Get user profile error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * GET /api/users/merchant-stats
 * Get merchant statistics and coupon info (merchant only)
 */
router.get('/merchant-stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is merchant
    if (req.user?.role !== 'merchant') {
      res.status(403).json({
        success: false,
        message: 'Merchant access required',
      });
      return;
    }

    const connection = await pool.getConnection();

    try {
      // Get merchant ID
      const [merchants] = await connection.query(
        'SELECT id FROM merchants WHERE user_id = ?',
        [req.user?.id]
      );

      if (!Array.isArray(merchants) || merchants.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Merchant not found',
        });
        return;
      }

      const merchantId = (merchants[0] as { id: string }).id;

      // Get all merchant coupons
      const [coupons] = await connection.query(
        `
        SELECT 
          c.id, c.merchant_id, c.title, c.description, c.price, 
          c.discount_percentage, c.expiration_date, c.stock, c.created_at,
          u.name as merchant_name
        FROM coupons c
        JOIN merchants m ON c.merchant_id = m.id
        JOIN users u ON m.user_id = u.id
        WHERE c.merchant_id = ?
        ORDER BY c.created_at DESC
        `,
        [merchantId]
      );

      // Get coupon items and stats
      const couponsWithItems = await Promise.all(
        Array.isArray(coupons)
          ? (coupons as any[]).map(async (coupon: any) => {
              const [items] = await connection.query(
                'SELECT id, coupon_id, item_name, quantity FROM coupon_items WHERE coupon_id = ?',
                [coupon.id]
              );

              const [sales] = await connection.query(
                'SELECT COUNT(*) as count FROM transactions WHERE coupon_id = ?',
                [coupon.id]
              );

              return {
                ...coupon,
                items: Array.isArray(items) ? items : [],
                sales_count: Array.isArray(sales) ? (sales[0] as { count: number }).count : 0,
              };
            })
          : []
      );

      // Calculate stats
      const totalCoupons = (couponsWithItems as unknown[]).length;
      const totalSales = couponsWithItems.reduce((sum, c) => sum + (c.sales_count || 0), 0);
      const totalRevenue = couponsWithItems.reduce(
        (sum, c) => sum + ((c.price || 0) * (c.sales_count || 0)),
        0
      );

      res.json({
        success: true,
        totalCoupons,
        totalSales,
        totalRevenue: totalRevenue.toFixed(2),
        coupons: couponsWithItems,
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Get merchant stats error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;

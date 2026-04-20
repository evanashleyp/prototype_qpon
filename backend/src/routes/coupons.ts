import { Router, Response, Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { AuthRequest, authMiddleware, merchantOnly } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/coupons
 * Get all coupons with optional filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string) || '';
    const merchant = (req.query.merchant as string) || '';
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const connection = await pool.getConnection();

    try {
      let query = `
        SELECT 
          c.id, c.merchant_id, c.title, c.description, c.price, 
          c.discount_percentage, c.expiration_date, c.stock, c.created_at,
          u.name as merchant_name
        FROM coupons c
        JOIN merchants m ON c.merchant_id = m.id
        JOIN users u ON m.user_id = u.id
        WHERE c.expiration_date > NOW() AND c.stock > 0
      `;

      const params: unknown[] = [];

      if (search) {
        query += ` AND (c.title LIKE ? OR c.description LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }

      if (merchant) {
        query += ` AND u.name LIKE ?`;
        params.push(`%${merchant}%`);
      }

      query += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const [coupons] = await connection.query(query, params);

      // Get coupon items for each coupon
      const couponsWithItems = await Promise.all(
        Array.isArray(coupons)
          ? (coupons as any[]).map(async (coupon: any) => {
              const [items] = await connection.query(
                'SELECT id, coupon_id, item_name, quantity FROM coupon_items WHERE coupon_id = ?',
                [coupon.id]
              );
              return {
                ...coupon,
                items: Array.isArray(items) ? items : [],
              };
            })
          : []
      );

      res.json({
        success: true,
        coupons: couponsWithItems,
        total: (couponsWithItems as unknown[]).length,
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Get coupons error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * GET /api/coupons/:id
 * Get single coupon by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();

    try {
      const [coupons] = await connection.query(
        `
        SELECT 
          c.id, c.merchant_id, c.title, c.description, c.price, 
          c.discount_percentage, c.expiration_date, c.stock, c.created_at,
          u.name as merchant_name
        FROM coupons c
        JOIN merchants m ON c.merchant_id = m.id
        JOIN users u ON m.user_id = u.id
        WHERE c.id = ?
        `,
        [id]
      );

      if (!Array.isArray(coupons) || coupons.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Coupon not found',
        });
        return;
      }

      const coupon = coupons[0];

      // Get coupon items
      const [items] = await connection.query(
        'SELECT id, coupon_id, item_name, quantity FROM coupon_items WHERE coupon_id = ?',
        [id]
      );

      res.json({
        success: true,
        coupon: {
          ...coupon,
          items: Array.isArray(items) ? items : [],
        },
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Get coupon error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * POST /api/coupons
 * Create new coupon (merchant only)
 */
router.post('/', authMiddleware, merchantOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, price, discount_percentage, expiration_date, stock, items } = req.body;

    // Validate request body
    if (!title || !description || !price || discount_percentage === undefined || !expiration_date || stock === undefined) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
      return;
    }

    const connection = await pool.getConnection();

    try {
      // Get merchant ID for this user
      const [merchants] = await connection.query(
        'SELECT id FROM merchants WHERE user_id = ?',
        [req.user?.id]
      );

      if (!Array.isArray(merchants) || merchants.length === 0) {
        res.status(403).json({
          success: false,
          message: 'User is not a merchant',
        });
        return;
      }

      const merchantId = (merchants[0] as { id: string }).id;
      const couponId = uuidv4();

      // Create coupon
      await connection.query(
        `
        INSERT INTO coupons 
        (id, merchant_id, title, description, price, discount_percentage, expiration_date, stock) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [couponId, merchantId, title, description, price, discount_percentage, expiration_date, stock]
      );

      // Create coupon items
      if (Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          const itemId = uuidv4();
          await connection.query(
            'INSERT INTO coupon_items (id, coupon_id, item_name, quantity) VALUES (?, ?, ?, ?)',
            [itemId, couponId, item.item_name, item.quantity]
          );
        }
      }

      res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        coupon: {
          id: couponId,
          merchant_id: merchantId,
          title,
          description,
          price,
          discount_percentage,
          expiration_date,
          stock,
          items: Array.isArray(items) ? items : [],
          created_at: new Date().toISOString(),
        },
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Create coupon error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * DELETE /api/coupons/:id
 * Delete coupon (merchant only)
 */
router.delete('/:id', authMiddleware, merchantOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();

    try {
      // Get merchant ID for this user
      const [merchants] = await connection.query(
        'SELECT id FROM merchants WHERE user_id = ?',
        [req.user?.id]
      );

      if (!Array.isArray(merchants) || merchants.length === 0) {
        res.status(403).json({
          success: false,
          message: 'User is not a merchant',
        });
        return;
      }

      const merchantId = (merchants[0] as { id: string }).id;

      // Verify merchant owns this coupon
      const [coupons] = await connection.query(
        'SELECT id FROM coupons WHERE id = ? AND merchant_id = ?',
        [id, merchantId]
      );

      if (!Array.isArray(coupons) || coupons.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Coupon not found or you do not have permission to delete it',
        });
        return;
      }

      // Delete coupon (cascades to items)
      await connection.query('DELETE FROM coupons WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Coupon deleted successfully',
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Delete coupon error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * PUT /api/coupons/:id
 * Update coupon (merchant only)
 */
router.put('/:id', authMiddleware, merchantOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, price, discount_percentage: discountPercentage, expiration_date: expirationDate, stock, items } = req.body;

    // Validate request body
    if (!title || !description || price === undefined || discountPercentage === undefined || !expirationDate || stock === undefined) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
      return;
    }

    const connection = await pool.getConnection();

    try {
      // Get merchant ID for this user
      const [merchants] = await connection.query(
        'SELECT id FROM merchants WHERE user_id = ?',
        [req.user?.id]
      );

      if (!Array.isArray(merchants) || merchants.length === 0) {
        res.status(403).json({
          success: false,
          message: 'User is not a merchant',
        });
        return;
      }

      const merchantId = (merchants[0] as { id: string }).id;

      // Verify merchant owns this coupon
      const [coupons] = await connection.query(
        'SELECT id FROM coupons WHERE id = ? AND merchant_id = ?',
        [id, merchantId]
      );

      if (!Array.isArray(coupons) || coupons.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Coupon not found or you do not have permission to edit it',
        });
        return;
      }

      // Update coupon
      await connection.query(
        `
        UPDATE coupons 
        SET title = ?, description = ?, price = ?, discount_percentage = ?, expiration_date = ?, stock = ?
        WHERE id = ?
        `,
        [title, description, price, discountPercentage, expirationDate, stock, id]
      );

      // Delete existing items
      await connection.query('DELETE FROM coupon_items WHERE coupon_id = ?', [id]);

      // Create new coupon items
      if (Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          const itemId = uuidv4();
          await connection.query(
            'INSERT INTO coupon_items (id, coupon_id, item_name, quantity) VALUES (?, ?, ?, ?)',
            [itemId, id, item.item_name, item.quantity]
          );
        }
      }

      // Fetch updated coupon
      const [updatedCoupons] = await connection.query(
        'SELECT id, merchant_id, title, description, price, discount_percentage, expiration_date, stock, created_at FROM coupons WHERE id = ?',
        [id]
      );

      // Fetch items
      const [updatedItems] = await connection.query(
        'SELECT id, coupon_id, item_name, quantity FROM coupon_items WHERE coupon_id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Coupon updated successfully',
        coupon: {
          ...(Array.isArray(updatedCoupons) && updatedCoupons.length > 0 ? updatedCoupons[0] : {}),
          items: Array.isArray(updatedItems) ? updatedItems : [],
        },
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Update coupon error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * POST /api/coupons/:id/purchase
 * Purchase coupon (creates transaction and user coupon)
 */
router.post('/:id/purchase', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();

    try {
      // Get coupon details
      const [coupons] = await connection.query(
        'SELECT id, price, stock FROM coupons WHERE id = ?',
        [id]
      );

      if (!Array.isArray(coupons) || coupons.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Coupon not found',
        });
        return;
      }

      const coupon = coupons[0] as { id: string; price: number; stock: number };

      // Check if coupon has stock
      if (coupon.stock <= 0) {
        res.status(400).json({
          success: false,
          message: 'Coupon is out of stock',
        });
        return;
      }

      // Create transaction
      const transactionId = uuidv4();
      await connection.query(
        'INSERT INTO transactions (id, user_id, coupon_id, price_bought_at) VALUES (?, ?, ?, ?)',
        [transactionId, req.user?.id, id, coupon.price]
      );

      // Create user coupon with unique QR code
      const userCouponId = uuidv4();
      const qrCode = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

      await connection.query(
        `
        INSERT INTO user_coupons 
        (id, transaction_id, user_id, coupon_id, qr_code, is_redeemed, expires_at) 
        VALUES (?, ?, ?, ?, ?, FALSE, ?)
        `,
        [userCouponId, transactionId, req.user?.id, id, qrCode, expiresAt]
      );

      // Decrement coupon stock
      await connection.query(
        'UPDATE coupons SET stock = stock - 1 WHERE id = ?',
        [id]
      );

      // Get full coupon details for response
      const [fullCoupons] = await connection.query(
        `
        SELECT 
          c.id, c.merchant_id, c.title, c.description, c.price, 
          c.discount_percentage, c.expiration_date, c.stock, c.created_at,
          u.name as merchant_name
        FROM coupons c
        JOIN merchants m ON c.merchant_id = m.id
        JOIN users u ON m.user_id = u.id
        WHERE c.id = ?
        `,
        [id]
      );

      const fullCoupon = Array.isArray(fullCoupons) ? fullCoupons[0] : null;

      const [items] = await connection.query(
        'SELECT id, coupon_id, item_name, quantity FROM coupon_items WHERE coupon_id = ?',
        [id]
      );

      res.status(201).json({
        success: true,
        message: 'Coupon purchased successfully',
        coupon: {
          id: userCouponId,
          transaction_id: transactionId,
          user_id: req.user?.id,
          coupon_id: id,
          coupon: {
            ...fullCoupon,
            items: Array.isArray(items) ? items : [],
          },
          qr_code: qrCode,
          is_redeemed: false,
          redeemed_at: null,
          expires_at: expiresAt.toISOString(),
          price_bought_at: coupon.price,
        },
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Purchase coupon error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * POST /api/coupons/:qrcode/redeem
 * Redeem coupon by QR code (merchant only)
 */
router.post('/:qrcode/redeem', authMiddleware, merchantOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { qrcode } = req.params;

    const connection = await pool.getConnection();

    try {
      // Get merchant ID for this user
      const [merchants] = await connection.query(
        'SELECT id FROM merchants WHERE user_id = ?',
        [req.user?.id]
      );

      if (!Array.isArray(merchants) || merchants.length === 0) {
        res.status(403).json({
          success: false,
          message: 'User is not a merchant',
        });
        return;
      }

      // Find user coupon by QR code
      const [userCoupons] = await connection.query(
        `
        SELECT 
          uc.id, uc.transaction_id, uc.user_id, uc.coupon_id, uc.qr_code, 
          uc.is_redeemed, uc.redeemed_at, uc.expires_at, t.price_bought_at
        FROM user_coupons uc
        JOIN transactions t ON uc.transaction_id = t.id
        WHERE uc.qr_code = ?
        `,
        [qrcode]
      );

      if (!Array.isArray(userCoupons) || userCoupons.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Coupon not found',
        });
        return;
      }

      const userCoupon = userCoupons[0] as Record<string, unknown>;

      // Check if already redeemed
      if (userCoupon.is_redeemed) {
        res.status(400).json({
          success: false,
          message: 'Coupon has already been redeemed',
        });
        return;
      }

      // Check if expired
      const now = new Date();
      const expiresAt = new Date(userCoupon.expires_at as string);
      if (now > expiresAt) {
        res.status(400).json({
          success: false,
          message: 'Coupon has expired',
        });
        return;
      }

      // Mark as redeemed
      const redeemedAt = new Date();
      await connection.query(
        'UPDATE user_coupons SET is_redeemed = TRUE, redeemed_at = ?, redeemed_by_merchant_id = ? WHERE qr_code = ?',
        [redeemedAt, (merchants[0] as { id: string }).id, qrcode]
      );

      // Get full coupon details
      const [fullCoupons] = await connection.query(
        `
        SELECT 
          c.id, c.merchant_id, c.title, c.description, c.price, 
          c.discount_percentage, c.expiration_date, c.stock, c.created_at,
          u.name as merchant_name
        FROM coupons c
        JOIN merchants m ON c.merchant_id = m.id
        JOIN users u ON m.user_id = u.id
        WHERE c.id = ?
        `,
        [userCoupon.coupon_id]
      );

      const fullCoupon = Array.isArray(fullCoupons) ? fullCoupons[0] : null;

      const [items] = await connection.query(
        'SELECT id, coupon_id, item_name, quantity FROM coupon_items WHERE coupon_id = ?',
        [userCoupon.coupon_id]
      );

      res.json({
        success: true,
        message: 'Coupon redeemed successfully',
        coupon: {
          id: userCoupon.id,
          transaction_id: userCoupon.transaction_id,
          coupon: {
            ...fullCoupon,
            items: Array.isArray(items) ? items : [],
          },
          qr_code: userCoupon.qr_code,
          is_redeemed: true,
          redeemed_at: redeemedAt.toISOString(),
          expires_at: userCoupon.expires_at,
          price_bought_at: userCoupon.price_bought_at,
        },
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Redeem coupon error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;

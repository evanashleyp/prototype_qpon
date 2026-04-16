import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../config/database.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { sendPasswordResetEmail, logPasswordResetDemo } from '../services/email.js';

dotenv.config();

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRY = '7d';

/**
 * POST /api/auth/register
 * Register a new user or merchant
 */
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate request body
    if (!name || !email || !password || !role) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: name, email, password, role',
      });
      return;
    }

    if (!['user', 'merchant'].includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Role must be either "user" or "merchant"',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
      return;
    }

    const connection = await pool.getConnection();

    try {
      // Check if email already exists
      const [existingUser] = await connection.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (Array.isArray(existingUser) && existingUser.length > 0) {
        res.status(409).json({
          success: false,
          message: 'Email already registered',
        });
        return;
      }

      // Hash password
      const passwordHash = await bcryptjs.hash(password, 10);
      const userId = uuidv4();

      // Create user
      await connection.query(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [userId, name, email, passwordHash, role]
      );

      // If merchant, create merchant record
      if (role === 'merchant') {
        const merchantId = uuidv4();
        await connection.query(
          'INSERT INTO merchants (id, user_id, business_name) VALUES (?, ?, ?)',
          [merchantId, userId, name]
        );
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: userId, email, role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: { id: userId, name, email, role, created_at: new Date().toISOString() },
        token,
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * POST /api/auth/login
 * Login user with email and password
 */
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: email, password',
      });
      return;
    }

    const connection = await pool.getConnection();

    try {
      // Find user by email
      const [users] = await connection.query(
        'SELECT id, name, email, password_hash, role FROM users WHERE email = ?',
        [email]
      );

      if (!Array.isArray(users) || users.length === 0) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      const user = users[0] as { id: string; name: string; email: string; password_hash: string; role: string };

      // Compare password
      const passwordMatch = await bcryptjs.compare(password, user.password_hash);

      if (!passwordMatch) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * POST /api/auth/validate-token
 * Validate JWT token
 */
router.post('/validate-token', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      success: true,
      message: 'Token is valid',
      user: req.user,
    });
  } catch (err) {
    console.error('Token validation error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset email
 */
router.post('/forgot-password', async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;

    // Validate request body
    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required',
      });
      return;
    }

    const connection = await pool.getConnection();

    try {
      // Check if user exists
      const [users] = await connection.query(
        'SELECT id, name FROM users WHERE email = ?',
        [email]
      );

      // For security, return success even if email doesn't exist
      if (!Array.isArray(users) || users.length === 0) {
        res.json({
          success: true,
          message: 'If an account with this email exists, a reset link has been sent.',
        });
        return;
      }

      const user = users[0] as { id: string; name: string };

      // Generate reset code
      const resetCode = uuidv4().replace(/-/g, '').substring(0, 6).toUpperCase();
      const expiresAt = Date.now() + 3600000; // 1 hour

      // Store reset token
      await connection.query(
        'INSERT INTO password_reset_tokens (code, email, expires_at, used) VALUES (?, ?, ?, FALSE)',
        [resetCode, email, Math.floor(expiresAt / 1000)]
      );

      // Get frontend base URL
      const baseUrl = req.headers.origin || 'http://localhost:5173';

      // Send email
      const emailSent = await sendPasswordResetEmail(email, resetCode, user.name, baseUrl);

      if (!emailSent && process.env.NODE_ENV === 'production') {
        res.status(500).json({
          success: false,
          message: 'Failed to send password reset email',
        });
        return;
      }

      // In demo mode, log the code
      logPasswordResetDemo(email, resetCode, user.name, baseUrl);

      res.json({
        success: true,
        message: 'Password reset link has been sent to your email',
        code: resetCode, // Demo mode - remove in production
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * POST /api/auth/validate-reset-code
 * Validate password reset code
 */
router.post('/validate-reset-code', async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;

    // Validate request body
    if (!code) {
      res.status(400).json({
        success: false,
        message: 'Reset code is required',
      });
      return;
    }

    const connection = await pool.getConnection();

    try {
      // Find reset token
      const [tokens] = await connection.query(
        'SELECT code, email, expires_at, used FROM password_reset_tokens WHERE code = ?',
        [code]
      );

      if (!Array.isArray(tokens) || tokens.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Invalid reset code',
          valid: false,
        });
        return;
      }

      const token = tokens[0] as { code: string; email: string; expires_at: number; used: boolean };

      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (token.expires_at < now) {
        res.status(400).json({
          success: false,
          message: 'Reset code has expired',
          valid: false,
        });
        return;
      }

      // Check if token has been used
      if (token.used) {
        res.status(400).json({
          success: false,
          message: 'Reset code has already been used',
          valid: false,
        });
        return;
      }

      res.json({
        success: true,
        message: 'Reset code is valid',
        valid: true,
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Validate reset code error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with valid reset code
 */
router.post('/reset-password', async (req: AuthRequest, res: Response) => {
  try {
    const { code, newPassword } = req.body;

    // Validate request body
    if (!code || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Reset code and new password are required',
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
      return;
    }

    const connection = await pool.getConnection();

    try {
      // Find reset token
      const [tokens] = await connection.query(
        'SELECT code, email, expires_at, used FROM password_reset_tokens WHERE code = ?',
        [code]
      );

      if (!Array.isArray(tokens) || tokens.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Invalid reset code',
        });
        return;
      }

      const token = tokens[0] as { code: string; email: string; expires_at: number; used: boolean };

      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (token.expires_at < now) {
        res.status(400).json({
          success: false,
          message: 'Reset code has expired',
        });
        return;
      }

      // Check if token has been used
      if (token.used) {
        res.status(400).json({
          success: false,
          message: 'Reset code has already been used',
        });
        return;
      }

      // Hash new password
      const passwordHash = await bcryptjs.hash(newPassword, 10);

      // Update user password
      await connection.query(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [passwordHash, token.email]
      );

      // Mark token as used
      await connection.query(
        'UPDATE password_reset_tokens SET used = TRUE WHERE code = ?',
        [code]
      );

      res.json({
        success: true,
        message: 'Password has been reset successfully',
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;

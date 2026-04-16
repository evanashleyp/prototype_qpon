import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'merchant';
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ success: false, message: 'Missing authorization header' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as {
      id: string;
      email: string;
      role: 'user' | 'merchant';
    };

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export function merchantOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'merchant') {
    res.status(403).json({ success: false, message: 'Merchant access required' });
    return;
  }
  next();
}

export function userOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'user') {
    res.status(403).json({ success: false, message: 'User access required' });
    return;
  }
  next();
}

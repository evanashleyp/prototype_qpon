import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  status?: number;
  code?: string;
}

export function errorHandler(err: AppError, req: Request, res: Response, next: NextFunction): void {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  console.error(`[${new Date().toISOString()}] ${status} - ${message}`, err);

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.stack }),
  });
}

export class ValidationError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  status = 404;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  status = 401;
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ConflictError extends Error {
  status = 409;
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './helpers';
import type { ApiError } from '../types';

// Extend Express Request to include userId
export interface AuthRequest extends Request {
  userId?: string;
}

// Authentication middleware
export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error: ApiError = {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header',
        },
      };
      res.status(401).json(error);
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    if (!decoded) {
      const error: ApiError = {
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        },
      };
      res.status(401).json(error);
      return;
    }

    // Add userId to request object
    req.userId = decoded.userId;
    next();
  } catch (error) {
    const apiError: ApiError = {
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication failed',
      },
    };
    res.status(401).json(apiError);
  }
}

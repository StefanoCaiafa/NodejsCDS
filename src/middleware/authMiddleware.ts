import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ResponseBuilder } from '../utils/responseBuilder';
import { TokenBlacklistRepository } from '../core/data/TokenBlacklistRepository';

const tokenBlacklistRepository = new TokenBlacklistRepository();

export interface JwtPayload {
  userId: number;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ResponseBuilder.unauthorized(res, 'No token provided');
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const isBlacklisted = await tokenBlacklistRepository.isBlacklisted(token);
    if (isBlacklisted) {
      ResponseBuilder.unauthorized(res, 'Token has been revoked');
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      ResponseBuilder.unauthorized(res, 'Invalid token');
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      ResponseBuilder.unauthorized(res, 'Token expired');
      return;
    }

    ResponseBuilder.internalError(res, 'Authentication failed');
  }
};

import { Request, Response, NextFunction } from 'express';
import { ResponseBuilder } from '../utils/responseBuilder';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    ResponseBuilder.error(res, err.message, err.statusCode);
    return;
  }

  if (err.name === 'ValidationError') {
    ResponseBuilder.error(res, err.message, 400);
    return;
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    ResponseBuilder.unauthorized(res, 'Invalid or expired token');
    return;
  }

  ResponseBuilder.internalError(res, 'An unexpected error occurred');
};

export const notFoundHandler = (req: Request, res: Response): void => {
  ResponseBuilder.notFound(res, `Route ${req.method} ${req.url} not found`);
};

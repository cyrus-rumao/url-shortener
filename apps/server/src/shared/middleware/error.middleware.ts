import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { ApiError } from '../errors/api-error';

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors,
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
    return;
  }

  console.error('Unhandled application error:', error);

  res.status(500).json({
    success: false,
    message: 'Internal server error.',
    errors: [],
  });
};

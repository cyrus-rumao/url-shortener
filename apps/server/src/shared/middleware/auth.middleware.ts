import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../errors/api-error';
import { verifyAccessToken } from '../auth/jwt.service';

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authorizationHeader = req.header('authorization');

  if (!authorizationHeader?.startsWith('Bearer ')) {
    throw new ApiError('Authorization token is missing.', 401);
  }

  const accessToken = authorizationHeader.slice('Bearer '.length).trim();

  if (!accessToken) {
    throw new ApiError('Authorization token is missing.', 401);
  }

  const payload = verifyAccessToken(accessToken);

  req.auth = {
    userId: payload.sub,
    email: payload.email,
  };

  next();
};

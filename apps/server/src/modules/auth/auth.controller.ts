import type { Request, Response } from 'express';

import { ENV } from '../../shared/config/env';
import { ApiError } from '../../shared/errors/api-error';

import { authService } from './auth.service';
import {
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
} from './auth.validation';

const REFRESH_TOKEN_COOKIE_KEY = 'refreshToken';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: ENV.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const getRefreshTokenFromRequest = (req: Request): string => {
  const parsedBody = refreshSchema.safeParse(req.body);

  if (!parsedBody.success) {
    throw parsedBody.error;
  }

  const cookieToken = req.cookies[REFRESH_TOKEN_COOKIE_KEY];
  const bodyToken = parsedBody.data.refreshToken;

  if (typeof cookieToken === 'string' && cookieToken.length > 0) {
    return cookieToken;
  }

  if (typeof bodyToken === 'string' && bodyToken.length > 0) {
    return bodyToken;
  }

  throw new ApiError('Refresh token is required.', 400);
};

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const parsedInput = registerSchema.parse(req.body);
    const authResponse = await authService.register(parsedInput);

    res.cookie(
      REFRESH_TOKEN_COOKIE_KEY,
      authResponse.refreshToken,
      REFRESH_COOKIE_OPTIONS,
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: authResponse,
    });
  },

  async login(req: Request, res: Response): Promise<void> {
    const parsedInput = loginSchema.parse(req.body);
    const authResponse = await authService.login(parsedInput);

    res.cookie(
      REFRESH_TOKEN_COOKIE_KEY,
      authResponse.refreshToken,
      REFRESH_COOKIE_OPTIONS,
    );

    res.status(200).json({
      success: true,
      message: 'User logged in successfully.',
      data: authResponse,
    });
  },

  async refresh(req: Request, res: Response): Promise<void> {
    const refreshToken = getRefreshTokenFromRequest(req);
    const authResponse = await authService.refresh(refreshToken);

    res.cookie(
      REFRESH_TOKEN_COOKIE_KEY,
      authResponse.refreshToken,
      REFRESH_COOKIE_OPTIONS,
    );

    res.status(200).json({
      success: true,
      message: 'Tokens refreshed successfully.',
      data: authResponse,
    });
  },

  async logout(req: Request, res: Response): Promise<void> {
    const parsedBody = logoutSchema.safeParse(req.body);

    if (!parsedBody.success) {
      throw parsedBody.error;
    }

    const cookieToken = req.cookies[REFRESH_TOKEN_COOKIE_KEY];
    const bodyToken = parsedBody.data.refreshToken;
    const refreshToken =
      (typeof cookieToken === 'string' && cookieToken.length > 0
        ? cookieToken
        : bodyToken) ?? null;

    if (!refreshToken) {
      throw new ApiError('Refresh token is required.', 400);
    }

    await authService.logout(refreshToken);
    res.clearCookie(REFRESH_TOKEN_COOKIE_KEY, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: 'User logged out successfully.',
      data: {},
    });
  },

  async me(req: Request, res: Response): Promise<void> {
    if (!req.auth) {
      throw new ApiError('Authorization context is missing.', 401);
    }

    const user = await authService.getCurrentUser(req.auth.userId);

    res.status(200).json({
      success: true,
      message: 'Current user fetched successfully.',
      data: user,
    });
  },
};

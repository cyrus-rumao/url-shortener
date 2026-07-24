import { randomUUID } from 'node:crypto';

import jwt from 'jsonwebtoken';

import { ENV } from '../config/env';
import { ApiError } from '../errors/api-error';

interface AccessTokenPayload {
  readonly sub: string;
  readonly email: string;
}

interface RefreshTokenPayload extends AccessTokenPayload {
  readonly jti: string;
}

interface TokenPair {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly refreshTokenId: string;
}

const REFRESH_TOKEN_EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60;

export const generateTokenPair = (payload: AccessTokenPayload): TokenPair => {
  const refreshTokenId = randomUUID();

  const accessToken = jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
    expiresIn: ENV.JWT_ACCESS_EXPIRES_IN_SECONDS,
  });

  const refreshToken = jwt.sign(
    { ...payload, jti: refreshTokenId },
    ENV.JWT_REFRESH_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN_SECONDS,
    },
  );

  return {
    accessToken,
    refreshToken,
    refreshTokenId,
  };
};

const assertPayloadObject = (
  payload: string | jwt.JwtPayload,
): jwt.JwtPayload => {
  if (typeof payload === 'string') {
    throw new ApiError('Token payload format is invalid.', 401);
  }

  return payload;
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try {
    const decoded = assertPayloadObject(
      jwt.verify(token, ENV.JWT_ACCESS_SECRET),
    );
    const { sub, email } = decoded;

    if (typeof sub !== 'string' || typeof email !== 'string') {
      throw new ApiError('Access token is invalid.', 401);
    }

    return { sub, email };
  } catch {
    throw new ApiError('Access token is invalid or expired.', 401);
  }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    const decoded = assertPayloadObject(
      jwt.verify(token, ENV.JWT_REFRESH_SECRET),
    );
    const { sub, email, jti } = decoded;

    if (
      typeof sub !== 'string' ||
      typeof email !== 'string' ||
      typeof jti !== 'string'
    ) {
      throw new ApiError('Refresh token is invalid.', 401);
    }

    return { sub, email, jti };
  } catch {
    throw new ApiError('Refresh token is invalid or expired.', 401);
  }
};

export { REFRESH_TOKEN_EXPIRES_IN_SECONDS };

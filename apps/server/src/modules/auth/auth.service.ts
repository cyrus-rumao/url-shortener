import bcrypt from 'bcryptjs';

import {
  generateTokenPair,
  REFRESH_TOKEN_EXPIRES_IN_SECONDS,
  verifyRefreshToken,
} from '../../shared/auth/jwt.service';
import { ENV } from '../../shared/config/env';
import { ApiError } from '../../shared/errors/api-error';

import { authRepository } from './auth.repository';
import type { AuthResponse, LoginInput, RegisterInput } from './auth.types';

const mapAuthResponse = (
  userId: string,
  email: string,
  accessToken: string,
  refreshToken: string,
): AuthResponse => ({
  user: {
    id: userId,
    email,
  },
  accessToken,
  refreshToken,
  accessTokenExpiresInSeconds: ENV.JWT_ACCESS_EXPIRES_IN_SECONDS,
});

const issueAndPersistTokens = async (
  userId: string,
  email: string,
): Promise<AuthResponse> => {
  const tokenPair = generateTokenPair({
    sub: userId,
    email,
  });

  const refreshTokenHash = await bcrypt.hash(tokenPair.refreshToken, 12);

  await authRepository.storeRefreshToken(
    userId,
    tokenPair.refreshTokenId,
    refreshTokenHash,
    REFRESH_TOKEN_EXPIRES_IN_SECONDS,
  );

  return mapAuthResponse(
    userId,
    email,
    tokenPair.accessToken,
    tokenPair.refreshToken,
  );
};

export const authService = {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const existingUser = await authRepository.findUserByEmail(input.email);

    if (existingUser) {
      throw new ApiError('Email is already registered.', 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await authRepository.createUser(input.email, passwordHash);

    return issueAndPersistTokens(user.id, user.email);
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await authRepository.findUserByEmail(input.email);

    if (!user) {
      throw new ApiError('Invalid email or password.', 401);
    }

    const isPasswordValid = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new ApiError('Invalid email or password.', 401);
    }

    return issueAndPersistTokens(user.id, user.email);
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const payload = verifyRefreshToken(refreshToken);
    const user = await authRepository.findUserById(payload.sub);

    if (!user) {
      throw new ApiError('User no longer exists.', 401);
    }

    const storedRefreshTokenHash = await authRepository.findRefreshTokenHash(
      user.id,
      payload.jti,
    );

    if (!storedRefreshTokenHash) {
      throw new ApiError('Refresh token session was revoked or expired.', 401);
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      storedRefreshTokenHash,
    );

    if (!isRefreshTokenValid) {
      throw new ApiError('Refresh token is invalid.', 401);
    }

    await authRepository.deleteRefreshToken(user.id, payload.jti);
    return issueAndPersistTokens(user.id, user.email);
  },

  async logout(refreshToken: string): Promise<void> {
    const payload = verifyRefreshToken(refreshToken);
    await authRepository.deleteRefreshToken(payload.sub, payload.jti);
  },

  async getCurrentUser(userId: string): Promise<{ id: string; email: string }> {
    const user = await authRepository.findUserById(userId);

    if (!user) {
      throw new ApiError('User was not found.', 404);
    }

    return {
      id: user.id,
      email: user.email,
    };
  },
};

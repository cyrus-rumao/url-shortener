import { randomUUID } from 'node:crypto';

import { ENV } from '../../shared/config/env';
import { ensureRedisConnection } from '../../shared/cache/redis.client';

import type { UserRecord } from './auth.types';

const usersByEmail = new Map<string, UserRecord>();
const usersById = new Map<string, UserRecord>();

const buildRefreshTokenKey = (userId: string, refreshTokenId: string): string =>
  `${ENV.REDIS_REFRESH_PREFIX}:${userId}:${refreshTokenId}`;

export const authRepository = {
  async findUserByEmail(email: string): Promise<UserRecord | null> {
    return usersByEmail.get(email) ?? null;
  },

  async findUserById(userId: string): Promise<UserRecord | null> {
    return usersById.get(userId) ?? null;
  },

  async createUser(email: string, passwordHash: string): Promise<UserRecord> {
    const user: UserRecord = {
      id: randomUUID(),
      email,
      passwordHash,
      createdAt: new Date(),
    };

    usersByEmail.set(user.email, user);
    usersById.set(user.id, user);
    return user;
  },

  async storeRefreshToken(
    userId: string,
    refreshTokenId: string,
    refreshTokenHash: string,
    ttlSeconds: number,
  ): Promise<void> {
    const redisClient = await ensureRedisConnection();
    const key = buildRefreshTokenKey(userId, refreshTokenId);

    await redisClient.set(key, refreshTokenHash, {
      EX: ttlSeconds,
    });
  },

  async findRefreshTokenHash(
    userId: string,
    refreshTokenId: string,
  ): Promise<string | null> {
    const redisClient = await ensureRedisConnection();
    const key = buildRefreshTokenKey(userId, refreshTokenId);

    return redisClient.get(key);
  },

  async deleteRefreshToken(
    userId: string,
    refreshTokenId: string,
  ): Promise<void> {
    const redisClient = await ensureRedisConnection();
    const key = buildRefreshTokenKey(userId, refreshTokenId);
    await redisClient.del(key);
  },
};

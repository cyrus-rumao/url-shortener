import jwt from "jsonwebtoken";
import { env } from "@/config/env.js";
import { redis } from "@/config/redis.js";

type JwtPayload = {
  userId: string;
};

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
};

export const storeRefreshToken = async (userId: string, refreshToken: string) => {
  const value = JSON.stringify({ token: refreshToken });
  try {
    await redis.setex(`refresh_token:${userId}`, 7 * 24 * 60 * 60, value);
  } catch (err) {
    console.log('Redis error:', err);
  }
};

export const clearRefreshToken = async (userId: string) => {
  try {
    await redis.del(`refresh_token:${userId}`);
    // console.log(`Refresh token for user ${userId} cleared from Redis`);
  } catch (err) {
    console.log('Redis error:', err);
  }
};
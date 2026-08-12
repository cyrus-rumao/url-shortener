import jwt from "jsonwebtoken";
import { env } from "@/config/env.js";
import { redis } from "@/config/redis.js";
export const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
        expiresIn: "15m",
    });
};
export const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    });
};
export const verifyAccessToken = (token) => {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
};
export const verifyRefreshToken = (token) => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
};
export const storeRefreshToken = async (userId, refreshToken) => {
    const value = JSON.stringify({ token: refreshToken });
    try {
        await redis.setex(`refresh_token:${userId}`, 7 * 24 * 60 * 60, value);
    }
    catch (err) {
        console.log('Redis error:', err);
    }
};
export const clearRefreshToken = async (userId) => {
    try {
        await redis.del(`refresh_token:${userId}`);
        // console.log(`Refresh token for user ${userId} cleared from Redis`);
    }
    catch (err) {
        console.log('Redis error:', err);
    }
};
//# sourceMappingURL=jwt.js.map
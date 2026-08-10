import Redis from "ioredis";

import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);


let redis;
export const connectRedis = () => {
  try {
    if (!process.env.REDIS_URL) {
      console.warn(
        "REDIS_URL not set in environment variables. Skipping Redis connection.",
      );
      return null;
    }
    redis = new Redis(process.env.REDIS_URL);
    console.log("Redis connected successfully");
    return redis;
  } catch (error) {
    console.error("Error connecting to Redis:", error);
  }
};

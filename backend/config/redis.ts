import { Redis } from "ioredis";
import dotenv from "dotenv";
import { env } from "./env.js";
dotenv.config();

export const redis = new Redis(env.REDIS_URL);

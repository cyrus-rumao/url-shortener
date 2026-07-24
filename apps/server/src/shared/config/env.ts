import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3333),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(900),
  REDIS_URL: z.string().url(),
  REDIS_REFRESH_PREFIX: z.string().min(1).default('auth:refresh'),
});

export const ENV = envSchema.parse(process.env);

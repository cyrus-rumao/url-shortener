import { config } from "dotenv";
import { z } from "zod";
config();
const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    PORT: z.coerce.number().default(4000),
    DATABASE_URL: z.string().min(1),
    REDIS_URL: z.string().min(1),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    ACCESS_TOKEN_EXPIRY: z.string().default("15m"),
    REFRESH_TOKEN_EXPIRY: z.string().default("7d"),
    AUTO_SLUG_LENGTH: z.coerce.number().default(8),
    AUTO_SLUG_MAX_RETRIES: z.coerce.number().default(5),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("Invalid environment variables:\n", parsed.error.flatten().fieldErrors);
    process.exit(1);
}
export const env = parsed.data;
//# sourceMappingURL=env.js.map
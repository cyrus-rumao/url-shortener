import { Redis } from "ioredis";
import { env } from "./env.js";
export const redis = new Redis(env.REDIS_URL);
redis.on("connect", () => {
    console.log("Connected to Redis");
});
redis.on("error", (err) => {
    console.error("Redis error:", err);
});
redis.on("ready", () => {
    console.log("Redis is ready to use");
});
//# sourceMappingURL=redis.js.map
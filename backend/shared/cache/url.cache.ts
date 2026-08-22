import { redis } from "@/config/redis.js";

const URL_CACHE_PREFIX = "url:slug:";
const URL_CACHE_TTL_SECONDS = 60 * 60; // default 1 hour for DB-backed URLs

interface CachedUrlRecord {
  originalUrl: string;
}

const getUrlCacheKey = (slug: string, userId: string | null) => {
  return userId
    ? `${URL_CACHE_PREFIX}${slug}:user:${userId}`
    : `${URL_CACHE_PREFIX}${slug}:null`;
};

export const getCachedOriginalUrlBySlug = async (slug: string, userId: string | null) => {
  const key = getUrlCacheKey(slug, userId);
  console.log("Key: ", key);
  const cachedValue = await redis.get(key);
  console.log("Cached Value: ", cachedValue);
  if (!cachedValue) {
    return null;
  }

  const parsedValue = JSON.parse(cachedValue) as CachedUrlRecord;
  return parsedValue.originalUrl;
};

// Allow callers to override TTL (seconds). Defaults to URL_CACHE_TTL_SECONDS.
export const setCachedOriginalUrlBySlug = async (
  userId: string | null,
  slug: string,
  originalUrl: string,
  ttlSeconds: number = URL_CACHE_TTL_SECONDS,
) => {
  const payload: CachedUrlRecord = { originalUrl };
  // Use SETEX to set value with expiry in seconds.
  await redis.setex(
    getUrlCacheKey(slug, userId),
    ttlSeconds,
    JSON.stringify(payload),
  );
};

import { redis } from "@/config/redis.js";

const URL_CACHE_PREFIX = "url:slug:";
const URL_CACHE_TTL_SECONDS = 60 * 60;

interface CachedUrlRecord {
  originalUrl: string;
}

const getUrlCacheKey = (slug: string) => `${URL_CACHE_PREFIX}${slug}`;

export const getCachedOriginalUrlBySlug = async (slug: string) => {
  const cachedValue = await redis.get(getUrlCacheKey(slug));

  if (!cachedValue) {
    return null;
  }

  const parsedValue = JSON.parse(cachedValue) as CachedUrlRecord;
  return parsedValue.originalUrl;
};

export const setCachedOriginalUrlBySlug = async (
  slug: string,
  originalUrl: string,
) => {
  const payload: CachedUrlRecord = { originalUrl };
  await redis.setex(
    getUrlCacheKey(slug),
    URL_CACHE_TTL_SECONDS,
    JSON.stringify(payload),
  );
};

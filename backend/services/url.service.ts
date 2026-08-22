import { randomBytes } from "crypto";
import {
  createUrl,
  deleteUrlByIdAndUserId,
  findSlugById,
  findUrlBySlug,
  findUrlsByUserId,
} from "@/repositories/url.repository.js";
import {
  getCachedOriginalUrlBySlug,
  setCachedOriginalUrlBySlug,
} from "@/shared/cache/url.cache.js";
import type {
  CreateShortUrlInput,
  ShortUrlResponse,
  UserShortUrlItem,
} from "@/types/url.js";
import { env } from "@/config/env.js";
import { UrlServiceError } from "@/types/error.js";
const AUTO_SLUG_LENGTH = env.AUTO_SLUG_LENGTH;
const AUTO_SLUG_MAX_RETRIES = env.AUTO_SLUG_MAX_RETRIES;



const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const generateAutoSlug = () => {
  const bytes = randomBytes(AUTO_SLUG_LENGTH);

  return Array.from(bytes, (byte) => {
    return ALPHABET[byte % ALPHABET.length];
  }).join("");
};

const normalizeSlug = (slug: string) => slug.trim();

const buildShortUrl = (origin: string, slug: string) => `${origin}/${slug}`;


export const createShortUrlService = async (
  input: CreateShortUrlInput,
  userId: string | null,
  origin: string,
): Promise<ShortUrlResponse> => {
  const isAuthenticated = Boolean(userId);

  // Helper: normalize origin host for same-domain checks
  let originHost: string;
  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch (err) {
    originHost = origin.toLowerCase();
  }

  // If the user provided one of our own short URLs as the input (e.g. https://our.domain/abc or www.our/abc),
  // detect that and return the existing short URL instead of creating a new one.
  try {
    let possible = input.url;
    if (!/^https?:\/\//i.test(possible)) {
      // allow inputs like "www.short/abc" by assuming https
      possible = `https://${possible}`;
    }
    const parsed = new URL(possible);
    if (parsed.host.toLowerCase() === originHost) {
      const pathSegments = parsed.pathname.split("/").filter(Boolean);
      const candidateSlug = pathSegments.length > 0 ? pathSegments[0] : null;
      if (candidateSlug) {
        // Check DB first (source of truth)
        const existingUrl = await findUrlBySlug(candidateSlug);
        if (existingUrl) {
          return {
            id: existingUrl.id,
            slug: existingUrl.slug,
            originalUrl: existingUrl.url,
            shortUrl: buildShortUrl(origin, existingUrl.slug),
            alreadyExisted: true,
            message: "Input is already a short URL; returning the existing short URL.",
          };
        }

        // For unauthenticated users, check Redis cache for transient short URLs
        try {
          const cached = await getCachedOriginalUrlBySlug(candidateSlug, null);
          if (cached) {
            return {
              id: "",
              slug: candidateSlug,
              originalUrl: cached,
              shortUrl: buildShortUrl(origin, candidateSlug),
              alreadyExisted: true,
              message: "Input is already a short URL (transient); returning the existing short URL.",
            };
          }
        } catch (err) {
          // Redis read failure should not block creating a new short URL; proceed.
          console.error("Redis read failed while checking existing short url", err);
        }
      }
    }
  } catch (err) {
    if (err instanceof TypeError) {
      throw new UrlServiceError("Invalid URL format", 400, ["INVALID_URL"]);
    }
  }

  // At this point, input.url is not an existing short URL in our domain (or parsing failed).
  // Proceed to normal slug selection/generation logic.
  let slugToUse: string | null = input.slug ? normalizeSlug(input.slug) : null;

  if (slugToUse) {
    const existingSlug = await findUrlBySlug(slugToUse);
    let cached = null;
    try {
      const cached = await getCachedOriginalUrlBySlug(slugToUse, null);

    } catch (err) {

      console.error(
        "Redis read failed while checking custom slug",
        err,
      );

    }
    if (existingSlug) {
      throw new UrlServiceError("Custom slug is already in use", 409, [
        "SLUG_CONFLICT",
      ]);
    }
    if (existingSlug || cached) {
      throw new UrlServiceError("Custom slug is already in use", 409, [
        "SLUG_CONFLICT",
      ]);
    }

  } else {
    for (let attempt = 0; attempt < AUTO_SLUG_MAX_RETRIES; attempt += 1) {
      const generatedSlug = generateAutoSlug();
      const existingSlug = await findUrlBySlug(generatedSlug);

      let cached = null;
      try {
        cached = await getCachedOriginalUrlBySlug(generatedSlug, null);
      } catch (err) {
        console.error("Redis read failed during slug generation check", err);
      }

      if (!existingSlug && !cached) {
        slugToUse = generatedSlug;
        break;
      }
    }

    if (!slugToUse) {
      throw new UrlServiceError(
        "Unable to generate a unique slug. Please try again.",
        503,
        ["SLUG_GENERATION_FAILED"],
      );
    }
  }

  // If unauthenticated: persist only to Redis with 24h TTL and do NOT write to DB.
  if (!isAuthenticated) {
    try {
      // 24 hours in seconds
      const TWENTY_FOUR_HOURS = 24 * 60 * 60;
      await setCachedOriginalUrlBySlug(null, slugToUse as string, input.url, TWENTY_FOUR_HOURS);
    } catch (error) {
      console.error("Redis write failed for unauthenticated short URL", error);
      throw new UrlServiceError("Temporary URL creation failed", 503, ["REDIS_FAILURE"]);
    }

    return {
      id: "",
      slug: slugToUse as string,
      originalUrl: input.url,
      shortUrl: buildShortUrl(origin, slugToUse as string),
      message: "Temporary short URL created",
    };
  }

  // Authenticated flow: persist to PostgreSQL (source of truth) and warm cache.
  const createdUrl = await createUrl({
    slug: slugToUse as string,
    url: input.url,
    userId: userId as string,
  });

  try {
    // Populate cache with default TTL for faster redirects.
    await setCachedOriginalUrlBySlug(createdUrl.userId, createdUrl.slug, createdUrl.url);
  } catch (error) {
    console.error("Redis cache write failed for slug redirect", error);
  }

  return {
    id: createdUrl.id,
    slug: createdUrl.slug,
    originalUrl: createdUrl.url,
    shortUrl: buildShortUrl(origin, createdUrl.slug),
    message: "Short URL created successfully",
  };
};

export const getUserShortUrlsService = async (
  userId: string,
  origin: string,
): Promise<UserShortUrlItem[]> => {
  const urls = await findUrlsByUserId(userId);

  return urls.map((url) => ({
    id: url.id,
    slug: url.slug,
    originalUrl: url.url,
    shortUrl: buildShortUrl(origin, url.slug),
    createdAt: url.createdAt.toISOString(),
  }));
};

export const deleteUserShortUrlService = async (id: string, userId: string) => {
  const slug = await findSlugById(id);
  console.log("Slug to delete: ", slug?.slug);
  const deleted = await deleteUrlByIdAndUserId(id, userId);
  await setCachedOriginalUrlBySlug(userId, slug?.slug || "", "", 1);
  console.log("Delete Url In cache ", deleted.count);
  if (deleted.count === 0) {
    throw new UrlServiceError("Short URL not found", 404, ["URL_NOT_FOUND"]);
  }
};

export const resolveOriginalUrlBySlugService = async (
  slug: string,
): Promise<string> => {
  const normalizedSlug = normalizeSlug(slug);
  console.log("Normalized slug: ", normalizedSlug);
  try {
    // Cache-aside read path for high-throughput redirects:
    // Redis hit returns immediately without touching PostgreSQL.
    const cachedUrl = await getCachedOriginalUrlBySlug(normalizedSlug, null);
    console.log("URL is cached. Here it is: ", cachedUrl);
    if (cachedUrl) {
      return cachedUrl;
    }
  } catch (error) {
    console.error("Redis cache read failed for slug redirect", error);
  }

  const existingUrl = await findUrlBySlug(normalizedSlug);

  if (!existingUrl) {
    throw new UrlServiceError("Short URL not found", 404, ["URL_NOT_FOUND"]);
  }

  if (existingUrl.expiresAt && existingUrl.expiresAt <= new Date()) {
    throw new UrlServiceError("Short URL has expired", 410, ["URL_EXPIRED"]);
  }

  try {
    // On cache miss we repopulate Redis from PostgreSQL source of truth.
    await setCachedOriginalUrlBySlug(null, normalizedSlug, existingUrl.url);
  } catch (error) {
    console.error("Redis cache write failed for slug redirect", error);
  }

  return existingUrl.url;
};
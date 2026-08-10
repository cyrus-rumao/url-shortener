import { randomBytes } from "crypto";
import {
  createUrl,
  deleteUrlByIdAndUserId,
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
const AUTO_SLUG_LENGTH = env.AUTO_SLUG_LENGTH;
const AUTO_SLUG_MAX_RETRIES = env.AUTO_SLUG_MAX_RETRIES;

export class UrlServiceError extends Error {
  statusCode: number;
  errors: string[];

  constructor(message: string, statusCode = 400, errors: string[] = []) {
    super(message);
    this.name = "UrlServiceError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const generateAutoSlug = () => {
  const bytes = randomBytes(AUTO_SLUG_LENGTH);

  return Array.from(bytes, (byte) => {
    return ALPHABET[byte % ALPHABET.length];
  }).join("");
};

const normalizeSlug = (slug: string) => slug.trim().toLowerCase();

const buildShortUrl = (origin: string, slug: string) => `${origin}/${slug}`;

export const createShortUrlService = async (
  input: CreateShortUrlInput,
  userId: string,
  origin: string,
): Promise<ShortUrlResponse> => {
  let slugToUse: string | null = input.slug ? normalizeSlug(input.slug) : null;

  if (slugToUse) {
    const existingSlug = await findUrlBySlug(slugToUse);

    if (existingSlug) {
      throw new UrlServiceError("Custom slug is already in use", 409, [
        "SLUG_CONFLICT",
      ]);
    }
  } else {
    for (let attempt = 0; attempt < AUTO_SLUG_MAX_RETRIES; attempt += 1) {
      const generatedSlug = generateAutoSlug();
      const existingSlug = await findUrlBySlug(generatedSlug);

      if (!existingSlug) {
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

  const createdUrl = await createUrl({
    slug: slugToUse,
    url: input.url,
    userId,
  });

  return {
    id: createdUrl.id,
    slug: createdUrl.slug,
    originalUrl: createdUrl.url,
    shortUrl: buildShortUrl(origin, createdUrl.slug),
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
  const deleted = await deleteUrlByIdAndUserId(id, userId);

  if (deleted.count === 0) {
    throw new UrlServiceError("Short URL not found", 404, ["URL_NOT_FOUND"]);
  }
};

export const resolveOriginalUrlBySlugService = async (
  slug: string,
): Promise<string> => {
  const normalizedSlug = normalizeSlug(slug);

  try {
    // Cache-aside read path for high-throughput redirects:
    // Redis hit returns immediately without touching PostgreSQL.
    const cachedUrl = await getCachedOriginalUrlBySlug(normalizedSlug);
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
    await setCachedOriginalUrlBySlug(normalizedSlug, existingUrl.url);
  } catch (error) {
    console.error("Redis cache write failed for slug redirect", error);
  }

  return existingUrl.url;
};
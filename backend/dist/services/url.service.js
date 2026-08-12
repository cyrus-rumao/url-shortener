import { randomBytes } from "crypto";
import { createUrl, deleteUrlByIdAndUserId, findUrlBySlug, findUrlsByUserId, } from "@/repositories/url.repository.js";
import { getCachedOriginalUrlBySlug, setCachedOriginalUrlBySlug, } from "@/shared/cache/url.cache.js";
import { env } from "@/config/env.js";
const AUTO_SLUG_LENGTH = env.AUTO_SLUG_LENGTH;
const AUTO_SLUG_MAX_RETRIES = env.AUTO_SLUG_MAX_RETRIES;
export class UrlServiceError extends Error {
    statusCode;
    errors;
    constructor(message, statusCode = 400, errors = []) {
        super(message);
        this.name = "UrlServiceError";
        this.statusCode = statusCode;
        this.errors = errors;
    }
}
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const generateAutoSlug = () => {
    const bytes = randomBytes(AUTO_SLUG_LENGTH);
    return Array.from(bytes, (byte) => {
        return ALPHABET[byte % ALPHABET.length];
    }).join("");
};
const normalizeSlug = (slug) => slug.trim();
const buildShortUrl = (origin, slug) => `${origin}/${slug}`;
export const createShortUrlService = async (input, userId, origin) => {
    let slugToUse = input.slug ? normalizeSlug(input.slug) : null;
    const isAuthenticated = Boolean(userId);
    if (slugToUse) {
        // Check both DB and Redis cache for collisions.
        const existingSlug = await findUrlBySlug(slugToUse);
        try {
            const cached = await getCachedOriginalUrlBySlug(slugToUse);
            if (existingSlug || cached) {
                throw new UrlServiceError("Custom slug is already in use", 409, [
                    "SLUG_CONFLICT",
                ]);
            }
        }
        catch (err) {
            // If Redis failed, still respect DB check above. If DB empty but Redis errored,
            // proceed cautiously and only rely on DB result. Log error but don't fail the request.
            if (existingSlug) {
                throw new UrlServiceError("Custom slug is already in use", 409, [
                    "SLUG_CONFLICT",
                ]);
            }
        }
    }
    else {
        for (let attempt = 0; attempt < AUTO_SLUG_MAX_RETRIES; attempt += 1) {
            const generatedSlug = generateAutoSlug();
            const existingSlug = await findUrlBySlug(generatedSlug);
            let cached = null;
            try {
                cached = await getCachedOriginalUrlBySlug(generatedSlug);
            }
            catch (err) {
                console.error("Redis read failed during slug generation check", err);
            }
            if (!existingSlug && !cached) {
                slugToUse = generatedSlug;
                break;
            }
        }
        if (!slugToUse) {
            throw new UrlServiceError("Unable to generate a unique slug. Please try again.", 503, ["SLUG_GENERATION_FAILED"]);
        }
    }
    // If unauthenticated: persist only to Redis with 24h TTL and do NOT write to DB.
    if (!isAuthenticated) {
        try {
            // 24 hours in seconds
            const TWENTY_FOUR_HOURS = 24 * 60 * 60;
            await setCachedOriginalUrlBySlug(slugToUse, input.url, TWENTY_FOUR_HOURS);
        }
        catch (error) {
            console.error("Redis write failed for unauthenticated short URL", error);
            throw new UrlServiceError("Temporary URL creation failed", 503, ["REDIS_FAILURE"]);
        }
        return {
            id: "",
            slug: slugToUse,
            originalUrl: input.url,
            shortUrl: buildShortUrl(origin, slugToUse),
        };
    }
    // Authenticated flow: persist to PostgreSQL (source of truth) and warm cache.
    const createdUrl = await createUrl({
        slug: slugToUse,
        url: input.url,
        userId: userId,
    });
    try {
        // Populate cache with default TTL for faster redirects.
        await setCachedOriginalUrlBySlug(createdUrl.slug, createdUrl.url);
    }
    catch (error) {
        console.error("Redis cache write failed for slug redirect", error);
    }
    return {
        id: createdUrl.id,
        slug: createdUrl.slug,
        originalUrl: createdUrl.url,
        shortUrl: buildShortUrl(origin, createdUrl.slug),
    };
};
export const getUserShortUrlsService = async (userId, origin) => {
    const urls = await findUrlsByUserId(userId);
    return urls.map((url) => ({
        id: url.id,
        slug: url.slug,
        originalUrl: url.url,
        shortUrl: buildShortUrl(origin, url.slug),
        createdAt: url.createdAt.toISOString(),
    }));
};
export const deleteUserShortUrlService = async (id, userId) => {
    const deleted = await deleteUrlByIdAndUserId(id, userId);
    if (deleted.count === 0) {
        throw new UrlServiceError("Short URL not found", 404, ["URL_NOT_FOUND"]);
    }
};
export const resolveOriginalUrlBySlugService = async (slug) => {
    const normalizedSlug = normalizeSlug(slug);
    console.log("Normalized slug: ", normalizedSlug);
    try {
        // Cache-aside read path for high-throughput redirects:
        // Redis hit returns immediately without touching PostgreSQL.
        const cachedUrl = await getCachedOriginalUrlBySlug(normalizedSlug);
        console.log("URL is cached. Here it is: ", cachedUrl);
        if (cachedUrl) {
            return cachedUrl;
        }
    }
    catch (error) {
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
    }
    catch (error) {
        console.error("Redis cache write failed for slug redirect", error);
    }
    return existingUrl.url;
};
//# sourceMappingURL=url.service.js.map
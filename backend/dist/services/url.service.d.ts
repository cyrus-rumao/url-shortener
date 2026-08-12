import type { CreateShortUrlInput, ShortUrlResponse, UserShortUrlItem } from "@/types/url.js";
export declare class UrlServiceError extends Error {
    statusCode: number;
    errors: string[];
    constructor(message: string, statusCode?: number, errors?: string[]);
}
export declare const createShortUrlService: (input: CreateShortUrlInput, userId: string | null, origin: string) => Promise<ShortUrlResponse>;
export declare const getUserShortUrlsService: (userId: string, origin: string) => Promise<UserShortUrlItem[]>;
export declare const deleteUserShortUrlService: (id: string, userId: string) => Promise<void>;
export declare const resolveOriginalUrlBySlugService: (slug: string) => Promise<string>;
//# sourceMappingURL=url.service.d.ts.map
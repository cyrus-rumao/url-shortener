export interface CreateShortUrlInput {
    url: string;
    slug?: string | undefined;
}
export interface ShortUrlResponse {
    id: string;
    slug: string;
    originalUrl: string;
    shortUrl: string;
}
export interface UserShortUrlItem {
    id: string;
    slug: string;
    originalUrl: string;
    shortUrl: string;
    createdAt: string;
}
//# sourceMappingURL=url.d.ts.map
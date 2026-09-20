export interface CreateShortUrlInput {
  url: string;
  slug?: string | undefined;
}

export interface ShortUrlResponse {
  id: string;
  slug: string;
  originalUrl: string;
  shortUrl: string;
  // Optional metadata returned by the service to indicate pre-existing entries
  alreadyExisted?: boolean;
  message?: string;
}

export interface UserShortUrlItem {
  id: string;
  slug: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: string;
}

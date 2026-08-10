export interface CreateShortUrlPayload {
  url: string;
  slug?: string | undefined;
}

export interface CreateShortUrlData {
  id: string;
  slug: string;
  originalUrl: string;
  shortUrl: string;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors: string[];
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface UserShortUrl {
  id: string;
  slug: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: string;
}

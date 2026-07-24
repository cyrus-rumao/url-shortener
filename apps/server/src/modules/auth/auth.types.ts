export interface UserRecord {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly createdAt: Date;
}

export interface RegisterInput {
  readonly email: string;
  readonly password: string;
}

export interface LoginInput {
  readonly email: string;
  readonly password: string;
}

export interface AuthResponse {
  readonly user: {
    readonly id: string;
    readonly email: string;
  };
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly accessTokenExpiresInSeconds: number;
}

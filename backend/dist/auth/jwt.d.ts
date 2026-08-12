type JwtPayload = {
    userId: string;
};
export declare const generateAccessToken: (userId: string) => string;
export declare const generateRefreshToken: (userId: string) => string;
export declare const verifyAccessToken: (token: string) => JwtPayload;
export declare const verifyRefreshToken: (token: string) => JwtPayload;
export declare const storeRefreshToken: (userId: string, refreshToken: string) => Promise<void>;
export declare const clearRefreshToken: (userId: string) => Promise<void>;
export {};
//# sourceMappingURL=jwt.d.ts.map
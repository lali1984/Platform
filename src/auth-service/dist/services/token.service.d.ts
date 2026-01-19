export interface TokenPayload {
    userId: string;
    email: string;
    isTwoFactorEnabled: boolean;
    isTwoFactorAuthenticated?: boolean;
}
export declare class TokenService {
    private redisClient;
    private readonly accessSecret;
    private readonly refreshSecret;
    private readonly accessExpiresIn;
    private readonly refreshExpiresIn;
    constructor();
    generateAccessToken(payload: TokenPayload): string;
    generateRefreshToken(payload: TokenPayload): string;
    private parseExpiresIn;
    verifyAccessToken(token: string): TokenPayload | null;
    verifyRefreshToken(token: string): TokenPayload | null;
    validateRefreshToken(userId: string, token: string): Promise<boolean>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=token.service.d.ts.map
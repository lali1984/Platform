import { TokenService, TokenPayload, TokenPair } from '../../domain/ports/TokenService.port';
export declare class JwtTokenService implements TokenService {
    private readonly accessTokenSecret;
    private readonly refreshTokenSecret;
    private readonly accessTokenExpiresIn;
    private readonly refreshTokenExpiresIn;
    private readonly redisClient;
    constructor();
    generateAccessToken(payload: TokenPayload): string;
    generateRefreshToken(payload: TokenPayload): string;
    verifyAccessToken(token: string): TokenPayload | null;
    verifyRefreshToken(token: string): TokenPayload | null;
    private getRefreshTokenKey;
    private getUserTokensKey;
    saveRefreshToken(userId: string, refreshToken: string): Promise<void>;
    validateRefreshToken(userId: string, refreshToken: string): Promise<boolean>;
    deleteRefreshToken(userId: string, refreshToken: string): Promise<void>;
    deleteAllRefreshTokens(userId: string): Promise<void>;
    generateTokenPair(payload: TokenPayload): TokenPair;
    private parseExpiresIn;
    disconnect(): Promise<void>;
}

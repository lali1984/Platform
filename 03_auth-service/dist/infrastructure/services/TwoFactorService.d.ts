import { TwoFactorService as ITwoFactorService, TwoFactorSecret } from '../../domain/ports/TwoFactorService.port';
export declare class TwoFactorService implements ITwoFactorService {
    private readonly issuer;
    private readonly totp;
    constructor();
    generateSecret(email: string): TwoFactorSecret;
    generateSecretWithQR(email: string): Promise<TwoFactorSecret>;
    verifyToken(secret: string, token: string): Promise<boolean>;
    generateQRCode(otpauthUrl: string): Promise<string>;
}

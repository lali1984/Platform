export interface TwoFactorSecret {
    secret: string;
    qrCodeUrl: string;
    otpauthUrl: string;
}
export interface TwoFactorService {
    /**
     * Генерирует секрет для 2FA
     */
    generateSecret(email: string): TwoFactorSecret;
    /**
     * Генерирует секрет с QR кодом
     */
    generateSecretWithQR(email: string): Promise<TwoFactorSecret>;
    /**
     * Верифицирует TOTP токен
     */
    verifyToken(secret: string, token: string): Promise<boolean>;
    /**
     * Генерирует QR код в base64
     */
    generateQRCode(otpauthUrl: string): Promise<string>;
}

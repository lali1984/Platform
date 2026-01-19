export declare class TwoFactorService {
    generateSecret(email: string): string;
    generateQRCode(secret: string, email: string): Promise<string>;
    verifyToken(secret: string, token: string): boolean;
    generateBackupCodes(): string[];
}
//# sourceMappingURL=two-factor.service.d.ts.map
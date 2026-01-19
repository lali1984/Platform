export declare class PasswordResetService {
    private redisClient;
    constructor();
    generateResetToken(userId: string, email: string): Promise<string>;
    validateResetToken(token: string): Promise<{
        userId: string;
        email: string;
    } | null>;
    invalidateResetToken(token: string): Promise<void>;
}
//# sourceMappingURL=password-reset.service.d.ts.map
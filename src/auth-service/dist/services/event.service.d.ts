interface UserRegisteredData {
    userId: string;
    email: string;
    metadata?: {
        userAgent?: string;
        ipAddress?: string;
        isEmailVerified?: boolean;
        isActive?: boolean;
        isTwoFactorEnabled?: boolean;
    };
}
interface UserLoggedInData {
    userId: string;
    email: string;
    metadata?: {
        userAgent?: string;
        ipAddress?: string;
        loginMethod?: 'password' | 'oauth' | 'token';
        isTwoFactorEnabled?: boolean;
        deviceInfo?: string;
    };
}
interface UserLoginFailedData {
    email: string;
    reason: 'user_not_found' | 'invalid_password' | 'account_inactive' | 'account_locked' | 'two_factor_required' | 'two_factor_invalid';
    metadata?: {
        userAgent?: string;
        ipAddress?: string;
        attemptCount?: number;
    };
}
interface TwoFactorEnabledData {
    userId: string;
    email: string;
    method: 'app' | 'sms' | 'email';
}
interface PasswordResetRequestedData {
    userId: string;
    email: string;
    resetToken?: string;
    expiresAt?: string;
}
export declare class EventService {
    private static instance;
    private isInitialized;
    private source;
    private kafkaProducer;
    private constructor();
    static getInstance(): EventService;
    initialize(): Promise<void>;
    private publishToRedis;
    private publishToKafka;
    publishUserRegistered(userData: UserRegisteredData): Promise<void>;
    publishUserLoggedIn(userData: UserLoggedInData): Promise<void>;
    publishUserLoginFailed(userData: UserLoginFailedData): Promise<void>;
    publishTwoFactorEnabled(userData: TwoFactorEnabledData): Promise<void>;
    publishPasswordResetRequested(userData: PasswordResetRequestedData): Promise<void>;
    shutdown(): Promise<void>;
    getStatus(): Promise<{
        initialized: boolean;
        redisConnected: boolean;
        kafkaConnected: boolean;
    }>;
}
declare const _default: EventService;
export default _default;
//# sourceMappingURL=event.service.d.ts.map
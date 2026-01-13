interface User {
    id: string;
    email: string;
    password: string;
    name?: string;
    twoFASecret?: string;
    twoFAEnabled: boolean;
    refreshToken?: string;
    createdAt: Date;
}
interface RegisterData {
    email: string;
    password: string;
    name?: string;
}
interface LoginResponse {
    user: {
        id: string;
        email: string;
        name?: string;
        twoFAEnabled: boolean;
    };
    accessToken: string;
    refreshToken: string;
    requires2FA?: boolean;
}
interface TwoFAResult {
    secret: string;
    qrCodeUrl: string;
    otpauthUrl: string;
}
export declare class AuthService {
    private users;
    private readonly JWT_SECRET;
    private readonly JWT_REFRESH_SECRET;
    private readonly ACCESS_TOKEN_EXPIRY;
    private readonly REFRESH_TOKEN_EXPIRY;
    register(data: RegisterData): Promise<Omit<User, 'password' | 'refreshToken'>>;
    login(email: string, password: string): Promise<LoginResponse>;
    generate2FASecret(userId: string): Promise<TwoFAResult>;
    verify2FAToken(userId: string, token: string): Promise<boolean>;
    loginWith2FA(userId: string, token: string): Promise<LoginResponse>;
    refreshAccessToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    disable2FA(userId: string, token: string): Promise<boolean>;
    private generateAccessToken;
    private generateRefreshToken;
    getUserById(userId: string): User | undefined;
    getAllUsers(): Omit<User, 'password' | 'refreshToken' | 'twoFASecret'>[];
}
export {};
//# sourceMappingURL=auth.service.d.ts.map
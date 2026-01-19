import { RegisterDto } from '../types/register.dto';
import { LoginDto } from '../types/login.dto';
import { UserEntity } from '../entities/User';
export declare class AuthService {
    private userRepository;
    constructor();
    register(registerData: RegisterDto, metadata?: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{
        success: boolean;
        user?: any;
        error?: string;
    }>;
    login(loginData: LoginDto, metadata?: {
        ipAddress?: string;
        userAgent?: string;
        deviceInfo?: string;
    }): Promise<{
        success: boolean;
        user?: any;
        error?: string;
    }>;
    validateUser(email: string, password: string): Promise<UserEntity | null>;
    enableTwoFactor(userId: string, email: string, method: 'app' | 'sms' | 'email'): Promise<void>;
    requestPasswordReset(email: string, resetToken?: string): Promise<void>;
}
//# sourceMappingURL=auth.service.d.ts.map
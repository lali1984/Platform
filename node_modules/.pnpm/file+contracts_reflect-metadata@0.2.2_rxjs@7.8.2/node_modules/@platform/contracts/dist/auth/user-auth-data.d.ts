import { UserId } from '../types/index';
import { Email } from '../types/index';
export interface UserAuthData {
    id: UserId;
    email: Email;
    username?: string;
    firstName?: string;
    lastName?: string;
    role: string;
    permissions: string[];
    isTwoFactorEnabled: boolean;
    isEmailVerified: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
    lastLoginAt?: string;
}
//# sourceMappingURL=user-auth-data.d.ts.map
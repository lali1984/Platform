import { UserRoleEntity } from './UserRole.entity';
export declare class UserEntity {
    id: string;
    email: string;
    passwordHash: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    isActive: boolean;
    isEmailVerified: boolean;
    isTwoFactorEnabled: boolean;
    twoFactorSecret?: string;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    userRoles?: UserRoleEntity[];
}

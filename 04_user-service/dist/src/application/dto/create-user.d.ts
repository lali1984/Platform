import { UserStatus } from '../../domain/entities/user-profile';
export declare class CreateUserDto {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatarUrl?: string;
    status?: UserStatus;
    isVerified?: boolean;
    authUserId?: string;
    metadata?: Record<string, any>;
}

import { UserStatus } from '../../domain/entities/user.entity';
export declare class UserResponseDto {
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    phone?: string;
    avatarUrl?: string;
    status?: UserStatus;
    isActive?: boolean;
    isVerified?: boolean;
    metadata?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

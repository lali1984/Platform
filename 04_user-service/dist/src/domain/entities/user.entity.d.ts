import { AggregateRoot } from '../base/aggregate-root';
import { UserId, Email, PhoneNumber, ISO8601Date } from '@platform/contracts';
export declare enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED",
    DELETED = "DELETED"
}
export interface UserProps {
    id: UserId;
    email: Email;
    firstName: string;
    lastName: string;
    phone?: PhoneNumber;
    avatarUrl?: string;
    status: UserStatus;
    isVerified: boolean;
    metadata?: Record<string, any>;
    createdAt: ISO8601Date;
    updatedAt: ISO8601Date;
    deletedAt?: ISO8601Date;
}
export declare class User extends AggregateRoot<UserProps> {
    constructor(props: UserProps);
    protected getId(): string;
    get id(): UserId;
    get email(): Email;
    get firstName(): string;
    get lastName(): string;
    get fullName(): string;
    get phone(): PhoneNumber | undefined;
    get avatarUrl(): string | undefined;
    get status(): UserStatus;
    get isVerified(): boolean;
    get metadata(): Record<string, any> | undefined;
    get createdAt(): ISO8601Date;
    get updatedAt(): ISO8601Date;
    get deletedAt(): ISO8601Date | undefined;
    isActive(): boolean;
    verify(): void;
    deactivate(): void;
    delete(): void;
    updateProfile(data: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        avatarUrl?: string;
    }): void;
    static create(props: {
        email: string;
        firstName: string;
        lastName: string;
        phone?: string;
        avatarUrl?: string;
        id?: string;
        authUserId?: string;
        isActive?: boolean;
        isVerified?: boolean;
    }): User;
    static createFromAuthEvent(props: {
        authUserId: string;
        email: string;
        firstName: string;
        lastName: string;
        phone?: string;
        avatarUrl?: string;
        isVerified?: boolean;
        metadata?: Record<string, any>;
    }): User;
    static createWithContext(context: {
        source: 'auth-event' | 'manual' | 'migration';
        data: {
            email: string;
            firstName: string;
            lastName: string;
            phone?: string;
            avatarUrl?: string;
            authUserId?: string;
            isVerified?: boolean;
            metadata?: Record<string, any>;
        };
    }): User;
    validateAuthIdConsistency(): boolean;
    getAuthUserId(): string | undefined;
    isFromAuthService(): boolean;
}

import { UserId } from '@platform/contracts';
import { Email } from '@platform/contracts';
import { ISO8601Date } from '@platform/contracts';
export interface UserProps {
    id: UserId;
    email: Email;
    passwordHash: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    isActive: boolean;
    isEmailVerified: boolean;
    isTwoFactorEnabled: boolean;
    twoFactorSecret?: string;
    createdAt: ISO8601Date;
    updatedAt: ISO8601Date;
    lastLoginAt?: ISO8601Date;
}
export declare class User {
    private props;
    private domainEvents;
    private constructor();
    static create(data: {
        email: string;
        password: string;
        username?: string;
        firstName?: string;
        lastName?: string;
    }): Promise<User>;
    static fromPersistence(props: Omit<UserProps, 'id' | 'email' | 'createdAt' | 'updatedAt' | 'lastLoginAt'> & {
        id: string;
        email: string;
        createdAt: string | Date;
        updatedAt: string | Date;
        lastLoginAt?: string | Date;
    }): User;
    private static hashPassword;
    validatePassword(password: string): Promise<boolean>;
    login(): void;
    enableTwoFactor(secret: string): void;
    disableTwoFactor(): void;
    verifyEmail(): void;
    deactivate(): void;
    activate(): void;
    private addDomainEvent;
    getDomainEvents(): Array<{
        type: string;
        data: any;
    }>;
    clearDomainEvents(): void;
    get id(): UserId;
    get email(): Email;
    get username(): string | undefined;
    get firstName(): string | undefined;
    get lastName(): string | undefined;
    get isActive(): boolean;
    get isEmailVerified(): boolean;
    get isTwoFactorEnabled(): boolean;
    get createdAt(): ISO8601Date;
    get updatedAt(): ISO8601Date;
    get lastLoginAt(): ISO8601Date | undefined;
    get passwordHash(): string;
    get twoFactorSecret(): string | undefined;
    toJSON(): {
        id: UserId;
        email: Email;
        username: string | undefined;
        firstName: string | undefined;
        lastName: string | undefined;
        isActive: boolean;
        isEmailVerified: boolean;
        isTwoFactorEnabled: boolean;
        createdAt: ISO8601Date;
        updatedAt: ISO8601Date;
        lastLoginAt: ISO8601Date | undefined;
    };
}

import { DataSource } from 'typeorm';
import { User } from '../../../domain/entities/User';
import { UserRepository, CreateUserData, FindUserCriteria } from '../../../domain/ports/UserRepository.port';
export interface LoginAttemptInfo {
    email: string;
    attempts: number;
    lockedUntil?: Date;
    lastAttemptAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class TypeORMUserRepository implements UserRepository {
    private readonly dataSource;
    private repository;
    constructor(dataSource: DataSource);
    create(data: CreateUserData): Promise<User>;
    findOne(criteria: FindUserCriteria): Promise<User | null>;
    save(user: User): Promise<User>;
    delete(id: string): Promise<void>;
    exists(criteria: FindUserCriteria): Promise<boolean>;
    findUserRole(userId: string): Promise<string | null>;
    findUserPermissions(userId: string): Promise<string[]>;
    findById(id: string): Promise<User | null>;
    checkLockout(email: string): Promise<{
        isLocked: boolean;
        message?: string;
    }>;
    incrementFailedAttempt(email: string): Promise<void>;
    resetFailedAttempts(email: string): Promise<void>;
    lockAccount(email: string, minutes: number): Promise<void>;
    getLoginAttempts(email: string): Promise<LoginAttemptInfo | null>;
}

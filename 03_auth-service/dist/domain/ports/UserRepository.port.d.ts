import { User } from '../entities/User';
export interface CreateUserData {
    email: string;
    password: string;
    username?: string;
    firstName?: string;
    lastName?: string;
}
export interface LoginAttemptInfo {
    attempts: number;
    lockedUntil?: Date;
    lastAttemptAt?: Date;
}
export interface FindUserCriteria {
    id?: string;
    email?: string;
    username?: string;
}
export interface UserRepository {
    /**
     * Создает нового пользователя
     */
    create(data: CreateUserData): Promise<User>;
    /**
     * Находит пользователя по критериям
     */
    findOne(criteria: FindUserCriteria): Promise<User | null>;
    /**
     * Сохраняет изменения пользователя
     */
    save(user: User): Promise<User>;
    /**
     * Удаляет пользователя
     */
    delete(id: string): Promise<void>;
    /**
     * Проверяет существование пользователя
     */
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

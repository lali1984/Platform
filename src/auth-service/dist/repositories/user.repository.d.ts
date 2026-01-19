import { UserEntity } from '../entities/User';
import { CreateUserDTO } from '../types/user';
export declare class UserRepository {
    private repository;
    constructor();
    create(userData: CreateUserDTO): Promise<UserEntity>;
    createWithPassword(userData: {
        email: string;
        password: string;
    }): Promise<UserEntity>;
    findByEmail(email: string): Promise<UserEntity | null>;
    findById(id: string): Promise<UserEntity | null>;
    update(id: string, updateData: Partial<UserEntity>): Promise<UserEntity | null>;
    updatePassword(id: string, newPasswordHash: string): Promise<void>;
    updateTwoFactorSecret(userId: string, secret: string): Promise<void>;
    disableTwoFactor(userId: string): Promise<void>;
    markEmailAsVerified(userId: string): Promise<void>;
    setResetPasswordToken(userId: string, token: string, expiresAt: Date): Promise<void>;
    clearResetPasswordToken(userId: string): Promise<void>;
    deactivateUser(userId: string): Promise<void>;
}
declare const _default: UserRepository;
export default _default;
//# sourceMappingURL=user.repository.d.ts.map
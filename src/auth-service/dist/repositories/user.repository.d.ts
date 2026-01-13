import { User, CreateUserDTO } from '../types/user';
export declare class UserRepository {
    private tableName;
    create(userData: CreateUserDTO): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    updateTwoFactorSecret(userId: string, secret: string): Promise<void>;
    disableTwoFactor(userId: string): Promise<void>;
}
declare const _default: UserRepository;
export default _default;
//# sourceMappingURL=user.repository.d.ts.map
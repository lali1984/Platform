import { User } from '../../../domain/entities/User';
import { UserRepository, CreateUserData, FindUserCriteria } from '../../../domain/ports/UserRepository.port';
export declare class InMemoryUserRepository implements UserRepository {
    private users;
    create(data: CreateUserData): Promise<User>;
    exists(criteria: FindUserCriteria): Promise<boolean>;
    findOne(criteria: FindUserCriteria): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    save(user: User): Promise<User>;
    delete(id: string): Promise<void>;
    findUserRole(_userId: string): Promise<string | null>;
    findUserPermissions(_userId: string): Promise<string[]>;
}

import { Repository } from 'typeorm';
import { UserProfileEntity } from './user-profile.entity';
import { IUserRepository, UserFilters } from '../../domain/ports/repositories/user.repository.port';
import { User } from '../../domain/entities/user.entity';
export declare class UserTypormRepository implements IUserRepository {
    private readonly repository;
    private readonly logger;
    constructor(repository: Repository<UserProfileEntity>);
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByPhone(phone: string): Promise<User | null>;
    findByAuthUserId(authUserId: string): Promise<User | null>;
    save(user: User): Promise<void>;
    update(user: User): Promise<void>;
    delete(id: string): Promise<void>;
    findAll(limit?: number, offset?: number): Promise<User[]>;
    findWithFilters(filters: UserFilters, limit?: number, offset?: number): Promise<User[]>;
    exists(email: string): Promise<boolean>;
    existsByAuthUserId(authUserId: string): Promise<boolean>;
    count(): Promise<number>;
    countByStatus(status: string): Promise<number>;
    search(query: string, limit?: number, offset?: number): Promise<User[]>;
    findDeletedUsers(limit?: number, offset?: number): Promise<User[]>;
    restore(id: string): Promise<void>;
    permanentlyDelete(id: string): Promise<void>;
    checkDataIntegrity(): Promise<{
        issues: string[];
        count: number;
    }>;
    getStatistics(): Promise<{
        total: number;
        active: number;
        inactive: number;
        verified: number;
        byCountry: Record<string, number>;
        byCompany: Record<string, number>;
        createdLast30Days: number;
        avgProfileCompletion: number;
    }>;
}

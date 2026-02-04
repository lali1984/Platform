import { User } from '../../entities/user.entity';
export interface IUserRepository {
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
}
export interface UserFilters {
    status?: string;
    isVerified?: boolean;
    country?: string;
    city?: string;
    company?: string;
    createdAtFrom?: Date;
    createdAtTo?: Date;
    lastActiveFrom?: Date;
    lastActiveTo?: Date;
}
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
export interface FindOptions {
    withDeleted?: boolean;
    withRelations?: boolean;
    select?: string[];
}

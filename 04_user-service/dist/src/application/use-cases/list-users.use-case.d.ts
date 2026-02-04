import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/ports/repositories/user.repository.port';
export interface ListUsersQuery {
    limit?: number;
    offset?: number;
    status?: string;
    search?: string;
}
export declare class ListUsersUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    execute(query?: ListUsersQuery): Promise<{
        users: User[];
        total: number;
        page: number;
        limit: number;
    }>;
}

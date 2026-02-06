import { User } from '../../domain/entities/user-profile';
import { IUserRepository } from '../../domain/ports/user.repository.port';
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

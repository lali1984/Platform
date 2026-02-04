import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { GetUserUseCase } from '../../application/use-cases/get-user.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
export declare class UserController {
    private readonly createUserUseCase;
    private readonly getUserUseCase;
    private readonly updateUserUseCase;
    private readonly deleteUserUseCase;
    private readonly listUsersUseCase;
    constructor(createUserUseCase: CreateUserUseCase, getUserUseCase: GetUserUseCase, updateUserUseCase: UpdateUserUseCase, deleteUserUseCase: DeleteUserUseCase, listUsersUseCase: ListUsersUseCase);
    createUser(dto: CreateUserDto): Promise<UserResponseDto>;
    getUser(id: string): Promise<UserResponseDto>;
    updateUser(id: string, dto: UpdateUserDto): Promise<UserResponseDto>;
    deleteUser(id: string): Promise<void>;
    listUsers(limit?: number, offset?: number, status?: string, search?: string): Promise<{
        users: UserResponseDto[];
        total: number;
        page: number;
        limit: number;
    }>;
}

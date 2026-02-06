import { IUserRepository } from '../../domain/ports/user.repository.port';
import { User } from '../../domain/entities/user-profile';
export declare class GetUserUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    execute(userId: string): Promise<User>;
}

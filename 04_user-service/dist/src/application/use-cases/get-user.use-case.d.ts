import { IUserRepository } from '../../domain/ports/repositories/user.repository.port';
import { User } from '../../domain/entities/user.entity';
export declare class GetUserUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    execute(userId: string): Promise<User>;
}

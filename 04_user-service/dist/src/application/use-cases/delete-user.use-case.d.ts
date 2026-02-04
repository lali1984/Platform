import { IUserRepository } from '../../domain/ports/repositories/user.repository.port';
export declare class DeleteUserUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    execute(id: string): Promise<void>;
}

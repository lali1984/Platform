import { IUserRepository } from '../../domain/ports/user.repository.port';
export declare class DeleteUserUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    execute(id: string): Promise<void>;
}

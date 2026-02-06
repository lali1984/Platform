import { IUserRepository } from '../../domain/ports/user.repository.port';
import { EventPublisher } from '../../domain/ports/event-publisher.port';
import { User } from '../../domain/entities/user-profile';
import { UpdateUserDto } from '../dto/update-user';
export declare class UpdateUserUseCase {
    private readonly userRepository;
    private readonly eventPublisher;
    constructor(userRepository: IUserRepository, eventPublisher: EventPublisher);
    execute(userId: string, dto: UpdateUserDto): Promise<User>;
}

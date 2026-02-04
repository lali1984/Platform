import { IUserRepository } from '../../domain/ports/repositories/user.repository.port';
import { EventPublisher } from '../../domain/ports/event-publisher.port';
import { User } from '../../domain/entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
export declare class UpdateUserUseCase {
    private readonly userRepository;
    private readonly eventPublisher;
    constructor(userRepository: IUserRepository, eventPublisher: EventPublisher);
    execute(userId: string, dto: UpdateUserDto): Promise<User>;
}

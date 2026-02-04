import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { IUserRepository } from '../../domain/ports/repositories/user.repository.port';
import { OutboxEventPublisher } from '../../infrastructure/messaging/outbox-event-publisher.service';
export declare class CreateUserUseCase {
    private readonly userRepository;
    private readonly outboxEventPublisher;
    private readonly logger;
    constructor(userRepository: IUserRepository, outboxEventPublisher: OutboxEventPublisher);
    execute(dto: CreateUserDto): Promise<User>;
    private validateCreateUserDto;
    private determineCreationContext;
    private validateCreatedUser;
    private checkExistingUser;
    private publishUserCreatedEvent;
    private handleCreationError;
    createFromAuthEvent(dto: CreateUserDto & {
        authUserId: string;
    }): Promise<User>;
}

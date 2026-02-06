import { User } from '../../domain/entities/user-profile';
import { CreateUserDto } from '../dto/create-user';
import { IUserRepository } from '../../domain/ports/user.repository.port';
import { OutboxEventPublisher } from '../../infrastructure/messaging/outbox-publisher';
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

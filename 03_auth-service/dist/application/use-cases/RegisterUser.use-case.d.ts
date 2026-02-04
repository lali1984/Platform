import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/ports/UserRepository.port';
import { EventPublisher } from '../../domain/ports/EventPublisher.port';
export interface RegisterUserCommand {
    email: string;
    password: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    metadata?: {
        ipAddress?: string;
        userAgent?: string;
    };
}
export interface RegisterUserResult {
    success: boolean;
    user?: User;
    error?: string;
}
export declare class RegisterUserUseCase {
    private readonly userRepository;
    private readonly eventPublisher;
    constructor(userRepository: UserRepository, eventPublisher: EventPublisher);
    execute(command: RegisterUserCommand): Promise<RegisterUserResult>;
    private isValidEmail;
    private isValidPassword;
    private publishDomainEvents;
    private publishIntegrationEvent;
}

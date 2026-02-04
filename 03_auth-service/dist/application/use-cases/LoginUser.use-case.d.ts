import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/ports/UserRepository.port';
import { TokenService } from '../../domain/ports/TokenService.port';
import { EventPublisher } from '../../domain/ports/EventPublisher.port';
export interface LoginUserCommand {
    email: string;
    password: string;
    metadata?: {
        ipAddress?: string;
        userAgent?: string;
        deviceInfo?: string;
    };
}
export interface LoginUserResult {
    success: boolean;
    user?: User;
    tokens?: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    };
    requires2FA?: boolean;
    error?: string;
}
export declare class LoginUserUseCase {
    private readonly userRepository;
    private readonly tokenService;
    private readonly eventPublisher;
    constructor(userRepository: UserRepository, tokenService: TokenService, eventPublisher: EventPublisher);
    execute(command: LoginUserCommand): Promise<LoginUserResult>;
    private publishLoginFailedEvent;
    private publishLoginSuccessEvent;
    private publishDomainEvents;
}

import { UserRepository } from '../../domain/ports/UserRepository.port';
import { TokenService } from '../../domain/ports/TokenService.port';
import { TwoFactorService } from '../../domain/ports/TwoFactorService.port';
import { EventPublisher } from '../../domain/ports/EventPublisher.port';
export interface Generate2FASecretCommand {
    userId: string;
    email: string;
}
export interface Generate2FASecretResult {
    success: boolean;
    secret?: {
        secret: string;
        qrCodeUrl: string;
        otpauthUrl: string;
    };
    error?: string;
}
export interface Verify2FATokenCommand {
    userId: string;
    token: string;
}
export interface Verify2FATokenResult {
    success: boolean;
    tokens?: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    };
    error?: string;
}
export declare class TwoFactorUseCase {
    private readonly userRepository;
    private readonly tokenService;
    private readonly twoFactorService;
    private readonly eventPublisher;
    constructor(userRepository: UserRepository, tokenService: TokenService, twoFactorService: TwoFactorService, eventPublisher: EventPublisher);
    generateSecret(command: Generate2FASecretCommand): Promise<Generate2FASecretResult>;
    verifyToken(command: Verify2FATokenCommand): Promise<Verify2FATokenResult>;
    disable2FA(userId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    private publish2FAEnabledEvent;
    private publish2FASuccessEvent;
    private publish2FAFailedEvent;
    private publish2FADisabledEvent;
}

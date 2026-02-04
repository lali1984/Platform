"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUserUseCase = void 0;
const crypto_1 = __importDefault(require("crypto"));
class LoginUserUseCase {
    constructor(userRepository, tokenService, eventPublisher) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.eventPublisher = eventPublisher;
    }
    async execute(command) {
        try {
            // 🔴 Проверка блокировки аккаунта
            const lockoutResult = await this.userRepository.checkLockout(command.email);
            if (lockoutResult.isLocked) {
                await this.publishLoginFailedEvent(command.email, 'account_locked', command.metadata);
                return {
                    success: false,
                    error: lockoutResult.message || 'Account temporarily locked',
                };
            }
            // 1. Находим пользователя
            const user = await this.userRepository.findOne({ email: command.email });
            if (!user) {
                // 🔴 Инкремент неудачной попытки
                await this.userRepository.incrementFailedAttempt(command.email);
                await this.publishLoginFailedEvent(command.email, 'user_not_found', command.metadata);
                return {
                    success: false,
                    error: 'Invalid credentials',
                };
            }
            // 2. Проверяем активность аккаунта
            if (!user.isActive) {
                await this.userRepository.incrementFailedAttempt(command.email);
                await this.publishLoginFailedEvent(command.email, 'account_inactive', command.metadata);
                return {
                    success: false,
                    error: 'Account is deactivated',
                };
            }
            // 3. Проверяем пароль
            const isValidPassword = await user.validatePassword(command.password);
            if (!isValidPassword) {
                // 🔴 Инкремент неудачной попытки
                await this.userRepository.incrementFailedAttempt(command.email);
                await this.publishLoginFailedEvent(command.email, 'invalid_password', command.metadata);
                return {
                    success: false,
                    error: 'Invalid credentials',
                };
            }
            // 🔴 Сброс счетчика при успешном входе
            await this.userRepository.resetFailedAttempts(command.email);
            // 4. Обновляем время последнего входа
            user.login();
            await this.userRepository.save(user);
            // 5. Публикуем событие успешного входа
            await this.publishLoginSuccessEvent(user, command.metadata);
            // 6. Если включена 2FA, возвращаем информацию о необходимости 2FA
            if (user.isTwoFactorEnabled) {
                return {
                    success: true,
                    user,
                    requires2FA: true,
                };
            }
            // 7. Генерируем токены
            const tokenPayload = {
                userId: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                isTwoFactorEnabled: user.isTwoFactorEnabled,
                isTwoFactorAuthenticated: false,
            };
            const accessToken = this.tokenService.generateAccessToken(tokenPayload);
            const refreshToken = this.tokenService.generateRefreshToken(tokenPayload);
            // 8. Сохраняем refresh token
            await this.tokenService.saveRefreshToken(user.id, refreshToken);
            // 9. Публикуем доменные события
            await this.publishDomainEvents(user);
            return {
                success: true,
                user,
                tokens: {
                    accessToken,
                    refreshToken,
                    expiresIn: 15 * 60,
                },
            };
        }
        catch (error) {
            console.error('LoginUserUseCase error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Login failed',
            };
        }
    }
    // 🔴 УДАЛИТЬ методы из use-case, они теперь в репозитории
    // Все методы checkLockout, incrementFailedAttempt, resetFailedAttempts, lockAccount, getLoginAttempts
    // должны быть реализованы в TypeORMUserRepository
    async publishLoginFailedEvent(email, reason, metadata) {
        try {
            const event = {
                eventId: crypto_1.default.randomUUID(),
                eventType: 'UserLoginFailed',
                eventVersion: '1.0.0',
                timestamp: new Date().toISOString(),
                aggregateId: undefined,
                payload: {
                    email,
                    reason,
                    failedAt: new Date().toISOString(),
                    metadata,
                },
                metadata: {
                    sourceService: 'auth-service',
                    correlationId: crypto_1.default.randomUUID(),
                },
            };
            await this.eventPublisher.publish(event);
        }
        catch (error) {
            console.error('Failed to publish login failed event:', error);
        }
    }
    async publishLoginSuccessEvent(user, metadata) {
        try {
            const event = {
                eventId: crypto_1.default.randomUUID(),
                eventType: 'UserLoggedIn',
                eventVersion: '1.0.0',
                timestamp: new Date().toISOString(),
                aggregateId: user.id,
                payload: {
                    userId: user.id,
                    email: user.email,
                    loginAt: new Date().toISOString(),
                    metadata,
                },
                metadata: {
                    sourceService: 'auth-service',
                    correlationId: crypto_1.default.randomUUID(),
                },
            };
            await this.eventPublisher.publish(event);
        }
        catch (error) {
            console.error('Failed to publish login success event:', error);
        }
    }
    async publishDomainEvents(user) {
        const events = user.getDomainEvents();
        for (const event of events) {
            try {
                const baseEvent = {
                    eventId: crypto_1.default.randomUUID(),
                    eventType: event.type,
                    eventVersion: '1.0.0',
                    timestamp: new Date().toISOString(),
                    aggregateId: event.data.userId || undefined,
                    payload: event.data,
                    metadata: {
                        sourceService: 'auth-service',
                        correlationId: crypto_1.default.randomUUID(),
                    },
                };
                await this.eventPublisher.publish(baseEvent);
            }
            catch (error) {
                console.error(`Failed to publish domain event ${event.type}:`, error);
            }
        }
        user.clearDomainEvents();
    }
}
exports.LoginUserUseCase = LoginUserUseCase;
//# sourceMappingURL=LoginUser.use-case.js.map
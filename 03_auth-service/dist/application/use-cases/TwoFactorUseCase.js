"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoFactorUseCase = void 0;
const crypto_1 = __importDefault(require("crypto"));
class TwoFactorUseCase {
    constructor(userRepository, tokenService, twoFactorService, eventPublisher) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.twoFactorService = twoFactorService;
        this.eventPublisher = eventPublisher;
    }
    async generateSecret(command) {
        try {
            // 1. Находим пользователя
            const user = await this.userRepository.findOne({ id: command.userId });
            if (!user) {
                return {
                    success: false,
                    error: 'User not found',
                };
            }
            // 2. Проверяем, что email совпадает
            if (user.email !== command.email) {
                return {
                    success: false,
                    error: 'Invalid email',
                };
            }
            // 3. Генерируем секрет и QR код
            const secretData = await this.twoFactorService.generateSecretWithQR(command.email);
            // 4. Сохраняем секрет в пользователе
            user.enableTwoFactor(secretData.secret);
            await this.userRepository.save(user);
            // 5. Публикуем событие
            await this.publish2FAEnabledEvent(user);
            return {
                success: true,
                secret: secretData,
            };
        }
        catch (error) {
            console.error('Generate2FASecret error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to generate 2FA secret',
            };
        }
    }
    async verifyToken(command) {
        try {
            // 1. Находим пользователя
            const user = await this.userRepository.findOne({ id: command.userId });
            if (!user) {
                return {
                    success: false,
                    error: 'User not found',
                };
            }
            // 2. Проверяем, что 2FA включена
            if (!user.isTwoFactorEnabled || !user.twoFactorSecret) {
                return {
                    success: false,
                    error: '2FA is not enabled for this user',
                };
            }
            // 3. Верифицируем токен
            const isValid = this.twoFactorService.verifyToken(user.twoFactorSecret, command.token);
            if (!isValid) {
                await this.publish2FAFailedEvent(user);
                return {
                    success: false,
                    error: 'Invalid 2FA token',
                };
            }
            // 4. Генерируем токены с флагом 2FA аутентификации
            const tokenPayload = {
                userId: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                isTwoFactorEnabled: user.isTwoFactorEnabled,
                isTwoFactorAuthenticated: true,
            };
            const accessToken = this.tokenService.generateAccessToken(tokenPayload);
            const refreshToken = this.tokenService.generateRefreshToken(tokenPayload);
            // 5. Сохраняем refresh token
            await this.tokenService.saveRefreshToken(user.id, refreshToken);
            // 6. Публикуем событие успешной 2FA аутентификации
            await this.publish2FASuccessEvent(user);
            return {
                success: true,
                tokens: {
                    accessToken,
                    refreshToken,
                    expiresIn: 15 * 60, // 15 минут
                },
            };
        }
        catch (error) {
            console.error('Verify2FAToken error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to verify 2FA token',
            };
        }
    }
    async disable2FA(userId) {
        try {
            const user = await this.userRepository.findOne({ id: userId });
            if (!user) {
                return {
                    success: false,
                    error: 'User not found',
                };
            }
            user.disableTwoFactor();
            await this.userRepository.save(user);
            await this.publish2FADisabledEvent(user);
            return { success: true };
        }
        catch (error) {
            console.error('Disable2FA error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to disable 2FA',
            };
        }
    }
    async publish2FAEnabledEvent(user) {
        try {
            const event = {
                eventId: crypto_1.default.randomUUID(),
                eventType: 'TwoFactorEnabled',
                eventVersion: '1.0.0',
                timestamp: new Date().toISOString(),
                aggregateId: user.id,
                payload: {
                    userId: user.id,
                    email: user.email,
                    enabledAt: new Date().toISOString(),
                },
                metadata: {
                    sourceService: 'auth-service',
                    correlationId: crypto_1.default.randomUUID(),
                },
            };
            await this.eventPublisher.publish(event);
        }
        catch (error) {
            console.error('Failed to publish 2FA enabled event:', error);
        }
    }
    async publish2FASuccessEvent(user) {
        try {
            const event = {
                eventId: crypto_1.default.randomUUID(),
                eventType: 'TwoFactorAuthenticated',
                eventVersion: '1.0.0',
                timestamp: new Date().toISOString(),
                aggregateId: user.id,
                payload: {
                    userId: user.id,
                    email: user.email,
                    authenticatedAt: new Date().toISOString(),
                },
                metadata: {
                    sourceService: 'auth-service',
                    correlationId: crypto_1.default.randomUUID(),
                },
            };
            await this.eventPublisher.publish(event);
        }
        catch (error) {
            console.error('Failed to publish 2FA success event:', error);
        }
    }
    async publish2FAFailedEvent(user) {
        try {
            const event = {
                eventId: crypto_1.default.randomUUID(),
                eventType: 'TwoFactorFailed',
                eventVersion: '1.0.0',
                timestamp: new Date().toISOString(),
                aggregateId: user.id,
                payload: {
                    userId: user.id,
                    email: user.email,
                    failedAt: new Date().toISOString(),
                },
                metadata: {
                    sourceService: 'auth-service',
                    correlationId: crypto_1.default.randomUUID(),
                },
            };
            await this.eventPublisher.publish(event);
        }
        catch (error) {
            console.error('Failed to publish 2FA failed event:', error);
        }
    }
    async publish2FADisabledEvent(user) {
        try {
            const event = {
                eventId: crypto_1.default.randomUUID(),
                eventType: 'TwoFactorDisabled',
                eventVersion: '1.0.0',
                timestamp: new Date().toISOString(),
                aggregateId: user.id,
                payload: {
                    userId: user.id,
                    email: user.email,
                    disabledAt: new Date().toISOString(),
                },
                metadata: {
                    sourceService: 'auth-service',
                    correlationId: crypto_1.default.randomUUID(),
                },
            };
            await this.eventPublisher.publish(event);
        }
        catch (error) {
            console.error('Failed to publish 2FA disabled event:', error);
        }
    }
}
exports.TwoFactorUseCase = TwoFactorUseCase;
//# sourceMappingURL=TwoFactorUseCase.js.map
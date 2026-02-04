"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUserUseCase = void 0;
const User_1 = require("../../domain/entities/User");
const contracts_1 = require("@platform/contracts");
const crypto_1 = __importDefault(require("crypto"));
class RegisterUserUseCase {
    constructor(userRepository, eventPublisher) {
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
    }
    async execute(command) {
        try {
            // 1. Валидация email
            if (!this.isValidEmail(command.email)) {
                return {
                    success: false,
                    error: 'Invalid email format',
                };
            }
            // 2. Валидация пароля (синхронизирована с фронтендом)
            if (!this.isValidPassword(command.password)) {
                return {
                    success: false,
                    error: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character',
                };
            }
            // 3. Проверка уникальности email
            const emailExists = await this.userRepository.exists({ email: command.email });
            if (emailExists) {
                return {
                    success: false,
                    error: 'User with this email already exists',
                };
            }
            // 4. Проверка уникальности username (если предоставлен)
            if (command.username) {
                const usernameExists = await this.userRepository.exists({ username: command.username });
                if (usernameExists) {
                    return {
                        success: false,
                        error: 'User with this username already exists',
                    };
                }
            }
            // 5. Создание пользователя
            const user = await User_1.User.create({
                email: command.email,
                password: command.password,
                username: command.username,
                firstName: command.firstName,
                lastName: command.lastName,
            });
            // 6. Сохранение пользователя
            const savedUser = await this.userRepository.save(user);
            // 7. Публикация доменных событий
            await this.publishDomainEvents(user);
            // 8. Публикация интеграционного события (асинхронно)
            this.publishIntegrationEvent(savedUser, command.metadata).catch(error => {
                console.error('Failed to publish integration event:', error);
            });
            return {
                success: true,
                user: savedUser,
            };
        }
        catch (error) {
            console.error('RegisterUserUseCase error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Registration failed',
            };
        }
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    isValidPassword(password) {
        // 🔴 Синхронизировано с требованиями фронтенда
        return password.length >= 8 &&
            /[a-z]/.test(password) &&
            /[A-Z]/.test(password) &&
            /\d/.test(password) &&
            /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
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
    async publishIntegrationEvent(user, metadata) {
        if (!this.eventPublisher.isAvailable()) {
            console.warn('Event publisher not available, skipping integration event');
            return;
        }
        const event = (0, contracts_1.createUserRegisteredEvent)(user.id, user.email, user.firstName || '', {
            metadata: {
                ...metadata,
                sourceService: 'auth-service',
            },
        });
        await this.eventPublisher.publish(event);
    }
}
exports.RegisterUserUseCase = RegisterUserUseCase;
//# sourceMappingURL=RegisterUser.use-case.js.map
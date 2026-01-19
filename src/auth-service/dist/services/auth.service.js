"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
// src/services/auth.service.ts
const user_repository_1 = require("../repositories/user.repository");
const validators_1 = require("../utils/validators");
const event_service_1 = __importDefault(require("./event.service"));
class AuthService {
    constructor() {
        this.userRepository = new user_repository_1.UserRepository();
    }
    async register(registerData, metadata) {
        try {
            // 1. Валидация email
            if (!validators_1.Validators.isValidEmail(registerData.email)) {
                return { success: false, error: 'Invalid email format' };
            }
            // 2. Валидация пароля
            const passwordValidation = validators_1.Validators.isValidPassword(registerData.password);
            if (!passwordValidation.isValid) {
                return { success: false, error: `Password validation failed: ${passwordValidation.errors.join(', ')}` };
            }
            // 3. Проверка уникальности email
            const existingUser = await this.userRepository.findByEmail(registerData.email);
            if (existingUser) {
                return { success: false, error: 'User with this email already exists' };
            }
            // 4. Создание пользователя
            const user = await this.userRepository.createWithPassword({
                email: validators_1.Validators.sanitizeEmail(registerData.email),
                password: registerData.password
            });
            // 5. Отправляем событие регистрации
            try {
                await event_service_1.default.publishUserRegistered({
                    userId: user.id,
                    email: user.email,
                    metadata: {
                        ...metadata,
                        isEmailVerified: user.isEmailVerified || false,
                        isActive: user.isActive || true,
                        isTwoFactorEnabled: user.isTwoFactorEnabled || false,
                    },
                });
            }
            catch (eventError) {
                console.error('❌ Ошибка отправки события регистрации:', eventError);
                // Не прерываем регистрацию из-за ошибки событий
            }
            // 6. Возвращаем без sensitive данных
            const { passwordHash, twoFactorSecret, resetPasswordToken, ...safeUser } = user;
            return {
                success: true,
                user: safeUser
            };
        }
        catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: 'Registration failed' };
        }
    }
    async login(loginData, metadata) {
        try {
            // 1. Находим пользователя
            const user = await this.userRepository.findByEmail(loginData.email);
            if (!user) {
                // Отправляем событие ошибки входа
                try {
                    await event_service_1.default.publishUserLoginFailed({
                        email: loginData.email,
                        reason: 'user_not_found',
                        metadata,
                    });
                }
                catch (eventError) {
                    console.error('❌ Ошибка отправки события ошибки входа:', eventError);
                }
                return { success: false, error: 'Invalid credentials' };
            }
            // 2. Проверяем активность
            if (!user.isActive) {
                try {
                    await event_service_1.default.publishUserLoginFailed({
                        email: loginData.email,
                        reason: 'account_inactive',
                        metadata,
                    });
                }
                catch (eventError) {
                    console.error('❌ Ошибка отправки события ошибки входа:', eventError);
                }
                return { success: false, error: 'Account is deactivated' };
            }
            // 3. Проверяем пароль
            const isValidPassword = await user.validatePassword(loginData.password);
            if (!isValidPassword) {
                try {
                    await event_service_1.default.publishUserLoginFailed({
                        email: loginData.email,
                        reason: 'invalid_password',
                        metadata,
                    });
                }
                catch (eventError) {
                    console.error('❌ Ошибка отправки события ошибки входа:', eventError);
                }
                return { success: false, error: 'Invalid credentials' };
            }
            // 4. Отправляем событие успешного входа
            try {
                await event_service_1.default.publishUserLoggedIn({
                    userId: user.id,
                    email: user.email,
                    metadata: {
                        ...metadata,
                        isTwoFactorEnabled: user.isTwoFactorEnabled || false,
                        loginMethod: 'password',
                    },
                });
            }
            catch (eventError) {
                console.error('❌ Ошибка отправки события входа:', eventError);
                // Не прерываем вход из-за ошибки событий
            }
            // 5. Возвращаем без sensitive данных
            const { passwordHash, twoFactorSecret, resetPasswordToken, ...safeUser } = user;
            return {
                success: true,
                user: safeUser
            };
        }
        catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Login failed' };
        }
    }
    async validateUser(email, password) {
        const user = await this.userRepository.findByEmail(email);
        if (!user)
            return null;
        const isValid = await user.validatePassword(password);
        return isValid ? user : null;
    }
    // Методы для работы с 2FA
    async enableTwoFactor(userId, email, method) {
        // Реализация включения 2FA...
        // Отправляем событие
        try {
            await event_service_1.default.publishTwoFactorEnabled({
                userId,
                email,
                method,
            });
        }
        catch (eventError) {
            console.error('❌ Ошибка отправки события 2FA:', eventError);
        }
    }
    async requestPasswordReset(email, resetToken) {
        const user = await this.userRepository.findByEmail(email);
        if (!user)
            return;
        // Логика сброса пароля...
        // Отправляем событие
        try {
            await event_service_1.default.publishPasswordResetRequested({
                userId: user.id,
                email: user.email,
                resetToken,
            });
        }
        catch (eventError) {
            console.error('❌ Ошибка отправки события сброса пароля:', eventError);
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map
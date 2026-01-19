
import 'reflect-metadata';
import { UserRepository } from '../repositories/user.repository';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';
import { UserEntity } from '../entities/User';
import eventService from './event.service';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(registerData: RegisterDto, metadata?: { ipAddress?: string; userAgent?: string }): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      console.log('🔍 Начало регистрации:', { 
        username: registerData.username,
        email: registerData.email 
      });
      
      // 1. Преобразуем plain object в instance DTO
      const dto = plainToInstance(RegisterDto, registerData);
      console.log('✅ DTO создан:', dto);
      
      // 2. Валидация
      const validationErrors = await validate(dto);
      console.log('📊 Результат валидации:', validationErrors.length, 'ошибок');
      
      if (validationErrors.length > 0) {
        const errorMessages = validationErrors
          .map(err => Object.values(err.constraints || {}))
          .flat()
          .join(', ');
        console.log('❌ Ошибки:', errorMessages);
        return { success: false, error: errorMessages };
      }

      console.log('✅ Валидация прошла успешно');
      
      // 3. Проверка уникальности username (если предоставлен)
      if (registerData.username) {
        const existingUserByUsername = await this.userRepository.findByUsername(registerData.username);
        if (existingUserByUsername) {
          return { success: false, error: 'User with this username already exists' };
        }
      }

      // 4. Проверка уникальности email
      const email = registerData.email.toLowerCase().trim();
      const existingUserByEmail = await this.userRepository.findByEmail(email);
      if (existingUserByEmail) {
        return { success: false, error: 'User with this email already exists' };
      }

      // 5. Создание пользователя с новыми полями
      const user = await this.userRepository.createWithPassword({
        username: registerData.username,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: email,
        password: registerData.password
      });

      console.log('🎉 Пользователь создан:', user.id, user.username);
      
      // 6. Отправляем событие регистрации
      try {
        await eventService.publishUserRegistered({
          userId: user.id,
          username: user.username,
          email: user.email,
          metadata: {
            ...metadata,
            firstName: user.firstName,
            lastName: user.lastName,
            isEmailVerified: user.isEmailVerified || false,
            isActive: user.isActive || true,
            isTwoFactorEnabled: user.isTwoFactorEnabled || false,
          },
        });
      } catch (eventError) {
        console.error('❌ Ошибка отправки события:', eventError);
      }

      // 7. Возвращаем без sensitive данных
      const { passwordHash, twoFactorSecret, resetPasswordToken, ...safeUser } = user;
      return { 
        success: true, 
        user: safeUser 
      };

    } catch (error) {
      console.error('🔥 Registration error:', error);
      
      let errorMessage = 'Registration failed';
      if (error instanceof Error) {
        errorMessage += ': ' + error.message;
      } else if (typeof error === 'string') {
        errorMessage += ': ' + error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage += ': ' + (error as any).message;
      }
      
      return { success: false, error: errorMessage };
    }
  }

  async login(loginData: LoginDto, metadata?: { ipAddress?: string; userAgent?: string; deviceInfo?: string }): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      // 1. Находим пользователя
      const user = await this.userRepository.findByEmail(loginData.email);
      
      if (!user) {
        // Отправляем событие ошибки входа
        try {
          await eventService.publishUserLoginFailed({
            email: loginData.email,
            reason: 'user_not_found',
            metadata,
          });
        } catch (eventError) {
          console.error('❌ Ошибка отправки события ошибки входа:', eventError);
        }
        
        return { success: false, error: 'Invalid credentials' };
      }

      // 2. Проверяем активность
      if (!user.isActive) {
        try {
          await eventService.publishUserLoginFailed({
            email: loginData.email,
            reason: 'account_inactive',
            metadata,
          });
        } catch (eventError) {
          console.error('❌ Ошибка отправки события ошибки входа:', eventError);
        }
        
        return { success: false, error: 'Account is deactivated' };
      }

      // 3. Проверяем пароль
      const isValidPassword = await user.validatePassword(loginData.password);
      
      if (!isValidPassword) {
        try {
          await eventService.publishUserLoginFailed({
            email: loginData.email,
            reason: 'invalid_password',
            metadata,
          });
        } catch (eventError) {
          console.error('❌ Ошибка отправки события ошибки входа:', eventError);
        }
        
        return { success: false, error: 'Invalid credentials' };
      }

      // 4. Отправляем событие успешного входа
      try {
        await eventService.publishUserLoggedIn({
          userId: user.id,
          email: user.email,
          metadata: {
            ...metadata,
            isTwoFactorEnabled: user.isTwoFactorEnabled || false,
            loginMethod: 'password',
          },
        });
      } catch (eventError) {
        console.error('❌ Ошибка отправки события входа:', eventError);
        // Не прерываем вход из-за ошибки событий
      }

      // 5. Возвращаем без sensitive данных
      const { passwordHash, twoFactorSecret, resetPasswordToken, ...safeUser } = user;
      return { 
        success: true, 
        user: safeUser 
      };

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  async validateUser(email: string, password: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;

    const isValid = await user.validatePassword(password);
    return isValid ? user : null;
  }

  // Методы для работы с 2FA
  async enableTwoFactor(userId: string, email: string, method: 'app' | 'sms' | 'email'): Promise<void> {
    // Реализация включения 2FA...
    
    // Отправляем событие
    try {
      await eventService.publishTwoFactorEnabled({
        userId,
        email,
        method,
      });
    } catch (eventError) {
      console.error('❌ Ошибка отправки события 2FA:', eventError);
    }
  }

  async requestPasswordReset(email: string, resetToken?: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return;

    // Логика сброса пароля...
    
    // Отправляем событие
    try {
      await eventService.publishPasswordResetRequested({
        userId: user.id,
        email: user.email,
        resetToken,
      });
    } catch (eventError) {
      console.error('❌ Ошибка отправки события сброса пароля:', eventError);
    }
  }
}
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import { authenticator } from 'otplib';
// import qrcode from 'qrcode';

// import userRepository from '../repositories/user.repository';
// import eventService from './event.service';
// import { CreateUserDTO, LoginDTO, UserResponse } from '../types/user';

// export class AuthService {
//   private saltRounds = 10;
//   private jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-this';
//   private refreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-this';

//   constructor() {
//     // Инициализируем event service асинхронно, не блокируя запуск
//     this.initializeEventService();
//   }

//   private async initializeEventService(): Promise<void> {
//     try {
//       await eventService.initialize();
//       console.log('Auth service event system initialized');
//     } catch (error: any) {
//       console.warn('Event service initialization warning:', error.message);
//       // В development режиме продолжаем без событий
//       if (process.env.NODE_ENV === 'production') {
//         console.error('Event service initialization failed in production:', error);
//       }
//     }
//   }

//   async register(userData: CreateUserDTO, metadata?: {
//     userAgent?: string;
//     ipAddress?: string;
//   }): Promise<{
//     user: UserResponse;
//     accessToken: string;
//     refreshToken: string;
//   }> {
//     // Проверяем существование пользователя
//     const existingUser = await userRepository.findByEmail(userData.email);
//     if (existingUser) {
//       throw new Error('User with this email already exists');
//     }

//     // Хешируем пароль
//     const passwordHash = await bcrypt.hash(userData.password, this.saltRounds);

//     // Создаем пользователя
//     const user = await userRepository.create({
//       email: userData.email,
//       password: passwordHash
//     });

//     // Генерируем токены
//     const accessToken = this.generateAccessToken(user.id);
//     const refreshToken = this.generateRefreshToken(user.id);

//     // Публикуем событие в фоновом режиме (не блокируем ответ)
//     this.publishUserRegisteredEvent(user, metadata).catch(error => {
//       console.error('Failed to publish user registered event:', error);
//     });

//     // Возвращаем ответ
//     return {
//       user: this.mapToUserResponse(user),
//       accessToken,
//       refreshToken
//     };
//   }

//   private async publishUserRegisteredEvent(user: any, metadata?: {
//     userAgent?: string;
//     ipAddress?: string;
//   }): Promise<void> {
//     try {
//       await eventService.publishUserRegistered({
//         userId: user.id,
//         email: user.email,
//         metadata
//       });
//     } catch (error: any) {
//       console.error('Error in publishUserRegisteredEvent:', error);
//       // Не пробрасываем ошибку дальше
//     }
//   }

//   async login(loginData: LoginDTO, metadata?: {
//     userAgent?: string;
//     ipAddress?: string;
//   }): Promise<{
//     user: UserResponse;
//     requires2FA: boolean;
//     accessToken?: string;
//     refreshToken?: string;
//   }> {
//     // Находим пользователя
//     const user = await userRepository.findByEmail(loginData.email);
//     if (!user) {
//       throw new Error('Invalid credentials');
//     }

//     // Проверяем пароль
//     const isValidPassword = await bcrypt.compare(loginData.password, user.password_hash);
//     if (!isValidPassword) {
//       throw new Error('Invalid credentials');
//     }

//     const userResponse = this.mapToUserResponse(user);

//     if (user.two_factor_enabled) {
//       return {
//         user: userResponse,
//         requires2FA: true
//       };
//     }

//     // Генерируем токены
//     const accessToken = this.generateAccessToken(user.id);
//     const refreshToken = this.generateRefreshToken(user.id);

//     // Публикуем событие входа в фоновом режиме
//     this.publishUserLoggedInEvent(user, metadata).catch(error => {
//       console.error('Failed to publish user logged in event:', error);
//     });

//     return {
//       user: userResponse,
//       requires2FA: false,
//       accessToken,
//       refreshToken
//     };
//   }

//   private async publishUserLoggedInEvent(user: any, metadata?: {
//     userAgent?: string;
//     ipAddress?: string;
//   }): Promise<void> {
//     try {
//       await eventService.publishUserLoggedIn({
//         userId: user.id,
//         email: user.email,
//         metadata
//       });
//     } catch (error: any) {
//       console.error('Error in publishUserLoggedInEvent:', error);
//     }
//   }

//   // Методы для 2FA
//   async generate2FASecret(email: string): Promise<{
//     secret: string;
//     qrCodeUrl: string;
//   }> {
//     const user = await userRepository.findByEmail(email);
//     if (!user) {
//       throw new Error('User not found');
//     }

//     // Генерируем секрет для 2FA
//     const secret = authenticator.generateSecret();
    
//     // Создаем otpauth URL
//     const serviceName = 'Platform Ecosystem';
//     const otpauthUrl = authenticator.keyuri(email, serviceName, secret);
    
//     // Генерируем QR код
//     const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

//     return {
//       secret,
//       qrCodeUrl
//     };
//   }

//   async verify2FAToken(email: string, token: string): Promise<boolean> {
//     const user = await userRepository.findByEmail(email);
//     if (!user || !user.two_factor_secret) {
//       return false;
//     }

//     // Проверяем токен с использованием секрета пользователя
//     return authenticator.verify({ token, secret: user.two_factor_secret });
//   }

//   async enable2FA(userId: string, secret: string): Promise<void> {
//     // В реальной реализации здесь бы мы обновляли пользователя в БД
//     console.log(`2FA enabled for user ${userId} with secret ${secret.substring(0, 10)}...`);
//     // Реализация обновления пользователя будет позже
//   }

//   async disable2FA(userId: string): Promise<void> {
//     // В реальной реализации здесь бы мы обновляли пользователя в БД
//     console.log(`2FA disabled for user ${userId}`);
//   }

//   // Методы для работы с токенами
//   generateAccessToken(userId: string): string {
//     return jwt.sign(
//       { userId, type: 'access' },
//       this.jwtSecret,
//       { expiresIn: '15m' }
//     );
//   }

//   generateRefreshToken(userId: string): string {
//     return jwt.sign(
//       { userId, type: 'refresh' },
//       this.refreshSecret,
//       { expiresIn: '7d' }
//     );
//   }

//   verifyToken(token: string, isRefresh = false): any {
//     try {
//       const secret = isRefresh ? this.refreshSecret : this.jwtSecret;
//       return jwt.verify(token, secret);
//     } catch (error: any) {
//       throw new Error('Invalid token');
//     }
//   }

//   private mapToUserResponse(user: any): UserResponse {
//     return {
//       id: user.id,
//       email: user.email,
//       is_email_verified: user.is_email_verified,
//       two_factor_enabled: user.two_factor_enabled,
//       created_at: user.created_at ? user.created_at.toISOString() : new Date().toISOString()
//     };
//   }
// }

// export default new AuthService();


import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

interface User {
  id: string;
  email: string;
  password: string;
  name?: string;
  twoFASecret?: string;
  twoFAEnabled: boolean;
  refreshToken?: string;
  createdAt: Date;
}

interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    twoFAEnabled: boolean;
  };
  accessToken: string;
  refreshToken: string;
  requires2FA?: boolean;
}

interface TwoFAResult {
  secret: string;
  qrCodeUrl: string;
  otpauthUrl: string;
}

export class AuthService {
  private users: Map<string, User> = new Map();
  
  // Конфигурация JWT
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-32-chars-long';
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-32-chars-long';
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  // Регистрация пользователя
  async register(data: RegisterData): Promise<Omit<User, 'password' | 'refreshToken'>> {
    // Проверка существующего пользователя
    const existingUser = Array.from(this.users.values()).find(
      user => user.email.toLowerCase() === data.email.toLowerCase()
    );
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Создание пользователя
    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: data.email,
      password: hashedPassword,
      name: data.name,
      twoFAEnabled: false,
      createdAt: new Date()
    };

    // Сохранение пользователя
    this.users.set(user.id, user);

    // Возврат без пароля и refreshToken
    const { password, refreshToken, ...userWithoutSensitiveData } = user;
    return userWithoutSensitiveData;
  }

  // Вход пользователя
  async login(email: string, password: string): Promise<LoginResponse> {
    // Поиск пользователя
    const user = Array.from(this.users.values()).find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Проверка пароля
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Если включен 2FA, возвращаем флаг requires2FA
    if (user.twoFAEnabled) {
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          twoFAEnabled: true
        },
        accessToken: '',
        refreshToken: '',
        requires2FA: true
      };
    }

    // Генерация токенов
    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken(user.id);

    // Сохранение refresh токена
    user.refreshToken = refreshToken;
    this.users.set(user.id, user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        twoFAEnabled: false
      },
      accessToken,
      refreshToken
    };
  }

  // Генерация 2FA секрета
  async generate2FASecret(userId: string): Promise<TwoFAResult> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Генерация секрета
    const secret = speakeasy.generateSecret({
      name: `PlatformEcosystem:${user.email}`,
      length: 20,
      issuer: 'PlatformEcosystem'
    });

    // Сохранение секрета у пользователя
    user.twoFASecret = secret.base32;
    this.users.set(user.id, user);

    // Генерация QR кода
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

    return {
      secret: secret.base32,
      qrCodeUrl,
      otpauthUrl: secret.otpauth_url || ''
    };
  }

  // Верификация 2FA токена
  async verify2FAToken(userId: string, token: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user || !user.twoFASecret) {
      throw new Error('2FA not configured for this user');
    }

    // Верификация токена
    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token,
      window: 1 // Разрешить отклонение в 30 секунд
    });

    // Если токен валидный, включаем 2FA для пользователя
    if (verified && !user.twoFAEnabled) {
      user.twoFAEnabled = true;
      this.users.set(user.id, user);
    }

    return verified;
  }

  // Вход с 2FA
  async loginWith2FA(userId: string, token: string): Promise<LoginResponse> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Проверка 2FA токена
    const is2FAValid = await this.verify2FAToken(userId, token);
    if (!is2FAValid) {
      throw new Error('Invalid 2FA token');
    }

    // Генерация токенов
    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken(user.id);

    // Сохранение refresh токена
    user.refreshToken = refreshToken;
    this.users.set(user.id, user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        twoFAEnabled: true
      },
      accessToken,
      refreshToken
    };
  }

  // Обновление access токена
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Верификация refresh токена
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as { userId: string };
      
      // Поиск пользователя по refresh токену
      const user = Array.from(this.users.values()).find(
        u => u.refreshToken === refreshToken
      );
      
      if (!user) {
        throw new Error('Invalid refresh token');
      }

      // Проверка совпадения userId
      if (user.id !== decoded.userId) {
        throw new Error('Token mismatch');
      }

      // Генерация нового access токена
      const accessToken = this.generateAccessToken(user.id, user.email);

      return { accessToken };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  // Отключение 2FA
  async disable2FA(userId: string, token: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user || !user.twoFASecret) {
      throw new Error('2FA not configured for this user');
    }

    // Проверка токена перед отключением
    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (verified) {
      user.twoFAEnabled = false;
      user.twoFASecret = undefined;
      this.users.set(user.id, user);
      return true;
    }

    return false;
  }

  // Приватные методы
  private generateAccessToken(userId: string, email: string): string {
    return jwt.sign(
      { 
        userId, 
        email,
        type: 'access'
      },
      this.JWT_SECRET,
      { 
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
        algorithm: 'HS256'
      }
    );
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign(
      { 
        userId,
        type: 'refresh'
      },
      this.JWT_REFRESH_SECRET,
      { 
        expiresIn: this.REFRESH_TOKEN_EXPIRY,
        algorithm: 'HS256'
      }
    );
  }

  // Вспомогательные методы
  getUserById(userId: string): User | undefined {
    return this.users.get(userId);
  }

  getAllUsers(): Omit<User, 'password' | 'refreshToken' | 'twoFASecret'>[] {
    return Array.from(this.users.values()).map(user => {
      const { password, refreshToken, twoFASecret, ...safeUser } = user;
      return safeUser;
    });
  }
}
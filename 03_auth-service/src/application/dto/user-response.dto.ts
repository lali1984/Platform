// /Users/valery/Projects/platform-ecosystem/03_auth-service/src/application/dto/user-response.dto.ts
import { UserAuthData } from '@platform/contracts';
import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/ports/UserRepository.port';

export type UserResponseDto = UserAuthData;

export class UserResponseMapper {
  constructor(private readonly userRepository: UserRepository) {}

  async toDto(user: User): Promise<UserResponseDto> {
    // Загружаем роль и права асинхронно
    const [role, permissions] = await Promise.all([
      this.userRepository.findUserRole(user.id),
      this.userRepository.findUserPermissions(user.id),
    ]);

    return {
      id: user.id,
      email: user.email,
      username: user.username ?? '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      role: role || 'user', // fallback
      permissions: permissions || [],
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      createdAt: String(user.createdAt),
      updatedAt: String(user.updatedAt),
      lastLoginAt: user.lastLoginAt ? String(user.lastLoginAt) : undefined,
    };
  }
}
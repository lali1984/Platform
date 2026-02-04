"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResponseMapper = void 0;
class UserResponseMapper {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async toDto(user) {
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
exports.UserResponseMapper = UserResponseMapper;
//# sourceMappingURL=user-response.dto.js.map
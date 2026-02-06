import { User } from '../../domain/entities/user-profile';
import { UserProfileEntity } from '../../infrastructure/persistence/entities/user-profile';
import { UserResponseDto } from '../../presentation/dto/user-response.dto';
export declare class UserMapper {
    static toResponse(user: User): UserResponseDto;
    static toResponseFromEntity(entity: UserProfileEntity): UserResponseDto;
    static toEntity(user: User): UserProfileEntity;
    static toDomain(entity: UserProfileEntity): User;
    private static calculateProfileCompletion;
    static updateEntityFromDomain(entity: UserProfileEntity, user: User): void;
    static validateIntegrity(entity: UserProfileEntity, user: User): string[];
}

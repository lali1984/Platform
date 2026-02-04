import { UserAuthData } from '@platform/contracts';
import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/ports/UserRepository.port';
export type UserResponseDto = UserAuthData;
export declare class UserResponseMapper {
    private readonly userRepository;
    constructor(userRepository: UserRepository);
    toDto(user: User): Promise<UserResponseDto>;
}

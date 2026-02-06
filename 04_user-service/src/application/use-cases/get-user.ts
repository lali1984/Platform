// services/user-service/src/application/use-cases/get-user.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/ports/user.repository.port';
import { User } from '../../domain/entities/user-profile';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject('UserRepository') // Исправлено с 'IUserRepository'
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    if (!user.isActive) {
      throw new Error(`User ${userId} is deactivated`);
    }

    return user;
  }
}
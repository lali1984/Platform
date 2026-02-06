import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/ports/user.repository.port';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string): Promise<void> {
    // 1. Находим пользователя
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new Error('User not found');
    }

    // 2. Деактивируем пользователя (soft delete)
    user.deactivate();
    
    // 3. Сохраняем изменения - используем save вместо update
    await this.userRepository.save(user);
    
    // Примечание: если нужен hard delete, использовать:
    // await this.userRepository.delete(id);
  }
}
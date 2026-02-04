import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/ports/repositories/user.repository.port';
import { EventPublisher, EventUtils } from '../../domain/ports/event-publisher.port';
import { User } from '../../domain/entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('EventPublisher')
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(userId: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const updatedFields: string[] = [];
    
    // Подготавливаем данные для обновления
    const updateData: any = {};
    
    // Обновляем поля только если они переданы
    if (dto.firstName !== undefined) {
      updateData.firstName = dto.firstName;
      updatedFields.push('firstName');
    }

    if (dto.lastName !== undefined) {
      updateData.lastName = dto.lastName;
      updatedFields.push('lastName');
    }

    if (dto.phone !== undefined) {
      updateData.phone = dto.phone;
      updatedFields.push('phone');
    }
    
    if (dto.avatarUrl !== undefined) {
      updateData.avatarUrl = dto.avatarUrl;
      updatedFields.push('avatarUrl');
    }
    
    if (dto.metadata !== undefined) {
      updateData.metadata = dto.metadata;
      updatedFields.push('metadata');
    }
    
    // Применяем обновления
    user.updateProfile(updateData);
    
    // Сохраняем
    await this.userRepository.save(user);
    
    // Публикуем событие обновления
    if (updatedFields.length > 0) {
      const event = EventUtils.createUserEvent(
        'user.updated',
        {
          userId: user.id,
          updatedFields,
          oldValues: {},
          newValues: updateData,
        },
        {
          correlationId: userId,
          metadata: {
            service: 'user-service',
            action: 'update',
          },
        }
      );
      
      await this.eventPublisher.publish(event);
    }

    return user;
  }
}
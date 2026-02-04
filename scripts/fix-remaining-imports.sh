#!/bin/bash

# Скрипт для исправления оставшихся проблем с импортами

set -e

echo "🔧 Исправляем оставшиеся импорты..."

# 1. Исправляем импорты в user.mapper.ts
USER_MAPPER_FILE="04_user-service/src/application/mappers/user.mapper.ts"
if [ -f "$USER_MAPPER_FILE" ]; then
  echo "📝 Исправляем $USER_MAPPER_FILE"
  
  # Создаем временный файл
  cat > "${USER_MAPPER_FILE}.tmp" << 'EOF'
// services/user-service/src/application/mappers/user.mapper.ts
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Phone } from '../../domain/value-objects/phone.vo';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';

export class UserMapper {
  static toDomain(createUserDto: CreateUserDto): {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatarUrl?: string;
  } {
    return {
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      phone: createUserDto.phone,
      avatarUrl: createUserDto.avatarUrl,
    };
  }

  static toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.emailString,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phoneString,
      avatarUrl: user.avatarUrl,
      status: user.status,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  static toUpdateDomain(updateUserDto: UpdateUserDto): {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
  } {
    return {
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
      phone: updateUserDto.phone,
      avatarUrl: updateUserDto.avatarUrl,
    };
  }

  static toEmailObject(email: string): Email {
    return Email.create(email);
  }

  static toPhoneObject(phone?: string): Phone | undefined {
    return phone ? Phone.create(phone) : undefined;
  }

  static toUserEntity(data: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatarUrl?: string;
    status?: string;
    isVerified?: boolean;
  }): User {
    return User.create({
      id: data.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
      isActive: data.status !== 'INACTIVE',
      isVerified: data.isVerified || false,
    });
  }
}
EOF
  
  mv "${USER_MAPPER_FILE}.tmp" "$USER_MAPPER_FILE"
  echo "✅ $USER_MAPPER_FILE обновлен"
fi

# 2. Исправляем импорты в create-user.use-case.ts
CREATE_USE_CASE_FILE="04_user-service/src/application/use-cases/create-user.use-case.ts"
if [ -f "$CREATE_USE_CASE_FILE" ]; then
  echo "📝 Исправляем $CREATE_USE_CASE_FILE"
  
  # Удаляем строку с импортом @platform/shared-types
  sed -i.bak '/import.*@platform\/shared-types/d' "$CREATE_USE_CASE_FILE"
  
  # Добавляем правильный импорт
  sed -i.bak '1i\
import { EventPublisher } from "../../domain/ports/event-publisher.port";' "$CREATE_USE_CASE_FILE"
  
  rm -f "${CREATE_USE_CASE_FILE}.bak"
  echo "✅ $CREATE_USE_CASE_FILE обновлен"
fi

# 3. Исправляем импорты в event-publisher.port.ts (старый файл)
OLD_EVENT_PUBLISHER_FILE="04_user-service/src/domain/ports/ports/services/event-publisher.port.ts"
if [ -f "$OLD_EVENT_PUBLISHER_FILE" ]; then
  echo "📝 Удаляем старый файл $OLD_EVENT_PUBLISHER_FILE"
  rm -f "$OLD_EVENT_PUBLISHER_FILE"
  echo "✅ Старый файл удален"
fi

# 4. Создаем базовый index.ts для entity.base
ENTITY_BASE_INDEX="04_user-service/src/domain/base/index.ts"
if [ ! -f "$ENTITY_BASE_INDEX" ]; then
  echo "📝 Создаем $ENTITY_BASE_INDEX"
  
  cat > "$ENTITY_BASE_INDEX" << 'EOF'
// Экспорт базовых классов DDD
export { Entity, ValueObject } from './entity.base';
export { AggregateRoot } from './aggregate-root.base';
export { DomainEvent, UserDomainEvent, EventUtils } from './domain-event.base';
EOF
  
  echo "✅ $ENTITY_BASE_INDEX создан"
fi

echo "\n🎉 Исправление импортов завершено!"
echo "\n📋 Проверьте компиляцию:"
echo "cd 04_user-service && npm run build"
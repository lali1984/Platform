import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { getManager } from 'typeorm';
import { User } from '../../domain/entities/user-profile';
import { CreateUserDto } from '../dto/create-user';
import { UserMapper } from '../mappers/user';
import { IUserRepository } from '../../domain/ports/user.repository.port';
import { OutboxEventPublisher } from '../../infrastructure/messaging/outbox-publisher';
import { createUserCreatedEvent, UserCreatedEvent } from '@platform/contracts';
import { PlatformEvent } from '../../domain/ports/event-publisher.port';

@Injectable()
export class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);

  constructor(
    @Inject('UserRepository') private readonly userRepository: IUserRepository,
    private readonly outboxEventPublisher: OutboxEventPublisher,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    this.validateCreateUserDto(dto);

    const transactionResult = await getManager().transaction(async (transactionalEntityManager) => {
      try {
        const context = this.determineCreationContext(dto);
        this.logger.log(`Creating user with context: ${context}`);

        let user: User;
        
        if (context === 'auth-event') {
          user = User.createFromAuthEvent({
            authUserId: dto.authUserId!,
            email: dto.email,
            firstName: dto.firstName || '',
            lastName: dto.lastName || '',
            phone: dto.phone,
            avatarUrl: dto.avatarUrl,
            isVerified: dto.isVerified || false,
            metadata: {
              ...dto.metadata,
              creationContext: 'auth-event',
              processedAt: new Date().toISOString(),
            },
          });
        } else {
          user = User.create({
            email: dto.email,
            firstName: dto.firstName || '',
            lastName: dto.lastName || '',
            phone: dto.phone,
            avatarUrl: dto.avatarUrl,
            authUserId: dto.authUserId,
            isActive: dto.status !== 'INACTIVE',
            isVerified: dto.isVerified || false,
          });
        }

        this.validateCreatedUser(user, dto);

        const existingUser = await this.checkExistingUser(user, dto);
        if (existingUser) {
          this.logger.warn(`User already exists: ${user.id}. Returning existing user.`);
          return existingUser;
        }

        const userEntity = UserMapper.toEntity(user);
        const savedEntity = await transactionalEntityManager.save(userEntity);

        await this.publishUserCreatedEvent(user, dto, transactionalEntityManager);

        this.logger.log(
          `✅ Created user profile: ${user.id} (auth ID: ${dto.authUserId || 'N/A'})`,
        );
        
        return user;
        
      } catch (error) {
        await this.handleCreationError(error, dto);
        throw error;
      }
    });

    if (!transactionResult) {
      throw new InternalServerErrorException('Transaction failed to return a user');
    }

    return transactionResult;
  }

  private validateCreateUserDto(dto: CreateUserDto): void {
    const errors: string[] = [];
    
    if (!dto.email) {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dto.email)) {
        errors.push(`Invalid email format: ${dto.email}`);
      }
    }

    if (dto.authUserId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(dto.authUserId)) {
        errors.push(`Invalid authUserId format (must be UUID): ${dto.authUserId}`);
      }
    }

    if (dto.metadata && typeof dto.metadata !== 'object') {
      errors.push('metadata must be an object if provided');
    }

    if (errors.length > 0) {
      throw new BadRequestException(`Invalid CreateUserDto: ${errors.join(', ')}`);
    }
  }

  private determineCreationContext(dto: CreateUserDto): 'auth-event' | 'manual' | 'migration' {
    if (dto.authUserId) {
      const source = dto.metadata?.source;
      if (
        source === 'auth-service' ||
        source === 'auth-service-registration' ||
        dto.metadata?.originalEventId
      ) {
        return 'auth-event';
      }
    }

    if (dto.metadata?.migrationId || dto.metadata?.isMigration) {
      return 'migration';
    }

    return 'manual';
  }

  private validateCreatedUser(user: User, dto: CreateUserDto): void {
    if (!user.id) {
      throw new InternalServerErrorException('Created user has no ID');
    }

    if (dto.authUserId && this.determineCreationContext(dto) === 'auth-event') {
      if (user.id !== dto.authUserId) {
        this.logger.error(`🚨 CRITICAL: User ID mismatch!`, {
          expectedId: dto.authUserId,
          actualId: user.id,
          email: dto.email,
          context: 'auth-event',
        });
        throw new InternalServerErrorException(
          `User ID mismatch: expected ${dto.authUserId}, got ${user.id}`
        );
      }
      this.logger.debug(`✅ User ID validation passed: ${user.id} matches authUserId`);
    }

    if (!user.validateAuthIdConsistency()) {
      this.logger.warn(`⚠️ Auth ID inconsistency detected for user: ${user.id}`);
    }
  }

  private async checkExistingUser(user: User, dto: CreateUserDto): Promise<User | null> {
    try {
      const existingById = await this.userRepository.findById(user.id);
      if (existingById) {
        this.logger.log(`Found existing user by ID: ${user.id}`);
        return existingById;
      }

      if (this.determineCreationContext(dto) !== 'auth-event') {
        const existingByEmail = await this.userRepository.findByEmail(user.email);
        if (existingByEmail) {
          this.logger.log(`Found existing user by email: ${user.email}`);
          return existingByEmail;
        }
      }

      if (dto.authUserId) {
        const existingByAuthId = await this.userRepository.findByEmail(dto.email);
        if (existingByAuthId && existingByAuthId.getAuthUserId() === dto.authUserId) {
          this.logger.log(`Found existing user by authUserId: ${dto.authUserId}`);
          return existingByAuthId;
        }
      }

      return null;
    } catch (error) {
      this.logger.warn(`Error checking for existing user: ${error}`);
      return null;
    }
  }

  private async publishUserCreatedEvent(
    user: User,
    dto: CreateUserDto,
    transactionalEntityManager: any
  ): Promise<void> {
    try {
      // ✅ ИСПРАВЛЕНО: Создаём событие в формате @platform/contracts
      const baseEvent: UserCreatedEvent = createUserCreatedEvent(
        user.id,
        user.email,
        user.firstName,
        user.lastName,
        {
          phone: user.phone ?? undefined,
          avatarUrl: user.avatarUrl ?? undefined,
          status: user.status,
          isVerified: user.isVerified,
          metadata: {
            source: this.determineCreationContext(dto),
            authUserId: dto.authUserId || undefined,
            correlationId: dto.metadata?.correlationId,
            ...dto.metadata,
          },
        },
      );

      // ✅ ИСПРАВЛЕНО: Конвертируем BaseEvent в PlatformEvent для outbox
      const platformEvent: PlatformEvent = {
        eventId: baseEvent.eventId,
        type: baseEvent.eventType,          // ← type вместо eventType
        version: baseEvent.eventVersion,    // ← version вместо eventVersion
        timestamp: new Date(baseEvent.timestamp),
        data: baseEvent.payload,            // ← data вместо payload
        correlationId: baseEvent.metadata?.correlationId,
        source: baseEvent.metadata?.sourceService || 'user-service',
        metadata: baseEvent.metadata,
        toJSON() {
          return JSON.stringify({
            eventId: this.eventId,
            type: this.type,
            version: this.version,
            timestamp: this.timestamp.toISOString(),
            data: this.data,
            correlationId: this.correlationId,
            source: this.source,
            metadata: this.metadata,
          });
        },
        getPartitionKey() {
          return baseEvent.aggregateId || this.eventId;
        },
      };

      // ✅ ИСПРАВЛЕНО: Публикуем в outbox (в той же транзакции)
      await this.outboxEventPublisher.publishInTransaction(
        platformEvent,
        transactionalEntityManager,
      );

      this.logger.debug(`Published UserCreated event: ${platformEvent.eventId}`);

    } catch (error) {
      this.logger.error(`Failed to publish UserCreated event: ${error}`);
      // Не выбрасываем ошибку - создание пользователя успешно
    }
  }

  private async handleCreationError(error: any, dto: CreateUserDto): Promise<void> {
    this.logger.error(
      `❌ Failed to create user: ${error instanceof Error ? error.message : 'Unknown'}`,
      error instanceof Error ? error.stack : undefined,
    );

    if (error instanceof Error && 'code' in error) {
      const errorCode = error.code as string;

      if (errorCode === '23505') {
        let errorDetail = '';
        if ('detail' in error && typeof error.detail === 'string') {
          errorDetail = error.detail;
        }

        if (errorDetail.includes('user_id')) {
          throw new ConflictException(`User profile already exists for auth user: ${dto.authUserId}`);
        } else if (errorDetail.includes('email')) {
          throw new ConflictException(`User with email ${dto.email} already exists`);
        } else {
          throw new ConflictException('User already exists');
        }
      }

      if (errorCode === '23514') {
        throw new BadRequestException(`Invalid data: ${error.message}`);
      }
    }

    throw new InternalServerErrorException('Failed to create user');
  }

  async createFromAuthEvent(dto: CreateUserDto & { authUserId: string }): Promise<User> {
    const authEventDto: CreateUserDto = {
      ...dto,
      metadata: {
        ...dto.metadata,
        source: 'auth-service-registration',
        isAuthEvent: true,
      },
    };
    return this.execute(authEventDto);
  }
}
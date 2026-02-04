
import { UserRegisteredEvent } from '@platform/contracts';

export class UserRegisteredEventDto {
  constructor(
    public readonly eventId: string,
    public readonly type: string,
    public readonly version: string,
    public readonly timestamp: Date,
    public readonly data: {
      userId: string;
      email: string;
      name: string;
      registeredAt: string;
    },
    public readonly source: string,
    public readonly correlationId?: string,
    public readonly metadata?: Record<string, any>
  ) {}

  // Метод для создания из контракта
  static fromContract(event: UserRegisteredEvent): UserRegisteredEventDto {
    return new UserRegisteredEventDto(
      event.eventId,
      event.eventType,
      event.eventVersion,
      new Date(event.timestamp),
      event.payload,
      event.metadata?.sourceService || 'auth-service',
      event.metadata?.correlationId,
      event.metadata
    );
  }
}
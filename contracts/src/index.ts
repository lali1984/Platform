// contracts/src/index.ts
// Главный файл экспорта всего пакета @platform/contracts

// ★★★ ЭКСПОРТ ТИПОВ ОТДЕЛЬНО ★★★
export type {
  // API типы
  ApiResponse,
  ApiError,
} from './api/index';

export type {
  // Event типы
  BaseEvent,
  EventMetadata,
  UserRegisteredEvent,
  UserRegisteredPayload,
  UserCreatedEvent,
  UserCreatedPayload,
} from './events';


export { BaseMetricsService } from './metrics/BaseMetricsService';
export { METRICS_CONSTANTS } from './metrics/constants';
export type * from './metrics/types';

export type {
  // Базовые типы
  PaginationParams,
  PaginatedResponse,
  SortingParams,
  FilterParams,
  ErrorCode,
  Email,
  ISO8601Date,
  Money,
  NonEmptyString,
  PhoneNumber,
  UserId,
} from './types/index';

// Типы метрик
export type {
  ErrorType,
  BusinessTransactionStatus,
  CircuitBreakerOptions,
  CircuitBreakerState,
  CircuitBreakerStateType,
  ICircuitBreaker,
  EventRelayMetricLabels,
} from './metrics/types';

// Типы из констант
export type { SeverityLevel, StatusType } from './metrics/constants';

// Типы перечислений (импортируем после объявления значений)
export type { UserRole as UserRoleType } from './types/enums';
export type { NotificationChannel as NotificationChannelType } from './types/enums';
export type { PrivacyLevel as PrivacyLevelType } from './types/enums';
export type { UserStatus as UserStatusType } from './types/enums';
export type { ServiceName as ServiceNameType } from './types/enums';

// ★★★ ЭКСПОРТ ЗНАЧЕНИЙ ★★★
export * from './infrastructure/kafka';
export * from './metrics';
export * from './auth/user-auth-data';
export * from './auth/token-validation-result';
export * from './auth/auth-response';

// API экспорт
export {
  createSuccessResponse,
  createErrorResponse,
  createApiError,
  isSuccessResponse,
  isErrorResponse,
  ApiUtils,
} from './api/index';

// Events экспорт
export {
  PlatformEvent,
  createEvent,
  validateEvent,
  isEventType,
  createUserRegisteredEvent,
  createUserCreatedEvent,
  isUserCreatedEvent,
  getEventType,
  getEventVersion,
  getEventTopic,
  getEventHeaders,
  validateEventOrThrow,
  createPlatformEvent,
} from './events';

// Примитивы
export {
  createEmail,
  isValidEmail,
  isEmail,
  toISO8601Date,
  parseISO8601Date,
  isValidISO8601Date,
  isISO8601Date,
  unsafeCreateUserId,
  isUserId,
  createMoney,
  isValidMoney,
  isMoney,
  createNonEmptyString,
  isNonEmptyString,
  isNonEmptyStringValue,
  createPhoneNumber,
  isValidPhoneNumber,
  isPhoneNumber,
} from './types/primitives';

// Enums из errors
export {
  ErrorCodes,
  ErrorMessages,
} from './types/errors';

// Enums из enums
export {
  UserRole,
  NotificationChannel,
  PrivacyLevel,
  UserStatus,
  ServiceName,
} from './types/enums';

// Contracts класс
export class Contracts {
  static readonly VERSION = '1.0.0';

  static isValidApiResponse(obj: any): boolean {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      typeof obj.success === 'boolean' &&
      (obj.success ? 'data' in obj : 'error' in obj)
    );
  }

  static isValidEvent(obj: any): boolean {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      typeof obj.eventId === 'string' &&
      typeof obj.eventType === 'string' &&
      typeof obj.eventVersion === 'string' &&
      typeof obj.timestamp === 'string'
    );
  }

  static createServiceHeaders(options: {
    correlationId?: string;
    userId?: string;
    serviceName: string;
  }): Record<string, string> {
    const headers: Record<string, string> = {
      'x-service-name': options.serviceName,
      'x-request-id': options.correlationId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      'x-timestamp': new Date().toISOString(),
    };

    if (options.userId) {
      headers['x-user-id'] = options.userId;
    }

    if (options.correlationId) {
      headers['x-correlation-id'] = options.correlationId;
    }

    return headers;
  }

  static parseServiceHeaders(headers: Record<string, string>): {
    correlationId?: string;
    userId?: string;
    serviceName?: string;
  } {
    return {
      correlationId: headers['x-correlation-id'] || headers['x-request-id'],
      userId: headers['x-user-id'],
      serviceName: headers['x-service-name'],
    };
  }
}

// Экспорт по умолчанию
export default {
  Contracts,
};
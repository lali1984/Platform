// ./04_user-service/src/application/validators/event.validator.ts
import { Injectable, Logger } from '@nestjs/common';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface EventValidationOptions {
  requireEventId?: boolean;
  requireTimestamp?: boolean;
  requireSource?: boolean;
  requireCorrelationId?: boolean;
  validateUUIDs?: boolean;
  validateDates?: boolean;
}

@Injectable()
export class EventValidator {
  private readonly logger = new Logger(EventValidator.name);
  private readonly uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

  /**
   * Валидация UserRegistered события
   */
  validateUserRegisteredEvent(
    event: any, 
    options: EventValidationOptions = {}
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const defaultOptions: EventValidationOptions = {
      requireEventId: true,
      requireTimestamp: true,
      requireSource: true,
      requireCorrelationId: false,
      validateUUIDs: true,
      validateDates: true,
      ...options,
    };

    // 1. Базовая структура события
    if (!event || typeof event !== 'object') {
      errors.push('Event must be an object');
      return { isValid: false, errors, warnings };
    }

    // 2. Обязательные поля события
    if (defaultOptions.requireEventId && !event.eventId) {
      errors.push('Missing eventId');
    }

    if (defaultOptions.requireTimestamp && !event.timestamp) {
      errors.push('Missing timestamp');
    } else if (defaultOptions.validateDates && event.timestamp) {
      if (!this.isValidISODate(event.timestamp)) {
        errors.push(`Invalid timestamp format: ${event.timestamp}. Must be ISO 8601`);
      }
    }

    if (defaultOptions.requireSource && !event.source) {
      warnings.push('Missing source (will use default)');
    }

    if (defaultOptions.requireCorrelationId && !event.correlationId) {
      warnings.push('Missing correlationId (not required but recommended)');
    }

    // 3. Проверка data объекта
    if (!event.data || typeof event.data !== 'object') {
      errors.push('Missing or invalid data object');
      return { isValid: false, errors, warnings };
    }

    const data = event.data;

    // 4. Обязательные поля в data
    if (!data.userId) {
      errors.push('Missing userId in data');
    } else if (defaultOptions.validateUUIDs && !this.isValidUUID(data.userId)) {
      errors.push(`Invalid userId format (must be UUID): ${data.userId}`);
    }

    if (!data.email) {
      errors.push('Missing email in data');
    } else if (!this.isValidEmail(data.email)) {
      errors.push(`Invalid email format: ${data.email}`);
    }

    if (!data.registeredAt) {
      errors.push('Missing registeredAt in data');
    } else if (defaultOptions.validateDates && !this.isValidISODate(data.registeredAt)) {
      errors.push(`Invalid registeredAt format: ${data.registeredAt}. Must be ISO 8601`);
    }

    // 5. Проверка name (может быть optional)
    if (data.name) {
      if (typeof data.name !== 'string') {
        errors.push('name must be a string');
      } else if (data.name.trim().length === 0) {
        warnings.push('name is empty string');
      }
    } else {
      warnings.push('Missing name (will use email as fallback)');
    }

    // 6. Проверка metadata если есть
    if (event.metadata && typeof event.metadata !== 'object') {
      errors.push('metadata must be an object if provided');
    }

    // 7. Дополнительные проверки для production
    if (event.eventId && event.eventId.length > 100) {
      warnings.push('eventId is unusually long (>100 chars)');
    }

    if (data.email && data.email.length > 255) {
      warnings.push('email is unusually long (>255 chars)');
    }

    // 8. Проверка версии события если есть
    if (event.version) {
      const versionRegex = /^\d+\.\d+\.\d+$/;
      if (!versionRegex.test(event.version)) {
        warnings.push(`Event version format should be semantic (e.g., 1.0.0): ${event.version}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Валидация UserCreated события (исходящего из user-service)
   */
  validateUserCreatedEvent(event: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!event || typeof event !== 'object') {
      errors.push('Event must be an object');
      return { isValid: false, errors, warnings };
    }

    // Обязательные поля
    if (!event.eventId) errors.push('Missing eventId');
    if (!event.type) errors.push('Missing type');
    if (!event.version) errors.push('Missing version');
    if (!event.timestamp) errors.push('Missing timestamp');
    if (!event.data) errors.push('Missing data');

    // Проверка data
    if (event.data && typeof event.data === 'object') {
      if (!event.data.userId) errors.push('Missing userId in data');
      if (!event.data.email) errors.push('Missing email in data');
      if (event.data.userId && !this.isValidUUID(event.data.userId)) {
        errors.push(`Invalid userId format: ${event.data.userId}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Утилитарные методы валидации
   */
  isValidUUID(value: string): boolean {
    return this.uuidRegex.test(value);
  }

  isValidEmail(value: string): boolean {
    return this.emailRegex.test(value);
  }

  isValidISODate(value: string): boolean {
    if (!this.isoDateRegex.test(value)) return false;
    
    try {
      const date = new Date(value);
      return !isNaN(date.getTime()) && date.toISOString() === value;
    } catch {
      return false;
    }
  }

  /**
   * Нормализация события (очистка и приведение к стандартному формату)
   */
  normalizeUserRegisteredEvent(event: any): any {
    if (!event || typeof event !== 'object') {
      return null;
    }

    const normalized = { ...event };

    // Нормализация timestamp
    if (normalized.timestamp && typeof normalized.timestamp === 'string') {
      try {
        // Приводим к ISO формату если возможно
        const date = new Date(normalized.timestamp);
        if (!isNaN(date.getTime())) {
          normalized.timestamp = date.toISOString();
        }
      } catch {
        // Оставляем как есть
      }
    }

    // Нормализация registeredAt
    if (normalized.data?.registeredAt && typeof normalized.data.registeredAt === 'string') {
      try {
        const date = new Date(normalized.data.registeredAt);
        if (!isNaN(date.getTime())) {
          normalized.data.registeredAt = date.toISOString();
        }
      } catch {
        // Оставляем как есть
      }
    }

    // Нормализация name (trim)
    if (normalized.data?.name && typeof normalized.data.name === 'string') {
      normalized.data.name = normalized.data.name.trim();
    }

    // Нормализация email (lowercase)
    if (normalized.data?.email && typeof normalized.data.email === 'string') {
      normalized.data.email = normalized.data.email.toLowerCase().trim();
    }

    // Добавляем default source если нет
    if (!normalized.source) {
      normalized.source = 'auth-service';
    }

    // Добавляем default version если нет
    if (!normalized.version) {
      normalized.version = '1.0.0';
    }

    return normalized;
  }

  /**
   * Создание отчета о валидации для логов
   */
  createValidationReport(
    event: any, 
    validationResult: ValidationResult,
    context: { eventType: string; source?: string }
  ): Record<string, any> {
    return {
      timestamp: new Date().toISOString(),
      eventType: context.eventType,
      eventId: event?.eventId || 'unknown',
      source: event?.source || context.source || 'unknown',
      validation: {
        isValid: validationResult.isValid,
        errorCount: validationResult.errors.length,
        warningCount: validationResult.warnings?.length || 0,
        errors: validationResult.errors,
        warnings: validationResult.warnings,
      },
      eventSummary: {
        userId: event?.data?.userId,
        email: event?.data?.email ? `${event.data.email.substring(0, 3)}...@...` : 'unknown',
        hasMetadata: !!event?.metadata,
      },
    };
  }
}
// Главный файл экспорта общих типов

/**
 * Базовые типы платформы
 */

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface SortingParams {
  field: string;
  order: 'asc' | 'desc';
}

export interface FilterParams {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'in' | 'notIn';
  value: any;
}

/**
 * Утилиты для работы с типами
 */
export class TypeUtils {
  /**
   * Создает параметры пагинации
   */
  static createPagination(
    page: number = 1,
    pageSize: number = 20,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc'
  ): PaginationParams {
    return {
      page: Math.max(1, page),
      pageSize: Math.max(1, Math.min(100, pageSize)),
      sortBy,
      sortOrder,
    };
  }

  /**
   * Создает пагинированный ответ
   */
  static createPaginatedResponse<T>(
    data: T[],
    total: number,
    pagination: PaginationParams
  ): PaginatedResponse<T> {
    const page = pagination.page || 1;
    const pageSize = pagination.pageSize || 20;
    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Type guard для проверки типа
   */
  static isType<T>(value: any, check: (val: any) => boolean): value is T {
    return check(value);
  }

  /**
   * Проверяет, является ли значение объектом
   */
  static isObject(value: any): value is Record<string, any> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * Проверяет, является ли значение массивом
   */
  static isArray(value: any): value is any[] {
    return Array.isArray(value);
  }

  /**
   * Проверяет, является ли значение строкой
   */
  static isString(value: any): value is string {
    return typeof value === 'string';
  }

  /**
   * Проверяет, является ли значение числом
   */
  static isNumber(value: any): value is number {
    return typeof value === 'number' && !isNaN(value);
  }

  /**
   * Проверяет, является ли значение булевым
   */
  static isBoolean(value: any): value is boolean {
    return typeof value === 'boolean';
  }

  /**
   * Проверяет, является ли значение датой
   */
  static isDate(value: any): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  }

  /**
   * Преобразует значение в строку
   */
  static toString(value: any): string {
    if (this.isString(value)) return value;
    if (this.isNumber(value) || this.isBoolean(value)) return String(value);
    if (this.isDate(value)) return value.toISOString();
    if (this.isObject(value) || this.isArray(value)) return JSON.stringify(value);
    return '';
  }

  /**
   * Преобразует значение в число
   */
  static toNumber(value: any): number | null {
    if (this.isNumber(value)) return value;
    if (this.isString(value)) {
      const num = Number(value);
      return !isNaN(num) ? num : null;
    }
    return null;
  }

  /**
   * Преобразует значение в булево
   */
  static toBoolean(value: any): boolean {
    if (this.isBoolean(value)) return value;
    if (this.isString(value)) {
      const lower = value.toLowerCase();
      return lower === 'true' || lower === '1' || lower === 'yes' || lower === 'on';
    }
    if (this.isNumber(value)) return value !== 0;
    return Boolean(value);
  }

  /**
   * Преобразует значение в дату
   */
  static toDate(value: any): Date | null {
    if (this.isDate(value)) return value;
    if (this.isString(value)) {
      const date = new Date(value);
      return !isNaN(date.getTime()) ? date : null;
    }
    if (this.isNumber(value)) {
      const date = new Date(value);
      return !isNaN(date.getTime()) ? date : null;
    }
    return null;
  }

  /**
   * Клонирует объект
   */
  static clone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (this.isArray(obj)) return obj.map(item => this.clone(item)) as T;
    if (this.isObject(obj)) {
      const cloned: Record<string, any> = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          cloned[key] = this.clone(obj[key]);
        }
      }
      return cloned as T;
    }
    return obj;
  }

  /**
   * Сравнивает два значения
   */
  static equals(a: any, b: any): boolean {
    if (a === b) return true;
    if (this.isDate(a) && this.isDate(b)) return a.getTime() === b.getTime();
    if (this.isArray(a) && this.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => this.equals(item, b[index]));
    }
    if (this.isObject(a) && this.isObject(b)) {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      return keysA.every(key => this.equals(a[key], b[key]));
    }
    return false;
  }

  
}

// types/src/index.ts

// Основные типы
export * from './primitives';
export * from './errors';
export * from './enums';

// Алиасы для удобства
export type { ErrorCode } from './errors';
export { ErrorCodes, ErrorMessages } from './errors';
export type { UserRole, NotificationChannel, PrivacyLevel, UserStatus, ServiceName } from './enums';
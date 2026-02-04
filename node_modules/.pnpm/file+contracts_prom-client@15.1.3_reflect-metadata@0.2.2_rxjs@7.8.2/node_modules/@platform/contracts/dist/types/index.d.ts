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
export declare class TypeUtils {
    /**
     * Создает параметры пагинации
     */
    static createPagination(page?: number, pageSize?: number, sortBy?: string, sortOrder?: 'asc' | 'desc'): PaginationParams;
    /**
     * Создает пагинированный ответ
     */
    static createPaginatedResponse<T>(data: T[], total: number, pagination: PaginationParams): PaginatedResponse<T>;
    /**
     * Type guard для проверки типа
     */
    static isType<T>(value: any, check: (val: any) => boolean): value is T;
    /**
     * Проверяет, является ли значение объектом
     */
    static isObject(value: any): value is Record<string, any>;
    /**
     * Проверяет, является ли значение массивом
     */
    static isArray(value: any): value is any[];
    /**
     * Проверяет, является ли значение строкой
     */
    static isString(value: any): value is string;
    /**
     * Проверяет, является ли значение числом
     */
    static isNumber(value: any): value is number;
    /**
     * Проверяет, является ли значение булевым
     */
    static isBoolean(value: any): value is boolean;
    /**
     * Проверяет, является ли значение датой
     */
    static isDate(value: any): value is Date;
    /**
     * Преобразует значение в строку
     */
    static toString(value: any): string;
    /**
     * Преобразует значение в число
     */
    static toNumber(value: any): number | null;
    /**
     * Преобразует значение в булево
     */
    static toBoolean(value: any): boolean;
    /**
     * Преобразует значение в дату
     */
    static toDate(value: any): Date | null;
    /**
     * Клонирует объект
     */
    static clone<T>(obj: T): T;
    /**
     * Сравнивает два значения
     */
    static equals(a: any, b: any): boolean;
}
export * from './primitives';
export * from './errors';
export * from './enums';
export type { ErrorCode } from './errors';
export { ErrorCodes, ErrorMessages } from './errors';
export type { UserRole, NotificationChannel, PrivacyLevel, UserStatus, ServiceName } from './enums';
//# sourceMappingURL=index.d.ts.map
/**
 * Базовый интерфейс для всех API ответов платформы
 */
export interface ApiResponse<T = any> {
  /** Успешно ли выполнен запрос */
  success: boolean;
  
  /** Данные ответа (при успехе) */
  data?: T;
  
  /** Ошибка (при неудаче) */
  error?: ApiError;
  
  /** Время выполнения запроса в мс */
  executionTime?: number;
  
  /** Время ответа в ISO формате */
  timestamp: string;
  
  /** Метаданные ответа */
  metadata?: {
    /** Количество элементов (для пагинации) */
    total?: number;
    
    /** Номер страницы (для пагинации) */
    page?: number;
    
    /** Размер страницы (для пагинации) */
    pageSize?: number;
    
    /** Дополнительные метаданные */
    [key: string]: any;
  };
}

/**
 * Интерфейс ошибки API
 */
export interface ApiError {
  /** Код ошибки */
  code: string;
  
  /** Сообщение ошибки */
  message: string;
  
  /** Детали ошибки */
  details?: any;
  
  /** Стек вызовов (только в development) */
  stack?: string;
}

/**
 * Утилита для создания успешного ответа
 */
export function createSuccessResponse<T>(
  data: T,
  options: {
    executionTime?: number;
    metadata?: ApiResponse['metadata'];
  } = {}
): ApiResponse<T> {
  return {
    success: true,
    data,
    executionTime: options.executionTime,
    timestamp: new Date().toISOString(),
    metadata: options.metadata,
  };
}

/**
 * Утилита для создания ответа с ошибкой
 */
export function createErrorResponse(
  error: ApiError,
  options: {
    executionTime?: number;
    metadata?: ApiResponse['metadata'];
  } = {}
): ApiResponse {
  return {
    success: false,
    error,
    executionTime: options.executionTime,
    timestamp: new Date().toISOString(),
    metadata: options.metadata,
  };
}

/**
 * Type guard для проверки успешного ответа
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { success: true; data: T } {
  return response.success === true && response.data !== undefined;
}

/**
 * Type guard для проверки ответа с ошибкой
 */
export function isErrorResponse(
  response: ApiResponse
): response is ApiResponse & { success: false; error: ApiError } {
  return response.success === false && response.error !== undefined;
}

/**
 * Создает объект ошибки API
 */
export function createApiError(
  code: string,
  message: string,
  details?: any
): ApiError {
  return {
    code,
    message,
    details,
    ...(process.env.NODE_ENV === 'development' && {
      stack: new Error().stack,
    }),
  };
}

/**
 * Стандартные коды ошибок платформы
 */
export const ErrorCodes = {
  // Общие ошибки
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  
  // Ошибки аутентификации
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  
  // Ошибки пользователей
  USER_EXISTS: 'USER_EXISTS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  
  // Ошибки валидации
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  
  // Ошибки бизнес-логики
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Стандартные сообщения об ошибках
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  VALIDATION_ERROR: 'Validation failed',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  INTERNAL_ERROR: 'Internal server error',
  
  INVALID_CREDENTIALS: 'Invalid credentials',
  TOKEN_EXPIRED: 'Token expired',
  TOKEN_INVALID: 'Invalid token',
  
  USER_EXISTS: 'User already exists',
  USER_NOT_FOUND: 'User not found',
  
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PASSWORD: 'Invalid password format',
  
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  RESOURCE_LOCKED: 'Resource is locked',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
};
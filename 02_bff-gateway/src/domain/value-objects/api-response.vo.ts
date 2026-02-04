export class ApiResponse<T> {
  constructor(
    public readonly success: boolean,
    public readonly data?: T,
    public readonly message?: string, // Изменил с error на message для универсальности
    public readonly error?: string,
    public readonly timestamp: Date = new Date()
  ) {}

  static success<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse<T>(true, data, message, undefined);
  }

  static error<T>(error: string, data?: T): ApiResponse<T> {
    return new ApiResponse<T>(false, data, undefined, error);
  }

  toJSON() {
    return {
      success: this.success,
      data: this.data,
      message: this.message,
      error: this.error,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

export class PaginatedResponse<T> {
  constructor(
    public readonly items: T[],
    public readonly total: number,
    public readonly page: number,
    public readonly limit: number,
    public readonly hasMore: boolean
  ) {}

  static create<T>(items: T[], total: number, page: number, limit: number): PaginatedResponse<T> {
    return new PaginatedResponse(
      items,
      total,
      page,
      limit,
      page * limit < total
    );
  }
}

export type CacheKey = string;
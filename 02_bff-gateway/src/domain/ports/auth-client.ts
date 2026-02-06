// В auth-client.port.ts УБРАТЬ импорт/экспорт типов из contracts
// И оставить только интерфейсы

import { ApiResponse } from '../value-objects/api-response.vo';

// ТОЛЬКО интерфейсы BFF, без типов из contracts
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface IAuthClient {
  validateToken(token: string): Promise<any>; // Будет указан в реализации
  login(credentials: LoginCredentials): Promise<ApiResponse<any>>;
  logout(token: string): Promise<ApiResponse<void>>;
  refreshToken(refreshToken: string): Promise<ApiResponse<any>>;
  register(credentials: RegisterCredentials): Promise<ApiResponse<any>>;
}
export interface TokenPayload {
  userId: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  isTwoFactorEnabled: boolean;
  isTwoFactorAuthenticated: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenService {
  /**
   * Генерирует access token
   */
  generateAccessToken(payload: TokenPayload): string;
  
  /**
   * Генерирует refresh token
   */
  generateRefreshToken(payload: TokenPayload): string;
  
  /**
   * Верифицирует access token
   */
  verifyAccessToken(token: string): TokenPayload | null;
  
  /**
   * Верифицирует refresh token
   */
  verifyRefreshToken(token: string): TokenPayload | null;
  
  /**
   * Сохраняет refresh token
   */
  saveRefreshToken(userId: string, refreshToken: string): Promise<void>;
  
  /**
   * Проверяет валидность refresh token
   */
  validateRefreshToken(userId: string, refreshToken: string): Promise<boolean>;
  
  /**
   * Удаляет refresh token
   */
  deleteRefreshToken(userId: string, refreshToken: string): Promise<void>;
  
  /**
   * Удаляет все refresh tokens пользователя
   */
  deleteAllRefreshTokens(userId: string): Promise<void>;
}

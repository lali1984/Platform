// /Users/valery/Projects/platform-ecosystem/contracts/src/auth/auth-response.ts
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userId: string;
}
// /Users/valery/Projects/platform-ecosystem/contracts/src/auth/token-validation-result.ts
import { UserAuthData } from './user-auth-data';

export interface TokenValidationResult {
  isValid: boolean;
  user?: UserAuthData;
  error?: string;
  timestamp?: string;
}
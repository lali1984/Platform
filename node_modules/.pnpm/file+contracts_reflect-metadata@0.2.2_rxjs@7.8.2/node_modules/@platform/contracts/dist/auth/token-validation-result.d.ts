import { UserAuthData } from './user-auth-data';
export interface TokenValidationResult {
    isValid: boolean;
    user?: UserAuthData;
    error?: string;
    timestamp?: string;
}
//# sourceMappingURL=token-validation-result.d.ts.map
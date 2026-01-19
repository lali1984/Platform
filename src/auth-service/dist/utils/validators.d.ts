export declare class Validators {
    static isValidEmail(email: string): boolean;
    static isValidPassword(password: string): {
        isValid: boolean;
        errors: string[];
    };
    static sanitizeEmail(email: string): string;
    static sanitizeInput(input: string): string;
}
//# sourceMappingURL=validators.d.ts.map
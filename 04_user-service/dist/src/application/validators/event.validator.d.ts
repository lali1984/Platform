export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
}
export interface EventValidationOptions {
    requireEventId?: boolean;
    requireTimestamp?: boolean;
    requireSource?: boolean;
    requireCorrelationId?: boolean;
    validateUUIDs?: boolean;
    validateDates?: boolean;
}
export declare class EventValidator {
    private readonly logger;
    private readonly uuidRegex;
    private readonly emailRegex;
    private readonly isoDateRegex;
    validateUserRegisteredEvent(event: any, options?: EventValidationOptions): ValidationResult;
    validateUserCreatedEvent(event: any): ValidationResult;
    isValidUUID(value: string): boolean;
    isValidEmail(value: string): boolean;
    isValidISODate(value: string): boolean;
    normalizeUserRegisteredEvent(event: any): any;
    createValidationReport(event: any, validationResult: ValidationResult, context: {
        eventType: string;
        source?: string;
    }): Record<string, any>;
}

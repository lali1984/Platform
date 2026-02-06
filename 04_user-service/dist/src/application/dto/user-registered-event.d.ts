import { UserRegisteredEvent } from '@platform/contracts';
export declare class UserRegisteredEventDto {
    readonly eventId: string;
    readonly type: string;
    readonly version: string;
    readonly timestamp: Date;
    readonly data: {
        userId: string;
        email: string;
        name: string;
        registeredAt: string;
    };
    readonly source: string;
    readonly correlationId?: string | undefined;
    readonly metadata?: Record<string, any> | undefined;
    constructor(eventId: string, type: string, version: string, timestamp: Date, data: {
        userId: string;
        email: string;
        name: string;
        registeredAt: string;
    }, source: string, correlationId?: string | undefined, metadata?: Record<string, any> | undefined);
    static fromContract(event: UserRegisteredEvent): UserRegisteredEventDto;
}

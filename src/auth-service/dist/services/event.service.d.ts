export declare class EventService {
    private static instance;
    private isInitialized;
    private source;
    private constructor();
    static getInstance(): EventService;
    initialize(): Promise<void>;
    publishUserRegistered(userData: {
        userId: string;
        email: string;
        metadata?: {
            userAgent?: string;
            ipAddress?: string;
        };
    }): Promise<void>;
    publishUserLoggedIn(userData: {
        userId: string;
        email: string;
        metadata?: {
            userAgent?: string;
            ipAddress?: string;
        };
    }): Promise<void>;
    shutdown(): Promise<void>;
    getStatus(): Promise<{
        initialized: boolean;
        redisConnected: boolean;
    }>;
}
declare const _default: EventService;
export default _default;
//# sourceMappingURL=event.service.d.ts.map
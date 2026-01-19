export declare const redisEventPublisher: {
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    publish: (event: any) => Promise<void>;
    getStatus: () => Promise<{
        connected: boolean;
    }>;
};
export declare enum EventType {
    USER_REGISTERED = "USER_REGISTERED",
    USER_LOGGED_IN = "USER_LOGGED_IN",
    USER_UPDATED = "USER_UPDATED",
    USER_DELETED = "USER_DELETED"
}
export declare const createBaseEvent: (type: EventType, source: string, correlationId: string) => {
    type: EventType;
    source: string;
    correlationId: string;
    timestamp: string;
    version: string;
};
export declare const generateCorrelationId: () => string;
//# sourceMappingURL=shared-stub.d.ts.map
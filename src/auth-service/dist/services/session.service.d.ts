interface Session {
    id: string;
    userId: string;
    userAgent: string;
    ipAddress: string;
    createdAt: Date;
    lastActiveAt: Date;
    isCurrent: boolean;
}
export declare class SessionService {
    private redisClient;
    constructor();
    createSession(userId: string, userAgent: string, ipAddress: string): Promise<string>;
    getSessions(userId: string): Promise<Session[]>;
    revokeSession(userId: string, sessionId: string): Promise<void>;
    revokeAllSessions(userId: string, excludeSessionId?: string): Promise<void>;
}
export {};
//# sourceMappingURL=session.service.d.ts.map
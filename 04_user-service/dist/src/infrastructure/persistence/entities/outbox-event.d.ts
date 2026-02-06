export declare class OutboxEventEntity {
    id: string;
    type: string;
    payload: Record<string, any>;
    metadata?: Record<string, any>;
    status: 'pending' | 'processing' | 'published' | 'failed' | 'completed';
    attempts: number;
    error?: string;
    errorMessage?: string;
    processedAt?: Date;
    lastAttemptAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

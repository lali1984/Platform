import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class MetricsService implements OnModuleInit, OnModuleDestroy {
    private readonly registry;
    private httpRequestsTotal;
    private httpRequestDuration;
    private authRequestsTotal;
    private jwtTokensIssuedTotal;
    constructor();
    onModuleInit(): void;
    onModuleDestroy(): Promise<void>;
    private initializeMetrics;
    getMetrics(): Promise<string>;
    recordAuthRequest(type: string, status: string): void;
    recordJwtTokenIssued(type: string): void;
    recordHttpRequest(method: string, route: string, status: number, duration: number): void;
}

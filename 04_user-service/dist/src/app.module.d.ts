import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaBootstrapService } from './infrastructure/kafka/kafka-bootstrap';
export declare class AppModule implements OnModuleInit, OnModuleDestroy {
    private readonly kafkaBootstrapService;
    private readonly configService;
    constructor(kafkaBootstrapService: KafkaBootstrapService, configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}

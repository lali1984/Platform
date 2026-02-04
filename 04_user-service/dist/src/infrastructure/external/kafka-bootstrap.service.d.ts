import { OnModuleInit } from '@nestjs/common';
import { KafkaConsumerService } from './kafka-consumer.service';
import { HandleUserRegisteredEventUseCase } from '../../application/use-cases/handle-user-registered-event.use-case';
export declare class KafkaBootstrapService implements OnModuleInit {
    private readonly kafkaConsumer;
    private readonly handleUserRegisteredEvent;
    private readonly logger;
    constructor(kafkaConsumer: KafkaConsumerService, handleUserRegisteredEvent: HandleUserRegisteredEventUseCase);
    onModuleInit(): Promise<void>;
}

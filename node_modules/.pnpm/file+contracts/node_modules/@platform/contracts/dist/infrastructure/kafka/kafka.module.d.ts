import { DynamicModule } from '@nestjs/common';
import { KafkaConfig } from './kafka.config';
export declare class KafkaModule {
    static forRoot(config: KafkaConfig): DynamicModule;
    static forRootAsync(options: {
        imports?: any[];
        useFactory: (...args: any[]) => Promise<KafkaConfig> | KafkaConfig;
        inject?: any[];
    }): DynamicModule;
    static forConsumer(config: KafkaConfig): DynamicModule;
    static forConsumerAsync(options: {
        imports?: any[];
        useFactory: (...args: any[]) => Promise<KafkaConfig> | KafkaConfig;
        inject?: any[];
    }): DynamicModule;
}
//# sourceMappingURL=kafka.module.d.ts.map
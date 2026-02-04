// contracts/src/infrastructure/kafka/index.ts
export * from './kafka.config';
export * from './CircuitBreaker';

// Явный экспорт из KafkaProducer.service без дублирования
export {
  KafkaProducerService,
  createKafkaProducer,
} from './KafkaProducer.service';

export * from './KafkaConsumer.service';
export { KafkaModule } from './kafka.module';
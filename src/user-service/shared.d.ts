// src/user-service/src/shared.d.ts
declare module '@platform/shared-kafka' {
  export const kafkaClient: any;
  export const kafkaProducer: any;
  export const kafkaConsumer: any;
  // добавьте другие экспорты по необходимости
}

declare module '@platform/shared-events' {
  export const redisEventPublisher: any;
  export const EventType: any;
  export const createBaseEvent: any;
  export const generateCorrelationId: any;
}
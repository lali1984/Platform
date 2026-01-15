export const redisEventPublisher = {
  connect: async () => console.log('Redis Event Publisher stub'),
  disconnect: async () => console.log('Disconnect stub'),
  publish: async (event: any) => console.log('Publish stub', event),
  getStatus: async () => ({ connected: true })
};

export enum EventType {
  USER_REGISTERED = 'USER_REGISTERED',
  USER_LOGGED_IN = 'USER_LOGGED_IN',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED'
};

export const createBaseEvent = (type: EventType, source: string, correlationId: string) => ({
  type, source, correlationId, timestamp: new Date().toISOString(), version: '1.0.0'
});

export const generateCorrelationId = () => 
  `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

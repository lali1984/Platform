import { BaseEvent, EventType } from '../types/events';

export function createBaseEvent(
  type: EventType,
  source: string,
  correlationId?: string
): BaseEvent {
  return {
    type,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    source,
    correlationId,
  };
}

export function validateEvent(event: any): boolean {
  if (!event || typeof event !== 'object') return false;
  if (!event.type || !event.timestamp || !event.version || !event.source) return false;
  if (!Object.values(EventType).includes(event.type)) return false;
  
  // Проверяем timestamp
  const date = new Date(event.timestamp);
  if (isNaN(date.getTime())) return false;
  
  // Проверяем version формат (semver)
  const versionRegex = /^\d+\.\d+\.\d+$/;
  if (!versionRegex.test(event.version)) return false;
  
  return true;
}

export function generateCorrelationId(): string {
  return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

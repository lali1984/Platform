import { BaseEvent } from '@platform/contracts';
import { EventPublisher } from '../../domain/ports/EventPublisher.port';

export class InMemoryEventPublisher implements EventPublisher {
  private events: BaseEvent<any>[] = [];

  publish(event: BaseEvent<any>): Promise<boolean> {
    this.events.push(event);
    return Promise.resolve(true);
  }

  publishSync(event: BaseEvent<any>): Promise<void> {
    this.events.push(event);
    return Promise.resolve();
  }

  isAvailable(): boolean {
    return true;
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }

  getPublishedEvents(): BaseEvent<any>[] {
    return [...this.events];
  }
}
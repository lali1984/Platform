import { BaseEvent } from '@platform/contracts';

export interface EventPublisher {
  /**
   * Публикует событие асинхронно
   * Возвращает true если событие успешно поставлено в очередь
   */
  publish(event: BaseEvent<any>): Promise<boolean>;
  
  /**
   * Публикует событие синхронно (только для критических событий)
   * Бросает исключение при ошибке
   */
  publishSync(event: BaseEvent<any>): Promise<void>;
  
  /**
   * Проверяет доступность публикатора
   */
  isAvailable(): boolean;
  
  /**
   * Закрывает соединения
   */
  shutdown(): Promise<void>;
}
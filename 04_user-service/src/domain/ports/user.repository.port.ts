// user-service/src/domain/ports/repositories/user.repository.port.ts
import { User } from '../entities/user-profile';

export interface IUserRepository {
  // Основные методы поиска
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  
  // КРИТИЧЕСКИЙ МЕТОД: поиск по authUserId
  findByAuthUserId(authUserId: string): Promise<User | null>;
  
  // Сохранение и удаление
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
  
  // Поиск с пагинацией
  findAll(limit?: number, offset?: number): Promise<User[]>;
  findWithFilters(filters: UserFilters, limit?: number, offset?: number): Promise<User[]>;
  
  // Проверки существования
  exists(email: string): Promise<boolean>;
  existsByAuthUserId(authUserId: string): Promise<boolean>;
  
  // Метрики и статистика
  count(): Promise<number>;
  countByStatus(status: string): Promise<number>;
  
  // Поиск по нескольким критериям
  search(query: string, limit?: number, offset?: number): Promise<User[]>;
}

// Фильтры для расширенного поиска
export interface UserFilters {
  status?: string;
  isVerified?: boolean;
  country?: string;
  city?: string;
  company?: string;
  createdAtFrom?: Date;
  createdAtTo?: Date;
  lastActiveFrom?: Date;
  lastActiveTo?: Date;
}

// Результат поиска с пагинацией
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Опции для поиска
export interface FindOptions {
  withDeleted?: boolean;
  withRelations?: boolean;
  select?: string[];
}
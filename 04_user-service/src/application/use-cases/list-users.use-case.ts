import { Inject, Injectable } from '@nestjs/common';
import { User, UserStatus } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/ports/repositories/user.repository.port';

export interface ListUsersQuery {
  limit?: number;
  offset?: number;
  status?: string; // Принимаем string, преобразуем в UserStatus
  search?: string;
}

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: ListUsersQuery = {}): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { limit = 20, offset = 0, status, search } = query;
    const page = Math.floor(offset / limit) + 1;
    
    const allUsers = await this.userRepository.findAll();
    
    let filteredUsers = allUsers;
    
    // Фильтрация по статусу - преобразуем string в UserStatus
    if (status) {
      // Проверяем что статус валидный
      if (Object.values(UserStatus).includes(status as UserStatus)) {
        const userStatus = status as UserStatus;
        filteredUsers = filteredUsers.filter(user => user.status === userStatus);
      }
    }
    
    // Поиск по email или имени
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => {
        const emailString = user.email.toLowerCase();
        const firstName = user.firstName.toLowerCase();
        const lastName = user.lastName.toLowerCase();
        
        return emailString.includes(searchLower) ||
               firstName.includes(searchLower) ||
               lastName.includes(searchLower);
      });
    }
    
    // Пагинация
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);
    
    return {
      users: paginatedUsers,
      total: filteredUsers.length,
      page,
      limit,
    };
  }
}
// src/tests/unit/mocks/user.repository.mock.ts
export const mockUserRepository = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  save: jest.fn(),
  emailExists: jest.fn(),
};

jest.mock('../../repositories/user.repository', () => ({
  userRepository: mockUserRepository,
}));
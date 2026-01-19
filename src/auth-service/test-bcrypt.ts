// auth-service/test-bcrypt.ts
import * as bcrypt from 'bcrypt';
import { UserEntity } from './src/entities/User';

async function testBcrypt() {
  console.log('🔍 Тестирование хеширования паролей...');
  
  const plainPassword = 'SecurePass123!';
  
  // Тест 1: Прямое хеширование
  console.log('\n1. Тест bcrypt:');
  const hash = await bcrypt.hash(plainPassword, 10);
  console.log(`   Пароль: ${plainPassword}`);
  console.log(`   Хеш: ${hash.substring(0, 30)}...`);
  
  const isValid = await bcrypt.compare(plainPassword, hash);
  console.log(`   Проверка: ${isValid ? '✅' : '❌'}`);
  
  // Тест 2: Через UserEntity
  console.log('\n2. Тест UserEntity:');
  const user = new UserEntity();
  user.email = 'test@example.com';
  user.passwordHash = plainPassword; // Должен хешироваться автоматически
  
  // Проверим хук BeforeInsert
  console.log(`   До хеширования: ${user.passwordHash.substring(0, 20)}...`);
  
  // Тест 3: Проверка пароля
  const testUser = new UserEntity();
  testUser.passwordHash = await bcrypt.hash('Test123!', 10);
  const passwordValid = await testUser.validatePassword('Test123!');
  console.log(`\n3. Проверка validatePassword: ${passwordValid ? '✅' : '❌'}`);
  
  // Тест 4: Разные пароли
  const wrongPassword = await testUser.validatePassword('WrongPass');
  console.log(`   Неправильный пароль: ${wrongPassword ? '❌' : '✅'} (должно быть false)`);
}

testBcrypt().catch(console.error);
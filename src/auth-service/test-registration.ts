// test-auth-with-init.ts
import { AuthService } from './src/services/auth.service';
import { initializeDatabase } from './src/config/database-typeorm';

async function testAuthWithInit() {
  console.log('🧪 Тест аутентификации с инициализацией БД...');
  
  try {
    // 1. Инициализируем БД
    console.log('🔧 Инициализация TypeORM...');
    await initializeDatabase();
    console.log('✅ TypeORM инициализирован');
    
    // 2. Тестируем сервис
    const authService = new AuthService();
    
    // Тест 1: Регистрация
    console.log('\n1. Регистрация нового пользователя:');
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'SecurePass123!';
    
    const registerResult = await authService.register({
      email: testEmail,
      password: testPassword
    });
    
    if (registerResult.success) {
      console.log('✅ Регистрация успешна');
      console.log(`   ID: ${registerResult.user?.id}`);
      console.log(`   Email: ${registerResult.user?.email}`);
    } else {
      console.log(`❌ Ошибка: ${registerResult.error}`);
    }
    
    // Тест 2: Вход
    console.log('\n2. Вход с правильными данными:');
    const loginResult = await authService.login({
      email: testEmail,
      password: testPassword
    });
    
    if (loginResult.success) {
      console.log('✅ Вход успешен');
    } else {
      console.log(`❌ Ошибка: ${loginResult.error}`);
    }
    
    // Тест 3: Проверка дубликата
    console.log('\n3. Попытка регистрации с тем же email:');
    const duplicateResult = await authService.register({
      email: testEmail,
      password: 'AnotherPass123!'
    });
    
    if (!duplicateResult.success) {
      console.log(`✅ Правильно отвергнут дубликат: ${duplicateResult.error}`);
    } else {
      console.log('❌ Ошибка: принят дублирующий email');
    }
    
  } catch (error) {
    console.error('❌ Фатальная ошибка:', error);
  }
}

// Запуск
testAuthWithInit().catch(console.error);
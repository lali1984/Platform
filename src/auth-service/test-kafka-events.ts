import eventService from './src/services/event.service';

async function testKafkaEvents() {
  console.log('🧪 Тестирование отправки событий в Kafka...');
  
  try {
    // Инициализируем EventService
    await eventService.initialize();
    console.log('✅ EventService инициализирован');
    
    // Тест 1: Регистрация пользователя
    console.log('\n📤 Тест 1: Событие регистрации');
    await eventService.publishUserRegistered({
      userId: 'test-user-123',
      email: 'test@example.com',
      metadata: {
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Test Browser',
        isEmailVerified: false,
        isActive: true,
        isTwoFactorEnabled: false,
      },
    });
    
    // Тест 2: Успешный вход
    console.log('\n📤 Тест 2: Событие успешного входа');
    await eventService.publishUserLoggedIn({
      userId: 'test-user-123',
      email: 'test@example.com',
      metadata: {
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Test Browser',
        loginMethod: 'password',
        isTwoFactorEnabled: false,
      },
    });
    
    // Тест 3: Ошибка входа
    console.log('\n📤 Тест 3: Событие ошибки входа');
    await eventService.publishUserLoginFailed({
      email: 'wrong@example.com',
      reason: 'invalid_password',
      metadata: {
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Test Browser',
        attemptCount: 1,
      },
    });
    
    // Тест 4: Включение 2FA
    console.log('\n📤 Тест 4: Событие включения 2FA');
    await eventService.publishTwoFactorEnabled({
      userId: 'test-user-123',
      email: 'test@example.com',
      method: 'app',
    });
    
    // Тест 5: Запрос сброса пароля
    console.log('\n📤 Тест 5: Событие сброса пароля');
    await eventService.publishPasswordResetRequested({
      userId: 'test-user-123',
      email: 'test@example.com',
      resetToken: 'reset-token-abc123',
    });
    
    console.log('\n🎉 Все тестовые события отправлены!');
    console.log('📊 Проверьте Kafka UI: http://localhost:8081');
    
    // Показываем статус
    const status = await eventService.getStatus();
    console.log('\n📊 Статус EventService:', status);
    
    // Завершаем работу
    await eventService.shutdown();
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error);
  }
}

// Запускаем тест
testKafkaEvents().catch(console.error);
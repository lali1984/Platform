#!/bin/bash

echo "🔍 Проверка зависимостей между сервисами"

echo "
1. Проверка контрактов в auth-service..."
grep -q "contracts-events" 03_auth-service/package.json && echo "✅ auth-service использует contracts-events" || echo "❌ auth-service не использует contracts-events"

echo "
2. Проверка контрактов в user-service..."
grep -q "contracts-events" 04_user-service/package.json && echo "✅ user-service использует contracts-events" || echo "❌ user-service не использует contracts-events"

echo "
3. Проверка контрактов в event-relay..."
grep -q "contracts-events" 06_event-relay/package.json && echo "✅ event-relay использует contracts-events" || echo "❌ event-relay не использует contracts-events"

echo "
4. Проверка типов событий..."
grep -q "UserRegistered" 03_auth-service/src/application/use-cases/RegisterUser.use-case.ts && echo "✅ auth-service публикует UserRegistered" || echo "❌ auth-service не публикует UserRegistered"

grep -q "user-service.user-registered.v1" 04_user-service/src/infrastructure/external/event-consumer.service.ts && echo "✅ user-service подписывается на user-service.user-registered.v1" || echo "❌ user-service не подписывается на правильный топик"

echo "
5. Проверка конфигурации event-relay..."
grep -q "auth-service" 06_event-relay/src/infrastructure/db/DatabaseConfig.ts && echo "✅ event-relay настроен на auth-service" || echo "❌ event-relay не настроен на auth-service"

grep -q "user-service" 06_event-relay/src/infrastructure/db/DatabaseConfig.ts && echo "✅ event-relay настроен на user-service" || echo "❌ event-relay не настроен на user-service"

echo "
🎉 Проверка завершена!"
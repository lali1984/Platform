#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Тестирование регистрации пользователя ===${NC}"

# Генерируем уникальный email
TIMESTAMP=$(date +%s)
TEST_EMAIL="testuser_${TIMESTAMP}@example.com"
TEST_PASSWORD="TestPassword123!"

echo -e "${YELLOW}1. Регистрация пользователя:${NC}"
echo "Email: $TEST_EMAIL"
echo "Password: $TEST_PASSWORD"

# Регистрация
REGISTER_RESPONSE=$(curl -s -X POST "http://localhost/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"name\": \"Test User\"
  }")

echo -e "\n${YELLOW}Ответ от регистрации:${NC}"
echo "$REGISTER_RESPONSE" | jq .

# Проверяем успешность регистрации
if echo "$REGISTER_RESPONSE" | jq -e '.success' >/dev/null 2>&1; then
  echo -e "\n${GREEN}✅ Регистрация успешна!${NC}"
  
  # Получаем ID пользователя
  USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.user.id')
  echo "User ID: $USER_ID"
  
  # Проверяем outbox события
  echo -e "\n${YELLOW}2. Проверка outbox событий:${NC}"
  
  echo -e "${BLUE}В auth_db:${NC}"
  PGPASSWORD=secret psql -h localhost -p 5432 -U admin -d auth_db -c "
  SELECT 
      id,
      type,
      status,
      attempts,
      created_at,
      error
  FROM outbox_events 
  ORDER BY created_at DESC 
  LIMIT 5;
  "
  
  echo -e "\n${BLUE}В user_db:${NC}"
  PGPASSWORD=secret psql -h localhost -p 5433 -U admin -d user_db -c "
  SELECT 
      id,
      type,
      status,
      attempts,
      created_at,
      error
  FROM outbox_events 
  ORDER BY created_at DESC 
  LIMIT 5;
  "
  
  # Проверяем Kafka топики
  echo -e "\n${YELLOW}3. Проверка Kafka топиков:${NC}"
  docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list
  
  # Если есть топики, проверяем сообщения
  TOPICS=$(docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list 2>/dev/null)
  if [ -n "$TOPICS" ]; then
    echo -e "\n${BLUE}Сообщения в топиках:${NC}"
    for topic in $TOPICS; do
      echo "Топик: $topic"
      docker exec kafka kafka-console-consumer \
        --bootstrap-server localhost:9092 \
        --topic "$topic" \
        --from-beginning \
        --max-messages 2 \
        --timeout-ms 5000 2>/dev/null || echo "  Нет сообщений или ошибка чтения"
    done
  fi
  
  # Проверяем Event Relay
  echo -e "\n${YELLOW}4. Проверка Event Relay:${NC}"
  curl -s http://localhost:3006/status | jq .
  
  # Проверяем созданного пользователя
  echo -e "\n${YELLOW}5. Проверка созданного пользователя:${NC}"
  PGPASSWORD=secret psql -h localhost -p 5432 -U admin -d auth_db -c "
  SELECT 
      id,
      email,
      is_active,
      created_at
  FROM users 
  WHERE email = '$TEST_EMAIL';
  "
  
  # Тестируем логин (даже если он не полностью реализован)
  echo -e "\n${YELLOW}6. Тестирование логина:${NC}"
  LOGIN_RESPONSE=$(curl -s -X POST "http://localhost/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$TEST_EMAIL\",
      \"password\": \"$TEST_PASSWORD\"
    }")
  
  echo "Ответ от логина:"
  echo "$LOGIN_RESPONSE" | jq .
  
else
  echo -e "\n${RED}❌ Регистрация не удалась${NC}"
  ERROR=$(echo "$REGISTER_RESPONSE" | jq -r '.error // .message')
  echo "Ошибка: $ERROR"
fi

# Дополнительные проверки
echo -e "\n${YELLOW}7. Дополнительные проверки:${NC}"

echo -e "${BLUE}Проверка логов Auth Service:${NC}"
docker-compose logs auth-service --tail=5 2>/dev/null | grep -i "event\|outbox\|error" || echo "  Нет релевантных логов"

echo -e "\n${BLUE}Проверка логов Event Relay:${NC}"
docker-compose logs event-relay --tail=5 2>/dev/null | grep -i "event\|kafka\|error" || echo "  Нет релевантных логов"

echo -e "\n${BLUE}Проверка Kafka UI:${NC}"
echo "Kafka UI доступен по адресу: http://localhost:8081"

echo -e "\n${BLUE}Проверка Grafana:${NC}"
echo "Grafana доступна по адресу: http://localhost:3000 (admin/admin)"

echo -e "\n${GREEN}=== Тест завершен ===${NC}"
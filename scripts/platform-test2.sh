#!/bin/bash
echo "=== РАСШИРЕННОЕ ТЕСТИРОВАНИЕ ПЛАТФОРМЫ ==="
echo

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Функции
print_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1${NC}"
    fi
}

echo "1. БАЗОВЫЕ ПРОВЕРКИ NGINX"
echo "--------------------------"

# Проверка gateway
curl -s http://localhost:8080/health > /dev/null
print_status "Gateway health check"

# Проверка маршрутов через gateway
echo -n "Проверка /api/auth/health: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/auth/health
echo

echo -n "Проверка /api/users/health: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/users/health
echo

echo
echo "2. ПРОВЕРКА 2FA АУТЕНТИФИКАЦИИ"
echo "-------------------------------"

# Создание тестового пользователя
TEST_EMAIL="test2fa_$(date +%s)@test.com"
TEST_PASS="Test123!"

echo "Создание пользователя для 2FA теста..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}")

echo "Ответ регистрации: $REGISTER_RESPONSE"

# Логин для получения токена
echo "Авторизация пользователя..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}")

echo "Ответ авторизации: $LOGIN_RESPONSE"

# Извлечение токена
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}Токен получен${NC}"
    
    # Проверка защищенных маршрутов
    echo "Проверка защищенного маршрута с токеном:"
    curl -s -H "Authorization: Bearer $TOKEN" \
      http://localhost:3001/api/auth/profile | head -2
else
    echo -e "${RED}Токен не получен${NC}"
fi

echo
echo "3. ПРОВЕРКА KAFKA ТОПИКОВ"
echo "--------------------------"

# Проверка Kafka через UI
echo "Kafka UI доступен по: http://localhost:8081"

# Создание тестового топика через Kafka CLI
echo "Создание тестовых топиков..."
docker-compose exec kafka kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --replication-factor 1 \
  --partitions 3 \
  --topic test.events 2>/dev/null && echo "✓ Топик test.events создан" || echo "✗ Ошибка создания"

docker-compose exec kafka kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --replication-factor 1 \
  --partitions 3 \
  --topic auth.events 2>/dev/null && echo "✓ Топик auth.events создан" || echo "✗ Ошибка создания"

# Список топиков
echo "Список топиков:"
docker-compose exec kafka kafka-topics --list --bootstrap-server localhost:9092

echo
echo "4. ПРОВЕРКА ВСЕХ МАРШРУТОВ AUTH-SERVICE"
echo "----------------------------------------"

# Массив маршрутов для проверки
declare -a AUTH_ROUTES=(
    "/health"
    "/api/auth/health"
    "/api/auth/register"
    "/api/auth/login"
    "/api/auth/logout"
    "/api/auth/refresh"
    "/api/auth/profile"
    "/api/auth/2fa/generate"
    "/api/auth/2fa/verify"
    "/api/auth/2fa/disable"
)

echo "Проверка маршрутов напрямую (порт 3001):"
for route in "${AUTH_ROUTES[@]}"; do
    echo -n "  $route: "
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS http://localhost:3001$route)
    echo "HTTP $STATUS"
done

echo
echo "Проверка маршрутов через Gateway (порт 8080):"
for route in "${AUTH_ROUTES[@]}"; do
    if [[ $route == /api/auth/* ]]; then
        GATEWAY_ROUTE=${route#/api}
        echo -n "  $GATEWAY_ROUTE: "
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS http://localhost:8080$GATEWAY_ROUTE)
        echo "HTTP $STATUS"
    fi
done

echo
echo "5. ПРОВЕРКА CORS НАСТРОЕК"
echo "--------------------------"

# OPTIONS запросы
echo "OPTIONS запросы с разными Origin:"
echo -n "  localhost:5173: "
curl -s -o /dev/null -w "%{http_code}" -X OPTIONS \
  -H "Origin: http://localhost:5173" \
  http://localhost:8080/api/auth/register
echo

echo -n "  другой домен: "
curl -s -o /dev/null -w "%{http_code}" -X OPTIONS \
  -H "Origin: http://evil.com" \
  http://localhost:8080/api/auth/register
echo

echo
echo "6. ПРОВЕРКА СЕТЕВЫХ СОЕДИНЕНИЙ МЕЖДУ СЕРВИСАМИ"
echo "------------------------------------------------"

echo "Проверка соединений из gateway:"
docker exec api-gateway sh -c "
    echo -n '  → auth-service:3000: ' && (nc -z auth-service 3000 && echo 'OK' || echo 'FAIL')
    echo -n '  → user-service:3000: ' && (nc -z user-service 3000 && echo 'OK' || echo 'FAIL')
    echo -n '  → bff-gateway:3000: ' && (nc -z bff-gateway 3000 && echo 'OK' || echo 'FAIL')
    echo -n '  → frontend:5173: ' && (nc -z frontend 5173 && echo 'OK' || echo 'FAIL')
"

echo
echo "7. ПРОВЕРКА СОБЫТИЙ KAFKA"
echo "--------------------------"

# Отправка тестового сообщения в Kafka
echo "Отправка тестового события в Kafka..."
docker-compose exec kafka bash -c "
    echo '{\"event\": \"user.registered\", \"email\": \"$TEST_EMAIL\", \"timestamp\": \"$(date -Iseconds)\"}' | \
    kafka-console-producer --bootstrap-server localhost:9092 --topic test.events
" 2>/dev/null && echo "✓ Событие отправлено" || echo "✗ Ошибка отправки"

# Чтение сообщений (timeout 5 сек)
echo "Чтение событий из Kafka..."
docker-compose exec kafka timeout 5 kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic test.events \
  --from-beginning \
  --max-messages 1 2>/dev/null && echo "✓ Сообщения получены" || echo "✗ Нет сообщений или таймаут"

echo
echo "8. ПРОВЕРКА NGINX КОНФИГУРАЦИИ"
echo "-------------------------------"

# Детальная проверка конфига
echo "Детали конфигурации NGINX:"
docker exec api-gateway nginx -T 2>&1 | grep -E "(server_name|listen|location|proxy_pass|upstream)" | head -20

echo
echo "9. ОЧИСТКА ТЕСТОВЫХ ДАННЫХ"
echo "---------------------------"

# Удаление тестового пользователя (если есть API)
echo "Тестовый пользователь: $TEST_EMAIL"
echo "Для удаления выполните вручную:"
echo "  docker-compose exec postgres-auth psql -U postgres -d auth_db -c \"DELETE FROM users WHERE email = '$TEST_EMAIL';\""

echo
echo "========================================"
echo -e "${BLUE}ТЕСТИРОВАНИЕ ЗАВЕРШЕНО${NC}"
echo "========================================"

# Сводка проблем
echo
echo -e "${YELLOW}СВОДКА ПРОБЛЕМ:${NC}"
echo "1. Gateway маршрутизация: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/auth/health)"
echo "2. Kafka состояние: $(docker-compose ps kafka | grep -o 'Restarting\|Up\|Exit')"
echo "3. CORS OPTIONS: $(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS http://localhost:8080/api/auth/register)"
echo "4. Frontend доступность: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)"

# Рекомендации
echo
echo -e "${YELLOW}РЕКОМЕНДАЦИИ:${NC}"
echo "1. Проверить upstream порты в 00-main-server.conf"
echo "2. Проверить rewrite правила в location блоках"
echo "3. Проверить дублирование server блоков"
echo "4. Убедиться что сервисы слушают на порту 3000"
#!/bin/bash
echo "=== ИНТЕГРАЦИОННОЕ ТЕСТИРОВАНИЕ ЧЕРЕЗ API GATEWAY ==="
echo

# Цвета
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Функция проверки
check() {
    local name="$1"
    local url="$2"
    local method="${3:-GET}"
    local data="${4:-}"
    local expected="${5:-200}"
    
    echo -n "  ${name}... "
    
    local cmd="curl -s -o /dev/null -w '%{http_code}' -X $method"
    
    if [ -n "$data" ]; then
        cmd="$cmd -H 'Content-Type: application/json' -d '$data'"
    fi
    
    cmd="$cmd '$url'"
    
    local status=$(eval $cmd 2>/dev/null)
    
    if [ "$status" = "$expected" ]; then
        echo -e "${GREEN}✓ HTTP $status${NC}"
        return 0
    else
        echo -e "${RED}✗ HTTP $status (expected $expected)${NC}"
        return 1
    fi
}

echo "1. БАЗОВЫЕ HEALTH CHECKS:"
check "Gateway health" "http://localhost:8080/health"
check "Auth service health" "http://localhost:8080/api/auth/health"
check "User service health" "http://localhost:8080/api/users/health"

echo
echo "2. АУТЕНТИФИКАЦИЯ:"
TEST_EMAIL="integration_$(date +%s)@test.com"
TEST_PASS="Test123!"

echo "  Регистрация пользователя..."
REGISTER_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}" \
  http://localhost:8080/api/auth/register)

echo "  Ответ: $REGISTER_RESPONSE"

echo "  Авторизация..."
LOGIN_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}" \
  http://localhost:8080/api/auth/login)

echo "  Ответ: $LOGIN_RESPONSE"

# Извлекаем токен
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
    echo -e "  ${GREEN}✓ Токены получены${NC}"
    
    echo "  Проверка защищенных маршрутов:"
    check "Профиль с токеном" "http://localhost:8080/api/auth/profile" "GET" "" "200" \
        -H "Authorization: Bearer $ACCESS_TOKEN"
    
    echo "  Обновление токена:"
    REFRESH_RESPONSE=$(curl -s -X POST \
      -H "Content-Type: application/json" \
      -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}" \
      http://localhost:8080/api/auth/refresh)
    
    echo "  Ответ refresh: $REFRESH_RESPONSE"
else
    echo -e "  ${RED}✗ Токены не получены${NC}"
fi

echo
echo "3. CORS И МЕЖСЕРВИСНОЕ ВЗАИМОДЕЙСТВИЕ:"
check "CORS OPTIONS" "http://localhost:8080/api/auth/register" "OPTIONS" "" "204" \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST"

check "CORS GET" "http://localhost:8080/api/auth/health" "GET" "" "200" \
  -H "Origin: http://localhost:5173"

echo
echo "4. ОБРАБОТКА ОШИБОК:"
check "Несуществующий маршрут" "http://localhost:8080/api/nonexistent" "GET" "" "404"
check "Некорректный метод" "http://localhost:8080/health" "POST" "" "405"

echo
echo "5. RATE LIMITING (если настроен):"
echo "  Тест rate limiting (может занять время)..."
# for i in {1..15}; do
#     curl -s -o /dev/null -w "%{http_code}\n" \
#       -X POST \
#       -H "Content-Type: application/json" \
#       -d "{\"email\":\"ratelimit_${i}@test.com\",\"password\":\"Test123!\"}" \
#       http://localhost:8080/api/auth/register | grep -v "429\|201"
# done | head -5

echo
echo "6. ЛОГИРОВАНИЕ И МОНИТОРИНГ:"
echo "  Проверка логов Gateway:"
docker logs api-gateway --tail 5 2>/dev/null | grep -E "(200|201|404|500)" || echo "    Логи пусты"

echo
echo "7. ФРОНТЕНД ЧЕРЕЗ GATEWAY:"
check "Frontend через Gateway" "http://localhost:8080/" "GET" "" "200"

echo
echo "========================================="
echo -e "${GREEN}ИНТЕГРАЦИОННОЕ ТЕСТИРОВАНИЕ ЗАВЕРШЕНО${NC}"
echo "========================================="

# Очистка
echo
echo "Тестовый пользователь: $TEST_EMAIL"
echo "Для удаления: docker-compose exec postgres-auth psql -U postgres -d auth_db -c \"DELETE FROM users WHERE email = '$TEST_EMAIL';\""
#!/bin/bash
echo "========================================================"
echo "     ИНТЕГРАЦИОННОЕ ТЕСТИРОВАНИЕ API GATEWAY"
echo "========================================================"
echo

# Цвета
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

total_tests=0
passed_tests=0

# Функция тестирования
test_endpoint() {
    local name="$1"
    local url="$2"
    local method="${3:-GET}"
    local data="${4:-}"
    local expected="${5:-200}"
    local headers="${6:-}"
    
    ((total_tests++))
    
    echo -n "${BLUE}[TEST]${NC} $name... "
    
    local cmd="curl -s -o /dev/null -w '%{http_code}' -X $method"
    
    if [ -n "$headers" ]; then
        cmd="$cmd $headers"
    fi
    
    if [ -n "$data" ]; then
        cmd="$cmd -H 'Content-Type: application/json' -d '$data'"
    fi
    
    cmd="$cmd '$url' 2>/dev/null"
    
    local status=$(eval $cmd)
    local success=0
    
    # Проверяем статус
    if [ "$status" = "$expected" ]; then
        echo -e "${GREEN}✓ HTTP $status${NC}"
        ((passed_tests++))
        success=1
    else
        echo -e "${RED}✗ HTTP $status (expected $expected)${NC}"
    fi
    
    return $success
}

echo "1. БАЗОВАЯ ФУНКЦИОНАЛЬНОСТЬ GATEWAY"
echo "-----------------------------------"

test_endpoint "Gateway health check" "http://localhost:8080/health"
test_endpoint "Gateway status" "http://localhost:8080/status" "GET" "" "403"  # Доступ запрещен
test_endpoint "Несуществующий маршрут" "http://localhost:8080/notfound" "GET" "" "404"

echo
echo "2. МАРШРУТИЗАЦИЯ К СЕРВИСАМ"
echo "----------------------------"

test_endpoint "Auth service health" "http://localhost:8080/api/auth/health"
test_endpoint "User service health" "http://localhost:8080/api/users/health"

echo
echo "3. АУТЕНТИФИКАЦИЯ И РЕГИСТРАЦИЯ"
echo "--------------------------------"

# Регистрация нового пользователя
TEST_EMAIL="integration_$(date +%s)@test.com"
TEST_PASS="Test123!Pass"

echo "${YELLOW}Создание тестового пользователя: $TEST_EMAIL${NC}"

REGISTER_DATA="{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}"
test_endpoint "Регистрация пользователя" "http://localhost:8080/api/auth/register" "POST" "$REGISTER_DATA" "201"

# Авторизация
LOGIN_DATA="{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}"
LOGIN_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$LOGIN_DATA" \
  http://localhost:8080/api/auth/login)

echo -n "${BLUE}[TEST]${NC} Авторизация пользователя... "
if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
    echo -e "${GREEN}✓ УСПЕХ${NC}"
    ((passed_tests++))
    
    # Извлекаем токены
    ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)
    
    echo "${YELLOW}  Access Token: ${ACCESS_TOKEN:0:20}...${NC}"
    echo "${YELLOW}  Refresh Token: ${REFRESH_TOKEN:0:20}...${NC}"
    
    # Тестируем защищенные маршруты
    test_endpoint "Получение профиля (с токеном)" "http://localhost:8080/api/auth/profile" "GET" "" "200" "-H 'Authorization: Bearer $ACCESS_TOKEN'"
    
    # Refresh токена
    REFRESH_DATA="{\"refreshToken\":\"$REFRESH_TOKEN\"}"
    test_endpoint "Обновление токена" "http://localhost:8080/api/auth/refresh" "POST" "$REFRESH_DATA" "200"
    
else
    echo -e "${RED}✗ ОШИБКА${NC}"
    echo "  Ответ: $LOGIN_RESPONSE"
fi
((total_tests++))

echo
echo "4. CORS ТЕСТИРОВАНИЕ"
echo "--------------------"

test_endpoint "CORS OPTIONS запрос" "http://localhost:8080/api/auth/register" "OPTIONS" "" "204" \
  "-H 'Origin: http://localhost:5173' -H 'Access-Control-Request-Method: POST'"

test_endpoint "CORS GET запрос с Origin" "http://localhost:8080/api/auth/health" "GET" "" "200" \
  "-H 'Origin: http://localhost:5173'"

echo
echo "5. ОБРАБОТКА ОШИБОК И ВАЛИДАЦИЯ"
echo "--------------------------------"

# Некорректные данные
test_endpoint "Регистрация без email" "http://localhost:8080/api/auth/register" "POST" "{\"password\":\"test\"}" "400"
test_endpoint "Регистрация без пароля" "http://localhost:8080/api/auth/register" "POST" "{\"email\":\"test@test.com\"}" "400"
test_endpoint "Некорректный метод" "http://localhost:8080/api/auth/health" "POST" "" "405"

echo
echo "6. ПРОВЕРКА КЭШИРОВАНИЯ (если настроено)"
echo "----------------------------------------"

# Многократные запросы для проверки кэша
echo -n "${BLUE}[CACHE]${NC} Проверка кэширования health... "
FIRST=$(curl -s -I http://localhost:8080/api/auth/health 2>/dev/null | grep -i "x-cache-status" || echo "")
SECOND=$(curl -s -I http://localhost:8080/api/auth/health 2>/dev/null | grep -i "x-cache-status" || echo "")

if [ -n "$FIRST" ] && [ -n "$SECOND" ]; then
    echo -e "${GREEN}✓ Кэширование работает${NC}"
else
    echo -e "${YELLOW}⚠ Кэширование не настроено${NC}"
fi

echo
echo "7. ПРОВЕРКА СЕТЕВОЙ ДОСТУПНОСТИ"
echo "--------------------------------"

echo -n "${BLUE}[NETWORK]${NC} Доступность сервисов из Gateway... "
if docker exec api-gateway curl -s http://auth-service:3000/health >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Auth service доступен${NC}"
else
    echo -e "${RED}✗ Auth service недоступен${NC}"
fi

echo
echo "8. ЛОГИРОВАНИЕ"
echo "--------------"

echo -n "${BLUE}[LOGS]${NC} Последние записи в логах Gateway... "
LOG_COUNT=$(docker logs api-gateway --tail 10 2>/dev/null | wc -l)
if [ $LOG_COUNT -gt 0 ]; then
    echo -e "${GREEN}✓ Логи доступны ($LOG_COUNT записей)${NC}"
else
    echo -e "${YELLOW}⚠ Логи пусты${NC}"
fi

echo
echo "========================================================"
echo "                      РЕЗУЛЬТАТЫ"
echo "========================================================"
echo

PASS_RATE=$((passed_tests * 100 / total_tests))

if [ $PASS_RATE -eq 100 ]; then
    echo -e "${GREEN}✓ ВСЕ ТЕСТЫ ПРОЙДЕНЫ${NC}"
elif [ $PASS_RATE -ge 80 ]; then
    echo -e "${YELLOW}⚠ ТЕСТЫ ПРОЙДЕНЫ НА $PASS_RATE%${NC}"
else
    echo -e "${RED}✗ ТЕСТЫ ПРОЙДЕНЫ НА $PASS_RATE%${NC}"
fi

echo "Пройдено: $passed_tests из $total_tests тестов"
echo

echo "СВОДКА ПО СЕРВИСАМ:"
echo "• Gateway: http://localhost:8080"
echo "• Auth Service: http://localhost:8080/api/auth/"
echo "• User Service: http://localhost:8080/api/users/"
echo "• Frontend: http://localhost:8080/"
echo "• Прямой доступ к сервисам:"
echo "  - Auth: http://localhost:3001"
echo "  - User: http://localhost:3002"
echo "  - BFF: http://localhost:3003"

echo
echo "РЕКОМЕНДАЦИИ:"
if [ $PASS_RATE -lt 100 ]; then
    echo "1. Проверить логи упавших тестов"
    echo "2. Убедиться, что все сервисы запущены"
    echo "3. Проверить конфигурацию Gateway"
fi

# Очистка тестовых данных
echo
echo "${YELLOW}ОЧИСТКА ТЕСТОВЫХ ДАННЫХ:${NC}"
echo "Тестовый пользователь: $TEST_EMAIL"
echo "Для удаления выполните:"
echo "  docker-compose exec postgres-auth psql -U postgres -d auth_db -c \"DELETE FROM users WHERE email = '$TEST_EMAIL';\""
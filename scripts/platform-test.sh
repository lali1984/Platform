#!/bin/bash

echo "================================================"
echo "     PLATFORM ECOSYSTEM - COMPLETE TEST SUITE"
echo "================================================"
echo

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для проверки доступности
check_service() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "${BLUE}[TEST]${NC} ${name}... "
    
    # Используем curl с таймаутом
    local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null)
    
    if [ "$response" = "$expected_status" ] || [ -z "$expected_status" ] && [ -n "$response" ]; then
        echo -e "${GREEN}✓ OK (HTTP $response)${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED (HTTP $response)${NC}"
        return 1
    fi
}

# Функция для проверки Docker контейнера
check_container() {
    local name=$1
    echo -n "${BLUE}[DOCKER]${NC} $name... "
    
    if docker ps --filter "name=$name" --format "{{.Status}}" | grep -q "Up"; then
        echo -e "${GREEN}✓ RUNNING${NC}"
        return 0
    else
        echo -e "${RED}✗ STOPPED${NC}"
        return 1
    fi
}

echo "1. ПРОВЕРКА DOCKER КОНТЕЙНЕРОВ"
echo "--------------------------------"

check_container "api-gateway"
check_container "auth-service"
check_container "user-service"
check_container "bff-gateway"
check_container "frontend"
check_container "postgres-auth"
check_container "postgres-user"
check_container "redis"
check_container "zookeeper"
check_container "kafka-ui"

# Kafka может быть в состоянии Restarting
echo -n "${BLUE}[DOCKER]${NC} kafka... "
if docker ps --filter "name=kafka" --format "{{.Status}}" | grep -q "Restarting"; then
    echo -e "${YELLOW}⚠ RESTARTING${NC}"
elif docker ps --filter "name=kafka" --format "{{.Status}}" | grep -q "Up"; then
    echo -e "${GREEN}✓ RUNNING${NC}"
else
    echo -e "${RED}✗ STOPPED${NC}"
fi

echo
echo "2. ПРОВЕРКА API GATEWAY И МАРШРУТИЗАЦИИ"
echo "----------------------------------------"

echo -e "${BLUE}[GATEWAY]${NC} Health check:"
curl -s http://localhost:8080/health | head -5
echo

check_service "Gateway → Health" "http://localhost:8080/health"
check_service "Gateway → / (frontend)" "http://localhost:8080/"

echo
echo "3. ПРОВЕРКА СЕРВИСОВ ЧЕРЕЗ GATEWAY"
echo "-----------------------------------"

check_service "Gateway → /api/auth/health" "http://localhost:8080/api/auth/health"
check_service "Gateway → /api/users/health" "http://localhost:8080/api/users/health"

echo
echo "4. ПРОВЕРКА CORS НАСТРОЕК"
echo "--------------------------"

echo -e "${BLUE}[CORS TEST]${NC} OPTIONS запрос (разрешенный Origin):"
curl -X OPTIONS \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -s -o /dev/null -w "HTTP: %{http_code}\n" \
  http://localhost:8080/api/auth/register

echo -e "${BLUE}[CORS TEST]${NC} GET запрос с CORS (разрешенный Origin):"
curl -H "Origin: http://localhost:5173" \
  -s -o /dev/null -w "HTTP: %{http_code}, Headers: " \
  http://localhost:8080/api/auth/health 2>/dev/null
echo

echo
echo "5. ПРОВЕРКА НАПРЯМУЮ (БЕЗ GATEWAY)"
echo "-----------------------------------"

check_service "Auth Service Direct" "http://localhost:3001/health"
check_service "User Service Direct" "http://localhost:3002/health"
check_service "BFF Gateway Direct" "http://localhost:3003/health"
check_service "Frontend Direct" "http://localhost:5173"

echo
echo "6. ПРОВЕРКА БАЗ ДАННЫХ И КЭША"
echo "------------------------------"

# Проверка PostgreSQL auth
echo -n "${BLUE}[POSTGRES]${NC} Auth DB (5432)... "
if docker exec postgres-auth pg_isready -U postgres &>/dev/null; then
    echo -e "${GREEN}✓ CONNECTED${NC}"
else
    echo -e "${RED}✗ DISCONNECTED${NC}"
fi

# Проверка PostgreSQL user
echo -n "${BLUE}[POSTGRES]${NC} User DB (5433)... "
if docker exec postgres-user pg_isready -U postgres &>/dev/null; then
    echo -e "${GREEN}✓ CONNECTED${NC}"
else
    echo -e "${RED}✗ DISCONNECTED${NC}"
fi

# Проверка Redis
echo -n "${BLUE}[REDIS]${NC} Cache (6379)... "
if docker exec redis redis-cli ping | grep -q "PONG"; then
    echo -e "${GREEN}✓ CONNECTED${NC}"
else
    echo -e "${RED}✗ DISCONNECTED${NC}"
fi

echo
echo "7. ПРОВЕРКА КАФКА И МОНИТОРИНГА"
echo "-------------------------------"

check_service "Kafka UI" "http://localhost:8081"

# Проверка Zookeeper
echo -n "${BLUE}[ZOOKEEPER]${NC} (2181)... "
if echo ruok | nc localhost 2181 | grep -q "imok"; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo
echo "8. ИНТЕГРАЦИОННОЕ ТЕСТИРОВАНИЕ"
echo "------------------------------"

# Тест аутентификации через Gateway
echo -e "${BLUE}[INTEGRATION]${NC} Регистрация пользователя:"
TEST_EMAIL="test_$(date +%s)@test.com"
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"Test123!\"}" \
  -s -o /dev/null -w "HTTP: %{http_code}\n"

# Тест логина
echo -e "${BLUE}[INTEGRATION]${NC} Авторизация пользователя:"
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"Test123!\"}" \
  -s -o /dev/null -w "HTTP: %{http_code}\n"

echo
echo "9. СЕТЕВЫЕ ПРОВЕРКИ ВНУТРИ DOCKER"
echo "---------------------------------"

# Проверка DNS resolution между сервисами
echo -n "${BLUE}[NETWORK]${NC} Gateway → Auth Service DNS... "
if docker exec api-gateway nslookup auth-service &>/dev/null; then
    echo -e "${GREEN}✓ RESOLVED${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo -n "${BLUE}[NETWORK]${NC} Gateway → User Service DNS... "
if docker exec api-gateway nslookup user-service &>/dev/null; then
    echo -e "${GREEN}✓ RESOLVED${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

# Проверка портов
echo -e "${BLUE}[PORTS]${NC} Открытые порты на хосте:"
netstat -tuln 2>/dev/null | grep -E ":8080|:3001|:3002|:3003|:5173|:5432|:5433|:6379|:2181|:8081" | sort

echo
echo "================================================"
echo -e "${GREEN}ТЕСТИРОВАНИЕ ЗАВЕРШЕНО${NC}"
echo "================================================"

# Сводка
echo
echo "СВОДКА:"
echo "-------"
echo "• API Gateway: 8080"
echo "• Auth Service: 3001 (direct), /api/auth/ через gateway"
echo "• User Service: 3002 (direct), /api/users/ через gateway"
echo "• BFF Gateway: 3003 (direct), /api/ через gateway"
echo "• Frontend: 5173 (direct), / через gateway"
echo "• PostgreSQL Auth: 5432"
echo "• PostgreSQL User: 5433"
echo "• Redis: 6379"
echo "• Kafka UI: 8081"
echo "• Frontend Dev: 5173"

echo
echo "Для тестирования CORS используйте:"
echo "  curl -H 'Origin: http://localhost:5173' http://localhost:8080/api/auth/health"
echo
echo "Для проверки логов:"
echo "  docker logs api-gateway --tail 20"
echo "  docker logs auth-service --tail 20"
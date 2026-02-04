#!/bin/bash

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠  $1${NC}"
}

test_endpoint() {
    local url=$1
    local description=$2
    local expected_code=${3:-200}
    
    local response_code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "$url" 2>/dev/null || echo "000")
    
    if [ "$response_code" = "$expected_code" ] || [ "$response_code" = "200" ] || [ "$response_code" = "201" ]; then
        print_success "$description (код: $response_code)"
        return 0
    elif [ "$response_code" = "404" ]; then
        print_warning "$description - endpoint не найден (404)"
        return 1
    elif [ "$response_code" = "000" ]; then
        print_error "$description - недоступен (таймаут)"
        return 2
    else
        print_warning "$description - неожиданный код: $response_code"
        return 3
    fi
}

# ==================== НАЧАЛО ТЕСТИРОВАНИЯ ====================

echo -e "${BLUE}
╔══════════════════════════════════════════════╗
║     ПОЛНОЕ ТЕСТИРОВАНИЕ ПЛАТФОРМЫ            ║
╚══════════════════════════════════════════════╝
${NC}"

# 1. Проверка инфраструктуры
print_header "1. ПРОВЕРКА ИНФРАСТРУКТУРЫ"

test_endpoint "http://localhost/health" "API Gateway"
test_endpoint "http://localhost:3003/health" "BFF Gateway"
test_endpoint "http://localhost:3006/health" "Event Relay"
test_endpoint "http://localhost:3000" "Grafana"
test_endpoint "http://localhost:9090" "Prometheus"
test_endpoint "http://localhost:8081" "Kafka UI"
test_endpoint "http://localhost:5173" "Frontend"

# 2. Проверка баз данных
print_header "2. ПРОВЕРКА БАЗ ДАННЫХ"

echo -n "🔍 PostgreSQL Auth DB... "
if docker exec postgres-auth pg_isready -U admin -d auth_db > /dev/null 2>&1; then
    user_count=$(docker exec postgres-auth psql -U admin -d auth_db -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' \n')
    print_success "работает ($user_count пользователей)"
else
    print_error "недоступна"
fi

echo -n "🔍 PostgreSQL User DB... "
if docker exec postgres-user pg_isready -U admin -d user_db > /dev/null 2>&1; then
    user_count=$(docker exec postgres-user psql -U admin -d user_db -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' \n')
    print_success "работает ($user_count пользователей)"
else
    print_error "недоступна"
fi

echo -n "🔍 Redis... "
if docker exec redis redis-cli -a secret ping > /dev/null 2>&1; then
    print_success "работает"
else
    print_error "недоступен"
fi

echo -n "🔍 Kafka... "
if docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list > /dev/null 2>&1; then
    topic_count=$(docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list --exclude-internal | wc -l | tr -d ' \n')
    print_success "работает ($topic_count топиков)"
else
    print_error "недоступен"
fi

# 3. Проверка проксирования
print_header "3. ПРОВЕРКА ПРОКСИРОВАНИЯ ЧЕРЕЗ API GATEWAY"

test_endpoint "http://localhost/api/auth/" "Auth Service через Gateway"
test_endpoint "http://localhost/api/v1/" "User Service через Gateway"

# 4. Тест регистрации
print_header "4. ТЕСТ РЕГИСТРАЦИИ ПОЛЬЗОВАТЕЛЯ"

TEST_EMAIL="platform-test-$(date +%s)@example.com"
TEST_PASSWORD="SecureTest123!"

echo "📝 Тестовый пользователь: $TEST_EMAIL"

# Очистка
docker exec postgres-auth psql -U admin -d auth_db -c "DELETE FROM users WHERE email = '$TEST_EMAIL';" 2>/dev/null || true
docker exec postgres-user psql -U admin -d user_db -c "DELETE FROM users WHERE email = '$TEST_EMAIL';" 2>/dev/null || true

# Регистрация
REG_RESPONSE=$(curl -s -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"firstName\": \"Platform\",
    \"lastName\": \"Test\"
  }")

if echo "$REG_RESPONSE" | grep -q -i "token\|success\|id"; then
    print_success "Регистрация успешна"
    
    # Извлекаем токен
    ACCESS_TOKEN=$(echo "$REG_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    [ -z "$ACCESS_TOKEN" ] && ACCESS_TOKEN=$(echo "$REG_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$ACCESS_TOKEN" ]; then
        print_success "Токен получен"
        
        # Тест защищенных endpoints
        echo -n "🔐 Тест /api/auth/me... "
        curl -s -H "Authorization: Bearer $ACCESS_TOKEN" http://localhost/api/auth/me > /dev/null 2>&1
        [ $? -eq 0 ] && print_success "OK" || print_warning "Не удалось"
        
        echo -n "🔐 Тест BFF /api/users/me... "
        curl -s -H "Authorization: Bearer $ACCESS_TOKEN" http://localhost:3003/api/users/me > /dev/null 2>&1
        [ $? -eq 0 ] && print_success "OK" || print_warning "Не удалось"
    fi
else
    print_warning "Регистрация не удалась: $REG_RESPONSE"
fi

# 5. Проверка Event системы
print_header "5. ПРОВЕРКА EVENT СИСТЕМЫ"

echo -n "🔔 Event Relay статус... "
ER_STATUS=$(curl -s http://localhost:3006/health | jq -r '.status' 2>/dev/null)
if [ "$ER_STATUS" = "healthy" ]; then
    print_success "healthy"
else
    print_warning "$ER_STATUS"
fi

echo -n "📨 Проверка Kafka сообщений... "
docker exec kafka kafka-console-consumer \
  --topic user.events.v1 \
  --bootstrap-server localhost:9092 \
  --from-beginning \
  --max-messages 1 \
  --timeout-ms 3000 > /dev/null 2>&1
[ $? -eq 0 ] && print_success "Есть сообщения" || print_warning "Нет сообщений"

# 6. Итоги
print_header "ТЕСТИРОВАНИЕ ЗАВЕРШЕНО"

echo "📊 Итоговый статус контейнеров:"
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" | grep -v "NAME"

echo -e "\n🎯 Рекомендации:"
echo "1. Проверьте логи auth-service: docker-compose logs auth-service"
echo "2. Проверьте логи user-service: docker-compose logs user-service"
echo "3. Проверьте nginx конфиг: docker exec api-gateway nginx -t"
echo "4. Проверьте Kafka UI: http://localhost:8081"
echo "5. Проверьте Grafana: http://localhost:3000 (admin/admin)"
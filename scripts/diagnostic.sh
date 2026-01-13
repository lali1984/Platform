#!/bin/bash
echo "=== ГЛУБОКАЯ ДИАГНОСТИКА ПРОБЛЕМЫ ==="
echo

# 1. Проверим логи Gateway
echo "1. ЛОГИ GATEWAY:"
docker logs api-gateway --tail 20 2>&1 | grep -E "(404|403|error|auth-service)"
echo

# 2. Проверим, что приходит в auth-service
echo "2. ТЕСТ ВНУТРИ СЕТИ DOCKER:"
echo "Запрос из gateway к auth-service напрямую:"
docker exec api-gateway curl -s http://auth-service:3000/health | head -2
echo

echo "Запрос из gateway к auth-service /api/auth/health:"
docker exec api-gateway curl -s http://auth-service:3000/api/auth/health | head -2
echo

# 3. Проверим конфигурацию NGINX
echo "3. ПРОВЕРКА КОНФИГА NGINX:"
docker exec api-gateway nginx -t 2>&1
echo

# 4. Проверим, какие location блоки срабатывают
echo "4. ТЕСТ РАЗНЫХ URL:"
echo "  /api/auth/health (с trailing slash):"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/api/auth/health/
echo

echo "  /auth/health (без /api/):"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/auth/health
echo

echo "  /api/auth (без trailing slash):"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/api/auth
echo

# 5. Проверим proxy_pass
echo "5. ПРОВЕРКА PROXY_PASS С РАЗНЫМИ ВАРИАНТАМИ:"
echo "Попробуем разные варианты в конфиге:"
echo "1. proxy_pass http://auth_service;"
echo "2. proxy_pass http://auth_service/;"
echo "3. proxy_pass http://auth_service:3000;"
echo "4. proxy_pass http://auth_service:3000/;"
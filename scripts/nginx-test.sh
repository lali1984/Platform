#!/bin/bash
echo "=== ДЕТАЛЬНАЯ ДИАГНОСТИКА NGINX ==="
echo

# 1. Полная конфигурация location блоков
echo "1. ПОЛНАЯ КОНФИГУРАЦИЯ LOCATION БЛОКОВ:"
docker exec api-gateway nginx -T 2>&1 | grep -A10 "location /api" | head -50
echo

# 2. Проверка rewrite правил
echo "2. ПРОВЕРКА REWRITE ПРАВИЛ:"
docker exec api-gateway grep -n "rewrite" /etc/nginx/conf.d/*.conf
echo

# 3. Проверка proxy_pass
echo "3. ПРОВЕРКА PROXY_PASS:"
docker exec api-gateway grep -n "proxy_pass" /etc/nginx/conf.d/*.conf
echo

# 4. Порядок location блоков
echo "4. ПОРЯДОК LOCATION БЛОКОВ:"
docker exec api-gateway nginx -T 2>&1 | grep "location " | head -20
echo

# 5. Тест с разными URL
echo "5. ТЕСТ ЗАПРОСОВ С РАЗНЫМИ URL:"
echo "  /api/auth/health (GET): "
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/auth/health
echo

echo "  /auth/health (GET): "
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/auth/health
echo

echo "  /api/auth/health (OPTIONS): "
curl -s -o /dev/null -w "%{http_code}" -X OPTIONS http://localhost:8080/api/auth/health
echo

# 6. Проверка логов
echo "6. ПОСЛЕДНИЕ ЛОГИ GATEWAY:"
docker logs api-gateway --tail 5
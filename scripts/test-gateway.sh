#!/bin/bash

echo "=== Тестирование API Gateway ==="
echo

# 1. Проверка доступности Gateway
echo "1. Health check gateway:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:8080/health
echo

# 2. Проверка маршрута к auth-service
echo "2. Проверка маршрута /api/auth:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:8080/api/auth/health
echo

# 3. Проверка что auth-service доступен напрямую (для сравнения)
echo "3. Прямой запрос к auth-service:"
docker exec auth-service curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3001/health
echo

# 4. Проверка несуществующего маршрута
echo "4. Проверка 404 на несуществующий маршрут:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:8080/nonexistent
echo

echo "=== Тестирование завершено ==="
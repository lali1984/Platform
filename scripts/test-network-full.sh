#!/bin/bash
# scripts/test-network-full.sh

echo "=== Полная проверка сети ==="

# Все контейнеры
echo "Список контейнеров:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo -e "\n=== Тестирование связей ==="

services=("auth-service:3000" "user-service:3000" "postgres-auth:5432" "postgres-user:5432" "redis:6379" "kafka:9092")

for service in "${services[@]}"; do
  name=$(echo $service | cut -d: -f1)
  port=$(echo $service | cut -d: -f2)
  
  echo -n "Gateway -> $name ($port): "
  docker exec api-gateway nc -z $name $port 2>/dev/null && echo "OK" || echo "FAILED"
done

echo -e "\n=== Проверка DNS разрешения ==="
docker exec api-gateway nslookup auth-service
docker exec api-gateway nslookup kafka
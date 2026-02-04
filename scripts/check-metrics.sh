#!/bin/bash
set -e

echo "=== Проверка метрик сервисов на localhost ==="

SERVICES=(
  "auth-service:3001"
  "user-service:3002" 
  "bff-gateway:3003"
  "event-relay:3006"
  "frontend:5173"
)

for service in "${SERVICES[@]}"; do
  echo -n "Проверка $service... "
  if curl -s -f -H "Accept: text/plain" http://localhost:${service#*:}/metrics > /dev/null 2>&1; then
    echo "✅ OK"
  else
    echo "❌ FAILED"
    echo "  Попытка получить заголовки:"
    curl -I http://localhost:${service#*:}/metrics 2>/dev/null || echo "  Недоступно"
  fi
done

echo -e "\n=== Проверка exporters в Docker сети ==="
docker exec prometheus sh -c '
  SERVICES="postgres-exporter:9187 redis-exporter:9121 kafka-exporter:9308 node-exporter:9100"
  for svc in $SERVICES; do
    echo -n "Проверка $svc... "
    if wget -q -O- http://$svc/metrics > /dev/null 2>&1; then
      echo "✅ OK"
    else
      echo "❌ FAILED"
    fi
  done
'

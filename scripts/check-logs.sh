#!/bin/bash  
# scripts/check-logs.sh

echo "=== Проверка логов на ошибки ==="

containers=$(docker ps --format "{{.Names}}")

for container in $containers; do
  echo -e "\n🔍 $container:"
  
  # Ищем ошибки в последних 50 строках логов
  errors=$(docker logs $container --tail 50 2>/dev/null | grep -i "error\|fail\|exception\|warning" | head -5)
  
  if [ -n "$errors" ]; then
    echo "Найдены ошибки:"
    echo "$errors" | sed 's/^/  /'
  else
    echo "✅ Ошибок не найдено"
  fi
done
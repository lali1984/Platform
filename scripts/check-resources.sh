#!/bin/bash
# scripts/check-resources.sh

echo "=== Проверка использования ресурсов ==="

echo "Использование памяти:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"

echo -e "\nИспользование диска:"
docker system df

echo -e "\nРазмеры томов:"
docker volume ls -q | while read volume; do
  size=$(docker run --rm -v $volume:/data alpine sh -c "du -sh /data 2>/dev/null | cut -f1")
  echo "  $volume: $size"
done
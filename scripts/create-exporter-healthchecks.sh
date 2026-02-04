#!/bin/bash

# Health check для Prometheus exporters
for exporter in kafka-exporter node-exporter postgres-exporter redis-exporter; do
  echo "Создаю healthcheck для $exporter..."
  
  case $exporter in
    kafka-exporter)
      port=9308
      path="/metrics"
      ;;
    node-exporter)
      port=9100
      path="/metrics"
      ;;
    postgres-exporter)
      port=9187
      path="/metrics"
      ;;
    redis-exporter)
      port=9121
      path="/metrics"
      ;;
  esac
  
  cat > "healthcheck-$exporter.sh" << SCRIPT
#!/bin/sh
if wget -q -O- http://localhost:$port$path > /dev/null 2>&1; then
  exit 0
else
  exit 1
fi
SCRIPT
  
  chmod +x "healthcheck-$exporter.sh"
  echo "Создан healthcheck-$exporter.sh"
done

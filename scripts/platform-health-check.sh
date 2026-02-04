#!/bin/bash
set -e

echo "=== Platform Health Check ==="
echo "Timestamp: $(date)"
echo

# Функция проверки сервиса
check_service() {
  local name=$1
  local port=$2
  local path=${3:-/health}
  local timeout=${4:-5}
  
  echo -n "🔍 $name (localhost:$port$path)... "
  
  if curl -s -f --max-time $timeout http://localhost:$port$path > /dev/null 2>&1; then
    echo "✅ UP"
    return 0
  else
    echo "❌ DOWN"
    return 1
  fi
}

# Функция проверки контейнера Docker
check_container() {
  local name=$1
  echo -n "🐳 $name... "
  
  if docker ps --filter "name=$name" --format "{{.Status}}" | grep -q "(healthy)"; then
    echo "✅ HEALTHY"
  elif docker ps --filter "name=$name" --format "{{.Status}}" | grep -q "Up"; then
    echo "⚠️  RUNNING (no health check)"
  else
    echo "❌ DOWN"
  fi
}

echo "=== Docker Container Status ==="
check_container "postgres-auth"
check_container "postgres-user"
check_container "redis"
check_container "kafka"
check_container "zookeeper"
check_container "auth-service"
check_container "user-service"
check_container "bff-gateway"
check_container "event-relay"
check_container "frontend"
check_container "api-gateway"
check_container "prometheus"
check_container "grafana"
check_container "alertmanager"
check_container "kafka-ui"

echo -e "\n=== HTTP Endpoint Status ==="
check_service "auth-service" 3001 "/health"
check_service "user-service" 3002 "/health"
check_service "bff-gateway" 3003 "/health"
check_service "event-relay" 3006 "/health"
check_service "frontend" 5173 "/health"
check_service "api-gateway" 80 "/health"
check_service "prometheus" 9090 "/-/healthy"
check_service "grafana" 3000 "/api/health"
check_service "alertmanager" 9093 "/-/healthy"
check_service "kafka-ui" 8081 ""

echo -e "\n=== Exporters Status ==="
check_service "node-exporter" 9100 "/metrics"
check_service "redis-exporter" 9121 "/metrics"
check_service "postgres-exporter" 9187 "/metrics"
check_service "kafka-exporter" 9308 "/metrics"

echo -e "\n=== Prometheus Targets ==="
echo "Проверка targets..."
healthy_targets=$(curl -s http://localhost:9090/api/v1/targets | jq -r '.data.activeTargets[] | select(.health=="up") | .discoveredLabels.job' | sort -u)
unhealthy_targets=$(curl -s http://localhost:9090/api/v1/targets | jq -r '.data.activeTargets[] | select(.health=="down") | .discoveredLabels.job' | sort -u)

echo "✅ Healthy targets:"
echo "$healthy_targets" | while read job; do
  if [ -n "$job" ]; then
    echo "  - $job"
  fi
done

echo -e "\n❌ Unhealthy targets:"
echo "$unhealthy_targets" | while read job; do
  if [ -n "$job" ]; then
    echo "  - $job"
  fi
done

echo -e "\n=== Summary ==="
total_containers=$(docker ps -q | wc -l)
healthy_containers=$(docker ps --filter "health=healthy" -q | wc -l)

echo "Total containers: $total_containers"
echo "Healthy containers: $healthy_containers"
echo "Platform status: $(if [ $healthy_containers -eq $total_containers ]; then echo "✅ FULLY OPERATIONAL"; else echo "⚠️  DEGRADED"; fi)"
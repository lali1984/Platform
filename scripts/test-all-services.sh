#!/bin/bash
# scripts/test-all-services.sh

echo "=== Проверка всех сервисов через Gateway ==="

BASE_URL="http://localhost:8080"

# 1. Gateway health
echo -n "1. Gateway health: "
curl -s -f "$BASE_URL/health" | grep -q "Gateway OK" && echo "OK" || echo "FAILED"

# 2. Auth Service
echo -n "2. Auth Service health: "
curl -s -f "$BASE_URL/api/auth/health" | grep -q '"status":"ok"' && echo "OK" || echo "FAILED"

# 3. User Service  
echo -n "3. User Service health: "
curl -s -f "$BASE_URL/api/users/health" | grep -q '"status":"ok"' && echo "OK" || echo "FAILED"

# 4. BFF Gateway
echo -n "4. BFF Gateway health: "
curl -s -f "http://localhost:3003/health" | grep -q '"status":"ok"' && echo "OK" || echo "FAILED"

# 5. Frontend
echo -n "5. Frontend доступен: "
curl -s -f "http://localhost:5173" >/dev/null && echo "OK" || echo "FAILED"

# 6. Kafka UI
echo -n "6. Kafka UI доступен: "
curl -s -f "http://localhost:8081" >/dev/null && echo "OK" || echo "FAILED"
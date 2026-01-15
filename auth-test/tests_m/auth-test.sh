#!/bin/bash
echo "🧪 Testing Auth Service"
echo "======================"

# 1. Проверка health
echo "1. Testing health endpoint..."
curl -f http://localhost:3001/health || exit 1

# 2. Регистрация
echo ""
echo "2. Testing registration..."
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}' \
  -w "\nHTTP Code: %{http_code}\n"

# 3. Логин
echo ""
echo "3. Testing login..."
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}' \
  -w "\nHTTP Code: %{http_code}\n"

# 4. Проверка защищенного маршрута
echo ""
echo "4. Testing protected route..."
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}' | jq -r '.accessToken')

curl -X GET http://localhost:3001/api/auth/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP Code: %{http_code}\n"

echo ""
echo "✅ All tests completed!"
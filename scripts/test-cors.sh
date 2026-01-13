#!/bin/bash
echo "=== ПОЛНЫЙ ТЕСТ CORS ==="
echo

# 1. OPTIONS запрос с разрешенным Origin
echo "1. OPTIONS с localhost:5173:"
curl -X OPTIONS \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v http://localhost:8080/api/auth/register 2>&1 | grep -E "(< HTTP|< Access-Control)"
echo

# 2. GET запрос с Origin
echo "2. GET с Origin (должны быть CORS заголовки):"
curl -H "Origin: http://localhost:5173" \
  -v http://localhost:8080/api/auth/health 2>&1 | grep -E "(< HTTP|< Access-Control)"
echo

# 3. POST запрос с Origin (регистрация)
echo "3. POST запрос (регистрация) с CORS:"
curl -X POST \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -d '{"email":"cors_test@test.com","password":"Test123!"}' \
  -v http://localhost:8080/api/auth/register 2>&1 | grep -E "(< HTTP|< Access-Control)"
echo

# 4. Запрос с запрещенным Origin
echo "4. Запрос с запрещенным Origin (evil.com):"
curl -H "Origin: http://evil.com" \
  -v http://localhost:8080/api/auth/health 2>&1 | grep -E "(< HTTP|< Access-Control)"
echo

# 5. Запрос без Origin (не должно быть CORS заголовков)
echo "5. Запрос без Origin:"
curl -v http://localhost:8080/api/auth/health 2>&1 | grep -E "(< HTTP|< Access-Control)"
echo

# 6. Проверка user-service CORS
echo "6. User service CORS:"
curl -H "Origin: http://localhost:5173" \
  -v http://localhost:8080/api/users/health 2>&1 | grep -E "(< HTTP|< Access-Control)" || echo "User service может не иметь health endpoint"
echo
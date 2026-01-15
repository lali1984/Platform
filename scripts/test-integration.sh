#!/bin/bash
# scripts/test-integration.sh

echo "=== Интеграционные тесты ==="

BASE_URL="http://localhost:8080"

# Тест 1: Полный цикл регистрации
echo -e "\n1. Тест регистрации пользователя:"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "integration@test.com",
    "password": "Pass123!",
    "firstName": "Integration",
    "lastName": "Test"
  }')

echo "Response: $REGISTER_RESPONSE"
echo $REGISTER_RESPONSE | grep -q '"message":"User registered' && echo "✅ Успех" || echo "❌ Ошибка"

# Тест 2: Логин (заглушка)
echo -e "\n2. Тест логина:"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "integration@test.com",
    "password": "Pass123!"
  }')

echo "Response: $LOGIN_RESPONSE"  
echo $LOGIN_RESPONSE | grep -q '"message":"Login successful' && echo "✅ Успех" || echo "❌ Ошибка"

# Тест 3: BFF Gateway
echo -e "\n3. Тест BFF Gateway:"
BFF_RESPONSE=$(curl -s "http://localhost:3003/api/test")
echo "Response: $BFF_RESPONSE"
echo $BFF_RESPONSE | grep -q '"message":"BFF Gateway' && echo "✅ Успех" || echo "❌ Ошибка"
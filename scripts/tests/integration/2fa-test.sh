#!/bin/bash
# 2FA Authentication Test

BASE_URL="http://localhost:8080"
AUTH_DIRECT="http://localhost:3001"

echo "=== 2FA AUTHENTICATION TEST ==="
echo

# Create test user
TEST_EMAIL="2fa_test_$(date +%s)@test.com"
TEST_PASS="2faTest123!"

echo "1. Creating 2FA test user: $TEST_EMAIL"
curl -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}" \
  "$BASE_URL/api/auth/register"

echo
echo "2. First login (should succeed without 2FA if not enabled)"
LOGIN_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}" \
  "$BASE_URL/api/auth/login")

echo "Login response: $LOGIN_RESPONSE"

echo
echo "3. Testing 2FA endpoints (if implemented)"
echo "   Note: These endpoints may return 404 if 2FA not fully implemented"

echo "   a) Generate 2FA secret:"
curl -s -X POST \
  -H "Content-Type: application/json" \
  "$BASE_URL/api/auth/2fa/generate" | head -2

echo
echo "   b) Verify 2FA token (stub):"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"token":"123456"}' \
  "$BASE_URL/api/auth/2fa/verify" | head -2

echo
echo "4. Direct service test (bypassing gateway):"
echo "   Auth service health:"
curl -s "$AUTH_DIRECT/health" | head -1

echo
echo "=== 2FA TEST COMPLETE ==="
echo "If 2FA is implemented, the following flow should work:"
echo "1. User registers"
echo "2. User enables 2FA (generates secret)"
echo "3. User scans QR code in authenticator app"
echo "4. User verifies with token from app"
echo "5. Subsequent logins require 2FA token"

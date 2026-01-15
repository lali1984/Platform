#!/bin/bash
# Security scanning tests

BASE_URL="http://localhost:8080"

echo "=== SECURITY SCAN ==="
echo

echo "1. HEADERS SECURITY CHECK:"
echo "Checking security headers..."
curl -s -I "$BASE_URL/health" | grep -E "(X-Content-Type-Options|X-Frame-Options|X-XSS-Protection|Content-Security-Policy)"

echo
echo "2. CORS MISCONFIGURATION CHECK:"
echo "Testing CORS with invalid origin..."
curl -s -X OPTIONS \
  -H "Origin: http://evil-attacker.com" \
  -H "Access-Control-Request-Method: POST" \
  "$BASE_URL/api/auth/register" | grep -i "access-control"

echo
echo "3. RATE LIMITING TEST (if configured):"
echo "Making rapid requests to login endpoint..."
for i in {1..20}; do
    curl -s -o /dev/null -w "%{http_code}\n" \
      -X POST \
      -H "Content-Type: application/json" \
      -d '{"email":"test@test.com","password":"test"}' \
      "$BASE_URL/api/auth/login"
    sleep 0.1
done | sort | uniq -c

echo
echo "4. ERROR INFORMATION LEAKAGE:"
echo "Testing error responses..."
curl -s "$BASE_URL/nonexistent" | head -1
curl -s -X POST "$BASE_URL/api/auth/register" | head -1

echo
echo "5. SSL/TLS CHECK (if HTTPS configured):"
echo "Note: Running HTTP only. For production, enable HTTPS."

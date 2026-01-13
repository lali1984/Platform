#!/bin/bash
# Integration tests for Gateway API

BASE_URL="http://localhost:8080"
AUTH_SERVICE="http://localhost:3001"
USER_SERVICE="http://localhost:3002"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

passed=0
failed=0

test_case() {
    local name="$1"
    local command="$2"
    local expected="${3:-0}"
    
    echo -n "  $name... "
    
    eval "$command" >/dev/null 2>&1
    local result=$?
    
    if [ $result -eq $expected ]; then
        echo -e "${GREEN}✓${NC}"
        ((passed++))
        return 0
    else
        echo -e "${RED}✗ (code: $result)${NC}"
        ((failed++))
        return 1
    fi
}

echo "=== GATEWAY API INTEGRATION TESTS ==="
echo

echo "1. SERVICE HEALTH CHECKS:"
test_case "Gateway health" "curl -s -f $BASE_URL/health"
test_case "Auth service via gateway" "curl -s -f $BASE_URL/api/auth/health"
test_case "User service via gateway" "curl -s -f $BASE_URL/api/users/health"

echo
echo "2. AUTHENTICATION FLOW:"
# Create test user
TEST_EMAIL="test_$(date +%s)@integration.com"
TEST_PASS="Test123!Integration"

echo "  Creating test user: $TEST_EMAIL"
REGISTER_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}" \
  $BASE_URL/api/auth/register)

echo "  Register response: $REGISTER_RESPONSE"

# Login
LOGIN_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}" \
  $BASE_URL/api/auth/login)

echo "  Login response: $LOGIN_RESPONSE"

if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
    echo -e "  ${GREEN}✓ Authentication flow successful${NC}"
    ((passed++))
else
    echo -e "  ${RED}✗ Authentication flow failed${NC}"
    ((failed++))
fi

echo
echo "3. CORS VALIDATION:"
test_case "CORS OPTIONS request" "curl -s -f -X OPTIONS -H 'Origin: http://localhost:5173' $BASE_URL/api/auth/register"
test_case "CORS GET with Origin" "curl -s -f -H 'Origin: http://localhost:5173' $BASE_URL/api/auth/health"

echo
echo "4. ERROR HANDLING:"
test_case "Non-existent route (404)" "curl -s -f $BASE_URL/api/nonexistent" "22"
test_case "Invalid JSON payload" "curl -s -f -X POST -H 'Content-Type: application/json' -d '{invalid}' $BASE_URL/api/auth/register" "22"

echo
echo "5. DIRECT SERVICE ACCESS (for comparison):"
test_case "Auth service direct" "curl -s -f $AUTH_SERVICE/health"
test_case "User service direct" "curl -s -f $USER_SERVICE/health"

echo
echo "=== TEST RESULTS ==="
echo "Passed: $passed"
echo "Failed: $failed"
echo "Total: $((passed + failed))"

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ SOME TESTS FAILED${NC}"
    exit 1
fi

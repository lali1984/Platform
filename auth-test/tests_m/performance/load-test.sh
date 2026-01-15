#!/bin/bash
# Basic load test for Gateway

BASE_URL="http://localhost:8080"
CONCURRENT=10
REQUESTS=100

echo "=== GATEWAY LOAD TEST ==="
echo "Concurrent: $CONCURRENT"
echo "Total requests: $REQUESTS"
echo

echo "1. Testing health endpoint..."
ab -n $REQUESTS -c $CONCURRENT "$BASE_URL/health" 2>/dev/null | grep -E "(Time taken|Requests per second|Transfer rate)"

echo
echo "2. Testing auth health endpoint..."
ab -n $REQUESTS -c $CONCURRENT "$BASE_URL/api/auth/health" 2>/dev/null | grep -E "(Time taken|Requests per second|Transfer rate)"

echo
echo "3. Testing with siege (if installed)..."
if command -v siege &> /dev/null; then
    echo "siege -c$CONCURRENT -r$((REQUESTS/CONCURRENT)) $BASE_URL/api/auth/health"
else
    echo "Install siege for more advanced load testing:"
    echo "  brew install siege  # macOS"
    echo "  apt-get install siege  # Ubuntu"
fi

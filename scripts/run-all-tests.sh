#!/bin/bash
# Run all test suites

echo "=========================================="
echo "     COMPREHENSIVE PLATFORM TEST SUITE"
echo "=========================================="
echo

LOG_DIR="./test-logs/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$LOG_DIR"

run_test() {
    local test_name="$1"
    local test_script="$2"
    local log_file="$LOG_DIR/${test_name}.log"
    
    echo "Running $test_name..."
    echo "  Output: $log_file"
    
    if [ -f "$test_script" ]; then
        bash "$test_script" 2>&1 | tee "$log_file"
        local exit_code=${PIPESTATUS[0]}
        
        if [ $exit_code -eq 0 ]; then
            echo "  ✓ $test_name PASSED"
            return 0
        else
            echo "  ✗ $test_name FAILED (see $log_file)"
            return 1
        fi
    else
        echo "  ⚠ $test_name script not found: $test_script"
        return 2
    fi
}

echo "Starting test suite at $(date)"
echo

# Run tests
FAILED_TESTS=()

run_test "Integration" "./tests/integration/gateway-api.test.sh" || FAILED_TESTS+=("Integration")
echo

run_test "2FA" "./tests/integration/2fa-test.sh" || FAILED_TESTS+=("2FA")
echo

run_test "Security" "./tests/security/security-scan.sh" || FAILED_TESTS+=("Security")
echo

run_test "Performance" "./tests/performance/load-test.sh" || FAILED_TESTS+=("Performance")
echo

run_test "Kafka-Monitoring" "./kafka-monitor.sh" || FAILED_TESTS+=("Kafka-Monitoring")
echo

# Summary
echo "=========================================="
echo "               TEST SUMMARY"
echo "=========================================="
echo "Total logs: $LOG_DIR"
echo

if [ ${#FAILED_TESTS[@]} -eq 0 ]; then
    echo "✅ ALL TESTS PASSED!"
    echo "Platform is ready for deployment."
    exit 0
else
    echo "⚠ SOME TESTS FAILED:"
    for test in "${FAILED_TESTS[@]}"; do
        echo "  - $test"
    done
    echo
    echo "Check logs in $LOG_DIR for details."
    exit 1
fi

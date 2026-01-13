.PHONY: test test-integration test-performance test-security test-all

test-integration:
	@echo "Running integration tests..."
	@./tests/integration/gateway-api.test.sh

test-performance:
	@echo "Running performance tests..."
	@./tests/performance/load-test.sh

test-security:
	@echo "Running security tests..."
	@./tests/security/security-scan.sh

test-all: test-integration test-performance test-security
	@echo "All tests completed!"

test: test-integration

health-check:
	@echo "Health check all services..."
	@curl -s http://localhost:8080/health
	@curl -s http://localhost:8080/api/auth/health
	@curl -s http://localhost:8080/api/users/health
	@echo "✓ All services healthy"

monitor-kafka:
	@echo "Monitoring Kafka..."
	@./kafka-monitor.sh

start-tests:
	@echo "Starting comprehensive test suite..."
	@make test-all

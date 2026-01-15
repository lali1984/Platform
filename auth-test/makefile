# Makefile
.PHONY: test test-unit test-integration test-e2e coverage lint type-check

# Запуск всех тестов
test:
	npm test

# Unit тесты
test-unit:
	npm run test:unit

# Интеграционные тесты
test-integration:
	npm run test:integration

# E2E тесты
test-e2e:
	npm run test:e2e

# Покрытие кода
coverage:
	npm test -- --coverage
	open coverage/lcov-report/index.html

# Линтинг
lint:
	npm run lint

# Проверка типов
type-check:
	npm run type-check

# Запуск всех проверок
ci: lint type-check test
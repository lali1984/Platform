#!/bin/bash
# scripts/run-full-test-suite.sh

echo "=== Запуск полной проверки платформы ==="
echo "Время: $(date)"

# Создаем папку для отчетов
mkdir -p test-reports/$(date +%Y%m%d_%H%M%S)
cd test-reports/$(date +%Y%m%d_%H%M%S)

echo -e "\n1. Проверка баз данных..."
../scripts/test-databases.sh > test-reports/database-test.log 2>&1
cat database-test.log

echo -e "\n2. Проверка Redis и Kafka..."
../scripts/test-messaging.sh > messaging-test.log 2>&1  
cat messaging-test.log

echo -e "\n3. Проверка сервисов через Gateway..."
../scripts/test-all-services.sh > services-test.log 2>&1
cat services-test.log

echo -e "\n4. Проверка сети..."
../scripts/test-network-full.sh > network-test.log 2>&1
cat network-test.log

echo -e "\n5. Интеграционные тесты..."
../scripts/test-integration.sh > integration-test.log 2>&1
cat integration-test.log

echo -e "\n6. Проверка логов..."
../scripts/check-logs.sh > logs-check.log 2>&1
cat logs-check.log

echo -e "\n7. Проверка ресурсов..."
../scripts/check-resources.sh > resources-check.log 2>&1
cat resources-check.log

echo -e "\n=== Сводка результатов ==="
echo "Отчеты сохранены в: test-reports/$(date +%Y%m%d_%H%M%S)/"
echo "Проверьте файлы *.log для детальной информации"
#!/bin/bash
# scripts/test-messaging.sh

echo "=== Проверка Redis и Kafka ==="

# Redis
echo -n "1. Redis подключение: "
docker exec redis redis-cli ping | grep -q PONG && echo "OK" || echo "FAILED"

echo -n "2. Redis тест записи: "
docker exec redis redis-cli set test_key "test_value" EX 5 | grep -q OK && echo "OK" || echo "FAILED"

# Kafka
echo -n "3. Kafka статус: "
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list >/dev/null 2>&1 && echo "OK" || echo "FAILED"

echo -n "4. Kafka создание топика: "
docker exec kafka kafka-topics --create --topic test-topic --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1 2>/dev/null && echo "OK" || echo "FAILED"

echo -n "5. Kafka отправка сообщения: "
echo "test_message" | docker exec -i kafka kafka-console-producer --topic test-topic --bootstrap-server localhost:9092 2>/dev/null && echo "OK" || echo "FAILED"
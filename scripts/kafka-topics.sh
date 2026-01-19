#!/bin/bash
echo "🔧 Создание топиков Kafka для Auth Service..."

KAFKA_BROKER="localhost:9092"
KAFKA_TOPICS=(
  "user-events"
  "auth-events" 
  "security-events"
  "notification-events"
)

# Проверка доступности Kafka...

for TOPIC in "${KAFKA_TOPICS[@]}"; do
  echo "📝 Создаем топик: $TOPIC"
  
  docker exec kafka-broker kafka-topics.sh \
    --create \
    --bootstrap-server $KAFKA_BROKER \
    --replication-factor 1 \
    --partitions 3 \
    --topic "$TOPIC" \
    --if-not-exists
done
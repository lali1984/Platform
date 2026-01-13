#!/bin/bash
echo "=== НАСТРОЙКА МОНИТОРИНГА KAFKA ==="
echo

# 1. Проверка состояния Kafka
echo "1. СОСТОЯНИЕ СЕРВИСОВ:"
echo "Kafka: $(docker-compose ps kafka --format '{{.Status}}')"
echo "Kafka UI: $(docker-compose ps kafka-ui --format '{{.Status}}')"
echo "Zookeeper: $(docker-compose ps zookeeper --format '{{.Status}}')"
echo

# 2. Доступность Kafka UI
echo "2. KAFKA UI МОНИТОРИНГ:"
echo "URL: http://localhost:8081"
echo -n "Проверка доступности: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:8081 && echo "✓ Доступен" || echo "✗ Недоступен"
echo

# 3. Проверка топиков
echo "3. ТОПИКИ KAFKA:"
echo "Список топиков:"
docker-compose exec kafka kafka-topics --list --bootstrap-server localhost:9092 2>/dev/null | grep -v "^__consumer_offsets$"
echo

# 4. Информация о топиках
echo "4. ИНФОРМАЦИЯ О ТОПИКАХ:"
TOPICS=$(docker-compose exec kafka kafka-topics --list --bootstrap-server localhost:9092 2>/dev/null | grep -v "^__consumer_offsets$")

for topic in $TOPICS; do
    echo "Топик: $topic"
    docker-compose exec kafka kafka-topics --describe --topic "$topic" --bootstrap-server localhost:9092 2>/dev/null | head -1
done
echo

# 5. Отправка тестового события
echo "5. ТЕСТ ОТПРАВКИ СОБЫТИЙ:"
echo '{"event": "monitoring.test", "service": "gateway", "timestamp": "'$(date -Iseconds)'", "message": "Test monitoring event"}' | \
docker-compose exec -T kafka kafka-console-producer \
  --bootstrap-server localhost:9092 \
  --topic test.events \
  --property "parse.key=true" \
  --property "key.separator=:" 2>/dev/null && echo "✓ Событие отправлено в test.events"
echo

# 6. Проверка событий
echo "6. ПРОВЕРКА НАЛИЧИЯ СОБЫТИЙ:"
echo "Чтение последних сообщений из test.events:"
docker-compose exec kafka timeout 2 kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic test.events \
  --from-beginning \
  --max-messages 1 \
  --property print.timestamp=true \
  --property print.key=true \
  --property print.value=true 2>/dev/null | while read line; do
    echo "  📨 $line"
done
echo "  (если пусто - событий нет или только что отправленное еще не обработано)"
echo

# 7. Consumer groups
echo "7. CONSUMER GROUPS:"
echo "Список consumer groups:"
docker-compose exec kafka kafka-consumer-groups --list --bootstrap-server localhost:9092 2>/dev/null || echo "  Нет активных consumer groups"
echo

# 8. Создание скрипта мониторинга
echo "8. СОЗДАНИЕ СКРИПТА МОНИТОРИНГА:"
cat > kafka-monitor.sh << 'EOF'
#!/bin/bash
# Kafka Monitoring Script

KAFKA_HOST="localhost:9092"
LOG_DIR="./logs/kafka"
mkdir -p "$LOG_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_DIR/monitor.log"
}

check_kafka_health() {
    log "Checking Kafka health..."
    if docker-compose exec kafka kafka-topics --list --bootstrap-server $KAFKA_HOST >/dev/null 2>&1; then
        log "✓ Kafka is healthy"
        return 0
    else
        log "✗ Kafka is not responding"
        return 1
    fi
}

monitor_topics() {
    log "Monitoring Kafka topics..."
    
    TOPICS=$(docker-compose exec kafka kafka-topics --list --bootstrap-server $KAFKA_HOST 2>/dev/null | grep -v "^__consumer_offsets$")
    
    echo "Active topics:" | tee -a "$LOG_DIR/topics.log"
    for topic in $TOPICS; do
        # Get message count
        MSG_COUNT=$(docker-compose exec kafka kafka-run-class kafka.tools.GetOffsetShell \
            --bootstrap-server $KAFKA_HOST \
            --topic $topic \
            --time -1 2>/dev/null | awk -F: '{sum += $3} END {print sum}')
        
        echo "  $topic: ${MSG_COUNT:-0} messages" | tee -a "$LOG_DIR/topics.log"
    done
}

check_consumer_lag() {
    log "Checking consumer lag..."
    
    GROUPS=$(docker-compose exec kafka kafka-consumer-groups --list --bootstrap-server $KAFKA_HOST 2>/dev/null)
    
    if [ -n "$GROUPS" ]; then
        echo "Consumer groups lag:" | tee -a "$LOG_DIR/consumers.log"
        for group in $GROUPS; do
            docker-compose exec kafka kafka-consumer-groups \
                --bootstrap-server $KAFKA_HOST \
                --group "$group" \
                --describe 2>/dev/null | grep -E "(TOPIC|LAG)" | tee -a "$LOG_DIR/consumers.log"
        done
    else
        echo "No active consumer groups" | tee -a "$LOG_DIR/consumers.log"
    fi
}

# Main execution
log "Starting Kafka monitoring"
if check_kafka_health; then
    monitor_topics
    check_consumer_lag
    log "Monitoring completed successfully"
else
    log "Monitoring failed - Kafka unavailable"
    exit 1
fi
EOF

chmod +x kafka-monitor.sh
echo "✓ Скрипт мониторинга создан: ./kafka-monitor.sh"
echo

# 9. Создание конфигурации алертинга
echo "9. КОНФИГУРАЦИЯ АЛЕРТИНГА:"
mkdir -p monitoring/alerts

cat > monitoring/alerts/kafka-alerts.yml << 'EOF'
# Kafka Alerting Configuration
alerts:
  - name: kafka_broker_down
    condition: kafka_up == 0
    severity: critical
    description: "Kafka broker is down"
    
  - name: kafka_topic_no_messages
    condition: "increase(kafka_topic_messages_total[1h]) == 0"
    severity: warning  
    description: "No new messages in topic for 1 hour"
    
  - name: high_consumer_lag
    condition: kafka_consumer_lag > 10000
    severity: warning
    description: "High consumer lag detected"
    
  - name: kafka_under_replicated_partitions
    condition: kafka_under_replicated_partitions > 0
    severity: critical
    description: "Kafka has under-replicated partitions"
EOF

echo "✓ Конфигурация алертинга создана: monitoring/alerts/kafka-alerts.yml"
echo

# 10. Запуск мониторинга
echo "10. ЗАПУСК МОНИТОРИНГА:"
echo "Запускаем скрипт мониторинга..."
./kafka-monitor.sh
echo

echo "11. РЕКОМЕНДАЦИИ ПО МОНИТОРИНГУ:"
echo "📊 ВИЗУАЛИЗАЦИЯ:"
echo "  1. Откройте Kafka UI: http://localhost:8081"
echo "  2. Проверьте топики: test.events, auth.events"
echo "  3. Мониторьте consumer lag"
echo
echo "🚨 АЛЕРТЫ:"
echo "  1. Настройте алерты на недоступность Kafka"
echo "  2. Мониторьте отсутствие новых событий"
echo "  3. Отслеживайте consumer lag"
echo
echo "📈 МЕТРИКИ ДЛЯ СБОРА:"
echo "  - kafka_topic_messages_total"
echo "  - kafka_consumer_lag"
echo "  - kafka_broker_up"
echo "  - kafka_request_duration"
echo

echo "=== НАСТРОЙКА МОНИТОРИНГА KAFKA ЗАВЕРШЕНА ==="
echo
echo "✅ Задача 1.4 выполнена!"
echo "📋 Kafka UI доступен по: http://localhost:8081"
echo "📊 Скрипт мониторинга: ./kafka-monitor.sh"
echo "🚨 Конфигурация алертов: monitoring/alerts/kafka-alerts.yml"
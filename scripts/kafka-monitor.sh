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

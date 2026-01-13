#!/bin/bash

case "$1" in
  "start")
    echo "Starting development environment..."
    docker-compose up -d postgres-auth postgres-user redis zookeeper kafka kafka-ui
    echo "Infrastructure started. Wait 30 seconds for initialization..."
    sleep 30
    ;;
    
  "stop")
    echo "Stopping development environment..."
    docker-compose down
    ;;
    
  "logs")
    shift
    docker-compose logs -f "$@"
    ;;
    
  "status")
    docker-compose ps
    ;;
    
  "start-all")
    echo "Starting ALL services (infrastructure + applications)..."
    docker-compose up -d
    echo "All services started. Wait 45 seconds for full initialization..."
    sleep 45
    ;;

  "start-apps")
    echo "Starting application services only..."
    # Предполагаем, что ваши сервисы называются как-то так:
    docker-compose up -d auth-service user-service api-gateway notification-service
    echo "Application services started"
  ;;

  "db-reset")
    echo "Resetting databases..."
    docker-compose down -v
    docker-compose up -d postgres-auth postgres-user redis zookeeper kafka kafka-ui
    sleep 30
    echo "Databases reset and ready"
    ;;
    
  "kafka-topics")
    echo "Listing Kafka topics..."
    docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list
    ;;
    
  "kafka-create-topic")
    if [ -z "$2" ]; then
      echo "Usage: $0 kafka-create-topic <topic-name>"
      exit 1
    fi
    docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 \
      --create --topic "$2" --partitions 1 --replication-factor 1
    ;;
    
  *)
    echo "Usage: $0 {start|stop|logs|status|db-reset|kafka-topics|kafka-create-topic}"
    echo ""
    echo "Commands:"
    echo "  start                   Start all services"
    echo "  stop                    Stop all services"
    echo "  logs [service]          Show logs (optional: specific service)"
    echo "  status                  Show service status"
    echo "  db-reset                Reset databases and Kafka"
    echo "  kafka-topics            List Kafka topics"
    echo "  kafka-create-topic <name> Create a new Kafka topic"
    exit 1
    ;;
esac
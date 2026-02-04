#!/bin/bash

set -e

# Конфигурация
BACKUP_DIR="/backups/platform-ecosystem"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Создание директории для бэкапов
mkdir -p "$BACKUP_DIR"

# Функция для бэкапа PostgreSQL
backup_postgres() {
    local db_name=$1
    local db_user=$2
    local db_password=$3
    local db_host=$4
    local db_port=$5
    
    echo "Backing up PostgreSQL database: $db_name"
    
    export PGPASSWORD="$db_password"
    pg_dump -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name" \
        --format=custom --compress=9 \
        -f "$BACKUP_DIR/${db_name}_${DATE}.dump"
    
    echo "PostgreSQL backup completed: $db_name"
}

# Функция для бэкапа Redis
backup_redis() {
    local redis_host=$1
    local redis_port=$2
    local redis_password=$3
    
    echo "Backing up Redis"
    
    redis-cli -h "$redis_host" -p "$redis_port" -a "$redis_password" --rdb "$BACKUP_DIR/redis_${DATE}.rdb"
    
    echo "Redis backup completed"
}

# Функция для бэкапа Kafka топиков
backup_kafka() {
    echo "Backing up Kafka topics metadata"
    
    # Экспорт метаданных топиков
    kafka-topics --bootstrap-server localhost:9092 --list > "$BACKUP_DIR/kafka_topics_${DATE}.txt"
    
    # Экспорт конфигурации топиков
    kafka-configs --bootstrap-server localhost:9092 --entity-type topics --describe > "$BACKUP_DIR/kafka_configs_${DATE}.txt"
    
    echo "Kafka metadata backup completed"
}

# Функция для очистки старых бэкапов
cleanup_old_backups() {
    echo "Cleaning up backups older than $RETENTION_DAYS days"
    
    find "$BACKUP_DIR" -name "*.dump" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.rdb" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.txt" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
    
    echo "Old backups cleanup completed"
}

# Функция для бэкапа конфигураций
backup_configs() {
    echo "Backing up configurations"
    
    # Бэкап docker-compose файлов
    tar -czf "$BACKUP_DIR/configs_${DATE}.tar.gz" \
        docker-compose.production.yml \
        .env.production \
        00_infrastructure/ \
        --exclude=node_modules \
        --exclude=dist \
        --exclude=build
    
    echo "Configurations backup completed"
}

# Основная функция
main() {
    echo "Starting platform ecosystem backup at $(date)"
    
    # Бэкап PostgreSQL баз данных
    backup_postgres "auth_db" "$POSTGRES_AUTH_USER" "$POSTGRES_AUTH_PASSWORD" "localhost" "5432"
    backup_postgres "user_db" "$POSTGRES_USER_USER" "$POSTGRES_USER_PASSWORD" "localhost" "5433"
    
    # Бэкап Redis
    backup_redis "localhost" "6379" "$REDIS_PASSWORD"
    
    # Бэкап Kafka метаданных
    backup_kafka
    
    # Бэкап конфигураций
    backup_configs
    
    # Очистка старых бэкапов
    cleanup_old_backups
    
    # Создание отчета
    echo "Backup report:" > "$BACKUP_DIR/backup_report_${DATE}.txt"
    echo "Date: $(date)" >> "$BACKUP_DIR/backup_report_${DATE}.txt"
    echo "Backup directory: $BACKUP_DIR" >> "$BACKUP_DIR/backup_report_${DATE}.txt"
    echo "Files created:" >> "$BACKUP_DIR/backup_report_${DATE}.txt"
    find "$BACKUP_DIR" -name "*${DATE}*" -type f -exec basename {} \; >> "$BACKUP_DIR/backup_report_${DATE}.txt"
    
    echo "Backup completed successfully at $(date)"
    echo "Backup location: $BACKUP_DIR"
}

# Загрузка переменных окружения
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Запуск
main
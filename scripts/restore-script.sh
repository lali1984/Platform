#!/bin/bash

set -e

# Конфигурация
BACKUP_DIR="/backups/platform-ecosystem"

# Функция для восстановления PostgreSQL
restore_postgres() {
    local db_name=$1
    local db_user=$2
    local db_password=$3
    local db_host=$4
    local db_port=$5
    local backup_file=$6
    
    echo "Restoring PostgreSQL database: $db_name from $backup_file"
    
    # Останавливаем подключения к базе
    export PGPASSWORD="$db_password"
    psql -h "$db_host" -p "$db_port" -U "$db_user" -d postgres \
        -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$db_name' AND pid <> pg_backend_pid();"
    
    # Удаляем и создаем заново базу данных
    psql -h "$db_host" -p "$db_port" -U "$db_user" -d postgres \
        -c "DROP DATABASE IF EXISTS $db_name;"
    psql -h "$db_host" -p "$db_port" -U "$db_user" -d postgres \
        -c "CREATE DATABASE $db_name;"
    
    # Восстанавливаем из бэкапа
    pg_restore -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name" \
        --clean --if-exists --no-owner --no-privileges \
        "$backup_file"
    
    echo "PostgreSQL restore completed: $db_name"
}

# Функция для восстановления Redis
restore_redis() {
    local redis_host=$1
    local redis_port=$2
    local redis_password=$3
    local backup_file=$4
    
    echo "Restoring Redis from $backup_file"
    
    # Останавливаем Redis
    docker-compose -f docker-compose.production.yml stop redis-master
    
    # Копируем файл RDB
    cp "$backup_file" /data/platform-ecosystem/redis/master/dump.rdb
    
    # Запускаем Redis
    docker-compose -f docker-compose.production.yml start redis-master
    
    echo "Redis restore completed"
}

# Функция для выбора бэкапа
select_backup() {
    echo "Available backups:"
    
    local backups=($(find "$BACKUP_DIR" -name "*.dump" -type f | sort -r))
    
    if [ ${#backups[@]} -eq 0 ]; then
        echo "No backups found in $BACKUP_DIR"
        exit 1
    fi
    
    for i in "${!backups[@]}"; do
        echo "$((i+1)). $(basename ${backups[$i]})"
    done
    
    read -p "Select backup number (1-${#backups[@]}): " choice
    
    if [[ ! "$choice" =~ ^[0-9]+$ ]] || [ "$choice" -lt 1 ] || [ "$choice" -gt ${#backups[@]} ]; then
        echo "Invalid selection"
        exit 1
    fi
    
    local selected_backup="${backups[$((choice-1))]}"
    local backup_date=$(echo "$selected_backup" | grep -oE '[0-9]{8}_[0-9]{6}')
    
    echo "Selected backup: $selected_backup"
    echo "Backup date: $backup_date"
    
    # Находим все файлы для этой даты
    local backup_files=($(find "$BACKUP_DIR" -name "*${backup_date}*" -type f))
    
    echo "Found ${#backup_files[@]} files for this backup date"
    
    for file in "${backup_files[@]}"; do
        echo "  - $(basename $file)"
    done
    
    read -p "Continue with restore? (y/n): " confirm
    
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo "Restore cancelled"
        exit 0
    fi
    
    # Возвращаем файлы
    echo "${backup_files[@]}"
}

# Основная функция
main() {
    echo "Starting platform ecosystem restore"
    
    # Выбор бэкапа
    local backup_files=($(select_backup))
    
    # Извлекаем дату из первого файла
    local backup_date=$(echo "${backup_files[0]}" | grep -oE '[0-9]{8}_[0-9]{6}')
    
    echo "Starting restore from backup dated: $backup_date"
    
    # Останавливаем сервисы
    echo "Stopping platform services..."
    docker-compose -f docker-compose.production.yml stop \
        auth-service \
        user-service \
        bff-gateway \
        event-relay \
        frontend
    
    # Восстанавливаем базы данных
    for file in "${backup_files[@]}"; do
        if [[ "$file" == *"auth_db_"* ]]; then
            restore_postgres "auth_db" "$POSTGRES_AUTH_USER" "$POSTGRES_AUTH_PASSWORD" \
                "localhost" "5432" "$file"
        elif [[ "$file" == *"user_db_"* ]]; then
            restore_postgres "user_db" "$POSTGRES_USER_USER" "$POSTGRES_USER_PASSWORD" \
                "localhost" "5433" "$file"
        elif [[ "$file" == *"redis_"* ]]; then
            restore_redis "localhost" "6379" "$REDIS_PASSWORD" "$file"
        fi
    done
    
    # Запускаем сервисы
    echo "Starting platform services..."
    docker-compose -f docker-compose.production.yml start \
        auth-service \
        user-service \
        bff-gateway \
        event-relay \
        frontend
    
    echo "Restore completed successfully"
    echo "Please verify that all services are running correctly"
}

# Загрузка переменных окружения
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Запуск
main
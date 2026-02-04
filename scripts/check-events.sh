#!/bin/bash

# Проверка outbox событий в базе auth
echo "=== Проверка outbox событий в auth_db ==="
PGPASSWORD=secret psql -h localhost -p 5432 -U admin -d auth_db -c "
SELECT 
    id,
    type,
    status,
    attempts,
    created_at,
    processed_at,
    error
FROM outbox_events 
ORDER BY created_at DESC 
LIMIT 10;
"

echo -e "\n=== Проверка outbox событий в user_db ==="
PGPASSWORD=secret psql -h localhost -p 5433 -U admin -d user_db -c "
SELECT 
    id,
    type,
    status,
    attempts,
    created_at,
    processed_at,
    error
FROM outbox_events 
ORDER BY created_at DESC 
LIMIT 10;
"

echo -e "\n=== Проверка Kafka топиков ==="
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list

echo -e "\n=== Проверка Event Relay статуса ==="
curl -s http://localhost:3006/health | jq .

echo -e "\n=== Проверка созданных пользователей ==="
PGPASSWORD=secret psql -h localhost -p 5432 -U admin -d auth_db -c "
SELECT 
    id,
    email,
    is_active,
    created_at
FROM users 
ORDER BY created_at DESC 
LIMIT 5;
"
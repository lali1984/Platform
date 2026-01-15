#!/bin/bash
# scripts/test-databases.sh

echo "=== Проверка баз данных ==="

# PostgreSQL Auth
echo -n "1. PostgreSQL Auth (5432): "
docker exec postgres-auth psql -U admin -d auth_db -c "SELECT 'OK' as status;" | grep OK && echo "OK" || echo "FAILED"

# PostgreSQL User  
echo -n "2. PostgreSQL User (5433): "
docker exec postgres-user psql -U admin -d user_db -c "SELECT 'OK' as status;" | grep OK && echo "OK" || echo "FAILED"

# Проверка таблиц
echo -n "3. Таблицы в auth_db: "
docker exec postgres-auth psql -U admin -d auth_db -c "\dt" | grep -E "(users|sessions|tokens)" && echo "OK" || echo "Tables missing"

echo -n "4. Таблицы в user_db: "
docker exec postgres-user psql -U admin -d user_db -c "\dt" | grep -E "(profiles|settings)" && echo "OK" || echo "Tables missing"
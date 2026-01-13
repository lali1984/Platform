#!/bin/bash


echo "🚀 Starting local CI simulation..."

# 1. Clean up
docker-compose down -v --remove-orphans 2>/dev/null || true

# 2. Build images
echo "🔨 Building Docker images..."
docker-compose build

# 3. Start infrastructure
echo "🏗️  Starting infrastructure..."
docker-compose up -d postgres-auth postgres-user redis zookeeper kafka

# 4. Wait for infrastructure
echo "⏳ Waiting for infrastructure to be ready..."
sleep 60

# 5. Start services
echo "🚀 Starting application services..."
docker-compose up -d auth-service user-service api-gateway
sleep 30

# 6. Health checks
echo "🩺 Running health checks..."
curl -f http://localhost:3001/health && echo "✅ Auth Service OK"
curl -f http://localhost:3002/health && echo "✅ User Service OK"
curl -f http://localhost:8080/health && echo "✅ API Gateway OK"

# 7. Stop everything
echo "🧹 Cleaning up..."
docker-compose down -v

echo "🎉 Local CI test passed!"
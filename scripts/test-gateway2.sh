# 1. Проверим реальные эндпоинты auth-service
echo "=== ПРОВЕРКА ЭНДПОИНТОВ AUTH-SERVICE ==="
curl http://localhost:3001/health
curl -X POST http://localhost:3001/health
curl http://localhost:3001/api/auth/profile
curl -X POST http://localhost:3001/api/auth/refresh -H "Content-Type: application/json" -d '{"refreshToken":"test"}'

# 2. Проверим frontend
echo "=== ПРОВЕРКА FRONTEND ==="
docker-compose exec frontend curl -s http://localhost:5173/ | head -5

# 3. Обновим тесты под реальное состояние
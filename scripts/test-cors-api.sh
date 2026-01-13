# 1. OPTIONS с разрешенным Origin
curl -X OPTIONS -H "Origin: http://localhost:5173" http://localhost:8080/api/auth/register

# 2. OPTIONS с запрещенным Origin
curl -X OPTIONS -H "Origin: http://evil.com" http://localhost:8080/api/auth/register

# 3. GET с разрешенным Origin
curl -H "Origin: http://localhost:5173" http://localhost:8080/api/auth/health

# 4. GET с запрещенным Origin
curl -H "Origin: http://evil.com" http://localhost:8080/api/auth/health
FROM node:20-alpine

# Устанавливаем pnpm
RUN npm install -g pnpm@8.15.0

WORKDIR /app

# Копируем ВЕСЬ проект
COPY . .

# Устанавливаем зависимости для ВСЕГО workspace из корня
RUN pnpm install --frozen-lockfile

# Собираем contracts
RUN cd contracts && pnpm run build

# Проверяем contracts
RUN ls -la contracts/dist/index.js && echo "✅ contracts собран"

# Переходим в auth-service
WORKDIR /app/03_auth-service

# Проверяем зависимости auth-service
RUN ls -la node_modules/@platform/contracts 2>/dev/null && echo "✅ contracts link exists" || echo "❌ contracts link missing"
RUN ls -la node_modules/express 2>/dev/null && echo "✅ express exists" || echo "❌ express missing"

# Собираем auth-service
RUN pnpm run build

# Проверяем сборку
RUN ls -la dist/main.js && echo "✅ dist/main.js exists"

EXPOSE 3000

CMD ["node", "dist/main.js"]

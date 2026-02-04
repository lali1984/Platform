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

# Переходим в user-service
WORKDIR /app/04_user-service

# Проверяем зависимости user-service
RUN ls -la node_modules/@platform/contracts 2>/dev/null && echo "✅ contracts link exists" || echo "❌ contracts link missing"
RUN ls -la node_modules/@nestjs/core 2>/dev/null && echo "✅ nestjs exists" || echo "❌ nestjs missing"

# Собираем user-service
RUN pnpm run build

# Проверяем сборку
RUN ls -la dist/src/main.js && echo "✅ dist/src/main.js exists"

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
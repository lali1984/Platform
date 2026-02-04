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
RUN ls -la contracts/dist && echo "✅ contracts собран"

# Переходим в event-relay
WORKDIR /app/06_event-relay

# Проверяем зависимости event-relay
RUN ls -la node_modules/express 2>/dev/null && echo "✅ express exists" || echo "❌ express missing"
RUN ls -la node_modules/@platform/contracts 2>/dev/null && echo "✅ contracts link exists" || echo "❌ contracts link missing"
RUN ls -la node_modules/kafkajs 2>/dev/null && echo "✅ kafkajs exists" || echo "❌ kafkajs missing"
RUN ls -la node_modules/pg 2>/dev/null && echo "✅ pg exists" || echo "❌ pg missing"

# Собираем event-relay
RUN pnpm run build

# Проверяем сборку
RUN ls -la dist/main.js && echo "✅ dist/main.js exists"

# Удаляем исходный код и dev зависимости для уменьшения размера
WORKDIR /app
RUN rm -rf \
  01_frontend \
  02_bff-gateway \
  03_auth-service \
  04_user-service \
  contracts/src \
  06_event-relay/src \
  06_event-relay/tsconfig.json \
  06_event-relay/*.test.* \
  node_modules/.pnpm/@types+* \
  node_modules/.pnpm/jest* \
  node_modules/.pnpm/ts-* \
  node_modules/.pnpm/typescript* \
  node_modules/.pnpm/nodemon* \
  2>/dev/null || true

# Оставляем только event-relay и его зависимости
WORKDIR /app/06_event-relay

EXPOSE 3006

CMD ["node", "dist/main.js"]
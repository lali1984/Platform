FROM node:20-alpine

RUN npm install -g pnpm@8.15.0

WORKDIR /app

# Копируем только нужные файлы
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Копируем contracts и bff-gateway
COPY contracts ./contracts
COPY 02_bff-gateway ./02_bff-gateway

# Переходим в корень workspace и устанавливаем зависимости
WORKDIR /app
RUN pnpm install --frozen-lockfile

# Переходим в bff-gateway и собираем
WORKDIR /app/02_bff-gateway
RUN pnpm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
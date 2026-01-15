FROM node:20-alpine

WORKDIR /app

# 1. Сначала копируем только файлы зависимостей
COPY package*.json ./
COPY tsconfig.json ./

# 2. Чистим кэш и устанавливаем с флагами
RUN npm cache clean --force && \
    npm install --no-optional --legacy-peer-deps --verbose

# 3. Копируем остальные файлы
COPY . .

# 4. Собираем (если нужно)
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
FROM node:20-alpine

WORKDIR /app

# Копируем package.json и tsconfig
COPY package.json ./
COPY tsconfig.json ./
COPY package-lock.json ./
COPY index.js ./



# Устанавливаем зависимости
RUN npm install


# Копируем исходный код
COPY src ./src


# Собираем TypeScript
RUN npm run build


# Устанавливаем переменные окружения по умолчанию
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_HOST=postgres-auth
ENV DB_PORT=5432
ENV DB_NAME=auth_db
ENV DB_USER=admin
ENV DB_PASSWORD=secret
ENV JWT_SECRET=your-super-secret-jwt-key-change-in-production
ENV JWT_REFRESH_SECRET=your-refresh-secret-change-in-production
ENV REDIS_URL=redis://redis:6379
ENV KAFKA_BROKERS=kafka:9092
ENV KAFKA_CLIENT_ID=auth-service

EXPOSE 3000

CMD ["node", "dist/index.js"]
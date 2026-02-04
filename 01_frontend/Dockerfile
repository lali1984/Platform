FROM node:20

# Устанавливаем pnpm
RUN npm install -g pnpm@8.15.0

WORKDIR /app

# Копируем корневые файлы workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Копируем только frontend директорию
COPY 01_frontend/ ./01_frontend/

# Устанавливаем зависимости с игнорированием optional
RUN pnpm install --frozen-lockfile --prod=false

WORKDIR /app/01_frontend

EXPOSE 5173

CMD ["pnpm", "dev", "--host", "0.0.0.0"]
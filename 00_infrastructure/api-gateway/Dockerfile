FROM nginx:alpine

# 1. Устанавливаем curl для healthcheck
RUN apk add --no-cache curl

# 2. УДАЛЯЕМ ВСЕ entrypoint скрипты ПЕРЕД копированием конфигов
RUN rm -rf /docker-entrypoint.d/

# 3. Переопределяем entrypoint чтобы ничего не выполнялось
ENTRYPOINT []

# 4. Копируем наши конфиги
COPY nginx.conf /etc/nginx/nginx.conf


# 5. Удаляем default.conf если существует
# RUN rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true

# 6. Создаем директории
RUN mkdir -p /var/log/nginx /var/cache/nginx /usr/share/nginx/html

# 7. Создаем простые error страницы
RUN echo "<h1>404 - Not Found</h1>" > /usr/share/nginx/html/404.html && \
    echo "<h1>500 - Internal Server Error</h1>" > /usr/share/nginx/html/50x.html

# 8. Права
RUN chown -R nginx:nginx /var/cache/nginx && \
    chmod -R 755 /var/log/nginx

# 9. Проверяем конфигурацию
# RUN nginx -t

EXPOSE 80

# 10. Запускаем напрямую
CMD ["nginx", "-g", "daemon off;"]
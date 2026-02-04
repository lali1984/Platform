#!/bin/bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Проверка переменных окружения
check_env() {
    print_status "Checking environment variables..."
    
    local required_vars=(
        "POSTGRES_AUTH_PASSWORD"
        "POSTGRES_USER_PASSWORD"
        "REDIS_PASSWORD"
        "JWT_ACCESS_SECRET"
        "JWT_REFRESH_SECRET"
        "DOMAIN_NAME"
        "GRAFANA_ADMIN_PASSWORD"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        echo ""
        echo "Please set them in .env.production file"
        exit 1
    fi
    
    print_success "Environment variables check passed"
}

# Создание директорий для данных
create_data_dirs() {
    print_status "Creating data directories..."
    
    local dirs=(
        "/data/platform-ecosystem/postgres/auth"
        "/data/platform-ecosystem/postgres/user"
        "/data/platform-ecosystem/redis/master"
        "/data/platform-ecosystem/redis/replica"
        "/data/platform-ecosystem/kafka/1"
        "/data/platform-ecosystem/kafka/2"
        "/data/platform-ecosystem/zookeeper/data"
        "/data/platform-ecosystem/zookeeper/log"
        "/data/platform-ecosystem/prometheus"
        "/data/platform-ecosystem/alertmanager"
        "/data/platform-ecosystem/grafana"
        "/data/platform-ecosystem/nginx/logs"
        "/data/platform-ecosystem/nginx/cache"
        "/data/platform-ecosystem/ssl"
    )
    
    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            chmod 755 "$dir"
            print_status "Created directory: $dir"
        fi
    done
    
    print_success "Data directories created"
}

# Генерация SSL сертификатов
generate_ssl_certs() {
    print_status "Generating SSL certificates..."
    
    local ssl_dir="/data/platform-ecosystem/ssl"
    
    if [ ! -f "$ssl_dir/fullchain.pem" ] || [ ! -f "$ssl_dir/privkey.pem" ]; then
        print_warning "SSL certificates not found. Generating self-signed certificates..."
        
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout "$ssl_dir/privkey.pem" \
            -out "$ssl_dir/fullchain.pem" \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN_NAME"
        
        chmod 600 "$ssl_dir/privkey.pem"
        chmod 644 "$ssl_dir/fullchain.pem"
        
        print_success "Self-signed SSL certificates generated"
    else
        print_success "SSL certificates already exist"
    fi
}

# Сборка сервисов
build_services() {
    print_status "Building services..."
    
    local services=(
        "03_auth-service"
        "04_user-service"
        "02_bff-gateway"
        "06_event-relay"
        "01_frontend"
        "00_infrastructure/api-gateway"
    )
    
    for service in "${services[@]}"; do
        print_status "Building $service..."
        
        if [ -f "$service/Dockerfile.production" ]; then
            docker build -f "$service/Dockerfile.production" -t "platform-ecosystem/${service##*/}:latest" "$service"
        elif [ -f "$service/Dockerfile" ]; then
            docker build -t "platform-ecosystem/${service##*/}:latest" "$service"
        else
            print_warning "No Dockerfile found for $service"
        fi
    done
    
    print_success "All services built"
}

# Запуск инфраструктуры
start_infrastructure() {
    print_status "Starting infrastructure..."
    
    # Загружаем переменные окружения
    if [ -f .env.production ]; then
        export $(cat .env.production | grep -v '^#' | xargs)
    fi
    
    # Запускаем инфраструктуру
    docker-compose -f docker-compose.production.yml up -d \
        postgres-auth-primary \
        postgres-user-primary \
        redis-master \
        redis-replica \
        zookeeper \
        kafka-1 \
        kafka-2 \
        prometheus \
        alertmanager \
        grafana \
        postgres-exporter \
        redis-exporter \
        kafka-exporter \
        node-exporter \
        kafka-ui
    
    print_success "Infrastructure started"
}

# Ожидание готовности инфраструктуры
wait_for_infrastructure() {
    print_status "Waiting for infrastructure to be ready..."
    
    local services=(
        "postgres-auth-primary:5432"
        "postgres-user-primary:5432"
        "redis-master:6379"
        "kafka-1:9092"
        "prometheus:9090"
        "grafana:3000"
    )
    
    for service in "${services[@]}"; do
        local host=${service%:*}
        local port=${service#*:}
        
        print_status "Waiting for $host:$port..."
        
        local timeout=180
        local start_time=$(date +%s)
        
        while ! nc -z $host $port 2>/dev/null; do
            local current_time=$(date +%s)
            local elapsed=$((current_time - start_time))
            
            if [ $elapsed -ge $timeout ]; then
                print_error "Timeout waiting for $host:$port"
                return 1
            fi
            
            sleep 2
        done
        
        print_success "$host:$port is ready"
    done
    
    print_success "Infrastructure is ready"
}

# Запуск сервисов платформы
start_platform_services() {
    print_status "Starting platform services..."
    
    docker-compose -f docker-compose.production.yml up -d \
        auth-service \
        user-service \
        bff-gateway \
        event-relay \
        api-gateway \
        frontend \
        nginx-exporter
    
    print_success "Platform services started"
}

# Проверка работоспособности
health_check() {
    print_status "Performing health checks..."
    
    local endpoints=(
        "https://$DOMAIN_NAME/health"
        "https://$DOMAIN_NAME/api/auth/health"
        "https://$DOMAIN_NAME/api/v1/health"
        "http://localhost:3000"  # Grafana
        "http://localhost:9090"  # Prometheus
        "http://localhost:8081"  # Kafka UI
    )
    
    for endpoint in "${endpoints[@]}"; do
        print_status "Checking $endpoint..."
        
        if curl -f -s -k --retry 3 --retry-delay 5 "$endpoint" > /dev/null; then
            print_success "$endpoint is healthy"
        else
            print_error "$endpoint is not responding"
            return 1
        fi
    done
    
    print_success "All health checks passed"
}

# Основная функция
main() {
    print_status "Starting production deployment..."
    
    # Проверка прав
    if [ "$EUID" -ne 0 ]; then
        print_warning "Running as non-root user. Some operations may require sudo."
    fi
    
    # Выполнение шагов
    check_env
    create_data_dirs
    generate_ssl_certs
    build_services
    start_infrastructure
    wait_for_infrastructure
    start_platform_services
    
    # Даем время сервисам запуститься
    print_status "Waiting for services to initialize..."
    sleep 30
    
    health_check
    
    print_success "Production deployment completed successfully!"
    echo ""
    echo "Access URLs:"
    echo "  - Frontend: https://$DOMAIN_NAME"
    echo "  - Grafana: http://localhost:3000 (admin:${GRAFANA_ADMIN_PASSWORD})"
    echo "  - Prometheus: http://localhost:9090"
    echo "  - Kafka UI: http://localhost:8081"
    echo ""
    echo "To view logs: docker-compose -f docker-compose.production.yml logs -f"
    echo "To stop: docker-compose -f docker-compose.production.yml down"
}

# Запуск - ИСПРАВЛЕННАЯ ЧАСТЬ
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
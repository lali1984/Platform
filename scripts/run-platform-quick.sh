#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to wait for a service
wait_for_service() {
    local host="$1"
    local port="$2"
    local timeout="$3"
    local start_time=$(date +%s)
    
    print_status "Waiting for $host:$port..."
    
    while ! nc -z $host $port 2>/dev/null; do
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        if [ $elapsed -ge $timeout ]; then
            print_error "Timeout waiting for $host:$port"
            return 1
        fi
        
        sleep 2
        echo -n "."
    done
    
    echo
    print_success "$host:$port is ready"
    return 0
}

# Function to check service health
check_service_health() {
    local service_name="$1"
    local health_url="$2"
    
    print_status "Checking health of $service_name..."
    
    if curl -s -f "$health_url" > /dev/null; then
        print_success "$service_name is healthy"
        return 0
    else
        print_error "$service_name health check failed"
        return 1
    fi
}

# Function to build a service quickly
build_service_quick() {
    local service_dir="$1"
    local service_name="$2"
    
    print_status "Building $service_name..."
    
    if [ ! -d "$service_dir" ]; then
        print_error "$service_name directory not found: $service_dir"
        return 1
    fi
    
    cd "$service_dir"
    
    # Skip if already built
    if [ -d "dist" ] && [ -f "package.json" ]; then
        print_status "$service_name already built, skipping..."
        cd ..
        return 0
    fi
    
    # Quick install and build
    if [ -f "package.json" ]; then
        print_status "Installing dependencies..."
        npm install --no-audit --no-fund --loglevel=error
        
        if [ $? -ne 0 ]; then
            print_error "Failed to install $service_name dependencies"
            cd ..
            return 1
        fi
        
        if [ -f "tsconfig.json" ]; then
            print_status "Compiling TypeScript..."
            npm run build --silent
            
            if [ $? -ne 0 ]; then
                print_error "Failed to build $service_name"
                cd ..
                return 1
            fi
        fi
    fi
    
    cd ..
    print_success "$service_name built"
    return 0
}

# Main function
main() {
    echo "\n${BLUE}========================================${NC}"
    echo "${BLUE}  Platform Quick Start${NC}"
    echo "${BLUE}========================================${NC}"
    
    # Step 1: Start infrastructure
    print_status "Starting infrastructure services..."
    
    docker-compose -f docker-compose.full.yml up -d \
        postgres-auth \
        postgres-user \
        redis \
        zookeeper \
        kafka \
        kafka-ui
    
    if [ $? -ne 0 ]; then
        print_error "Failed to start infrastructure"
        exit 1
    fi
    
    print_success "Infrastructure services started"
    
    # Step 2: Wait for infrastructure
    echo "\n${YELLOW}Waiting for infrastructure to be ready...${NC}"
    
    wait_for_service "localhost" 5432 30 || exit 1
    wait_for_service "localhost" 5433 30 || exit 1
    wait_for_service "localhost" 6379 30 || exit 1
    wait_for_service "localhost" 2181 30 || exit 1
    wait_for_service "localhost" 9092 60 || exit 1
    
    # Step 3: Build services (skip contracts for now)
    echo "\n${YELLOW}Building platform services...${NC}"
    
    build_service_quick "03_auth-service" "auth-service" || exit 1
    build_service_quick "04_user-service" "user-service" || exit 1
    build_service_quick "06_event-relay" "event-relay" || exit 1
    
    # Step 4: Start platform services
    print_status "Starting platform services..."
    
    docker-compose -f docker-compose.full.yml up -d \
        auth-service \
        user-service \
        event-relay \
        api-gateway
    
    if [ $? -ne 0 ]; then
        print_error "Failed to start platform services"
        exit 1
    fi
    
    print_success "Platform services started"
    
    # Step 5: Wait for services
    echo "\n${YELLOW}Waiting for services to be ready...${NC}"
    sleep 10
    
    # Step 6: Check health
    echo "\n${YELLOW}Checking service health...${NC}"
    
    check_service_health "auth-service" "http://localhost:3001/health" || exit 1
    check_service_health "user-service" "http://localhost:3002/health" || exit 1
    check_service_health "api-gateway" "http://localhost/health" || exit 1
    
    # Step 7: Test basic functionality
    echo "\n${YELLOW}Testing basic functionality...${NC}"
    
    print_status "Testing API Gateway routing..."
    if curl -s "http://localhost/api/auth/health" | grep -q "auth-service"; then
        print_success "API Gateway routing works"
    else
        print_error "API Gateway routing failed"
        exit 1
    fi
    
    # Final message
    echo "\n${BLUE}========================================${NC}"
    echo -e "${GREEN}✅ Platform is running!${NC}"
    echo "${BLUE}========================================${NC}"
    echo "\nServices available:"
    echo "• API Gateway: http://localhost"
    echo "• Auth Service: http://localhost:3001"
    echo "• User Service: http://localhost:3002"
    echo "• Event Relay: http://localhost:3006"
    echo "• Kafka UI: http://localhost:8081"
    echo "\nHealth endpoints:"
    echo "• Gateway: http://localhost/health"
    echo "• Auth: http://localhost:3001/health"
    echo "• User: http://localhost:3002/health"
    echo "\nNext steps:"
    echo "1. Test user registration: curl -X POST http://localhost/api/auth/register ..."
    echo "2. Check Kafka topics: docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092"
    echo "3. View logs: docker-compose -f docker-compose.full.yml logs -f"
}

# Make script executable
chmod +x "$0"

# Run main function
main
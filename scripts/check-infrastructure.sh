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

# Function to check if Docker is running
check_docker() {
    print_status "Checking Docker..."
    
    if docker info > /dev/null 2>&1; then
        print_success "Docker is running"
        return 0
    else
        print_error "Docker is not running or not installed"
        return 1
    fi
}

# Function to check if port is available
check_port() {
    local port="$1"
    local service="$2"
    
    print_status "Checking port $port ($service)..."
    
    if lsof -i :$port > /dev/null 2>&1; then
        print_warning "Port $port is in use"
        return 1
    else
        print_success "Port $port is available"
        return 0
    fi
}

# Function to check required ports
check_required_ports() {
    echo "\n${YELLOW}Checking required ports...${NC}"
    
    local ports=(
        "80:API Gateway"
        "5432:PostgreSQL Auth"
        "5433:PostgreSQL User"
        "6379:Redis"
        "2181:Zookeeper"
        "9092:Kafka"
        "9094:Kafka External"
        "8081:Kafka UI"
        "3001:Auth Service"
        "3002:User Service"
        "3003:BFF Gateway"
        "3006:Event Relay"
        "5173:Frontend"
        "9090:Prometheus"
        "3000:Grafana"
    )
    
    local all_available=true
    
    for port_info in "${ports[@]}"; do
        local port="${port_info%%:*}"
        local service="${port_info#*:}"
        
        check_port "$port" "$service" || all_available=false
    done
    
    if [ "$all_available" = true ]; then
        print_success "All required ports are available"
        return 0
    else
        print_warning "Some ports are in use. You may need to stop conflicting services."
        return 1
    fi
}

# Function to check Docker Compose file
check_docker_compose() {
    print_status "Checking Docker Compose configuration..."
    
    if [ ! -f "docker-compose.full.yml" ]; then
        print_error "docker-compose.full.yml not found"
        return 1
    fi
    
    # Validate YAML syntax
    if docker-compose -f docker-compose.full.yml config > /dev/null 2>&1; then
        print_success "Docker Compose configuration is valid"
        return 0
    else
        print_error "Docker Compose configuration has errors"
        return 1
    fi
}

# Function to check required files
check_required_files() {
    echo "\n${YELLOW}Checking required files...${NC}"
    
    local files=(
        "00_infrastructure/databases/postgres/init-auth.sql"
        "00_infrastructure/databases/postgres/init-user.sql"
        "00_infrastructure/api-gateway/nginx.conf"
        "00_infrastructure/api-gateway/Dockerfile"
        "00_infrastructure/monitoring/prometheus/prometheus.yml"
        "03_auth-service/Dockerfile"
        "04_user-service/Dockerfile"
        "06_event-relay/Dockerfile"
    )
    
    local all_exist=true
    
    for file in "${files[@]}"; do
        print_status "Checking $file..."
        
        if [ -f "$file" ]; then
            print_success "$file exists"
        else
            print_error "$file not found"
            all_exist=false
        fi
    done
    
    if [ "$all_exist" = true ]; then
        print_success "All required files exist"
        return 0
    else
        print_error "Some required files are missing"
        return 1
    fi
}

# Function to check service configurations
check_service_configs() {
    echo "\n${YELLOW}Checking service configurations...${NC}"
    
    # Check auth-service package.json
    print_status "Checking auth-service configuration..."
    if [ -f "03_auth-service/package.json" ]; then
        if grep -q '"build"' "03_auth-service/package.json"; then
            print_success "auth-service has build script"
        else
            print_error "auth-service missing build script"
            return 1
        fi
    else
        print_error "auth-service package.json not found"
        return 1
    fi
    
    # Check user-service package.json
    print_status "Checking user-service configuration..."
    if [ -f "04_user-service/package.json" ]; then
        if grep -q '"build"' "04_user-service/package.json"; then
            print_success "user-service has build script"
        else
            print_error "user-service missing build script"
            return 1
        fi
    else
        print_error "user-service package.json not found"
        return 1
    fi
    
    return 0
}

# Main function
main() {
    echo "\n${BLUE}========================================${NC}"
    echo "${BLUE}  Infrastructure Pre-flight Check${NC}"
    echo "${BLUE}========================================${NC}"
    
    local all_checks_passed=true
    
    # Check Docker
    check_docker || all_checks_passed=false
    
    # Check Docker Compose
    check_docker_compose || all_checks_passed=false
    
    # Check required files
    check_required_files || all_checks_passed=false
    
    # Check service configurations
    check_service_configs || all_checks_passed=false
    
    # Check ports (warning only)
    check_required_ports
    
    # Summary
    echo "\n${BLUE}========================================${NC}"
    echo "${BLUE}  Check Summary${NC}"
    echo "${BLUE}========================================${NC}"
    
    if [ "$all_checks_passed" = true ]; then
        echo -e "${GREEN}✅ All infrastructure checks passed!${NC}"
        echo "\nYou can now start the platform:"
        echo "1. Start infrastructure: docker-compose -f docker-compose.full.yml up -d"
        echo "2. Or run quick test: ./scripts/run-platform-quick.sh"
        echo "3. Or run full test: ./scripts/run-platform.sh quick"
        return 0
    else
        echo -e "${RED}❌ Some infrastructure checks failed${NC}"
        echo "\nPlease fix the issues above before proceeding."
        echo "Common issues:"
        echo "• Docker not running: start Docker Desktop"
        echo "• Missing files: check the file paths"
        echo "• Port conflicts: stop services using required ports"
        return 1
    fi
}

# Make script executable
chmod +x "$0"

# Run main function
main
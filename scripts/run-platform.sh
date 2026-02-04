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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for a service to be ready
wait_for_service() {
    local host=$1
    local port=$2
    local timeout=$3
    local start_time=$(date +%s)
    
    print_status "Waiting for $host:$port..."
    
    while ! nc -z $host $port 2>/dev/null; do
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        if [ $elapsed -ge $timeout ]; then
            print_error "Timeout waiting for $host:$port"
            return 1
        fi
        
        sleep 1
    done
    
    print_success "$host:$port is ready"
    return 0
}

# Function to build contracts (OPTIMIZED VERSION)
build_contracts() {
    print_status "Building contracts..."
    
    if [ ! -d "contracts" ]; then
        print_error "Contracts directory not found"
        return 1
    fi
    
    cd contracts
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in contracts directory"
        cd ..
        return 1
    fi
    
    # Check if we need to install dependencies
    local need_install=false
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "node_modules not found, installing dependencies..."
        need_install=true
    else
        # Check if package.json has changed since last install
        if [ -f "node_modules/.package-lock.json" ]; then
            if ! cmp -s "package-lock.json" "node_modules/.package-lock.json"; then
                print_status "package-lock.json changed, reinstalling dependencies..."
                need_install=true
            fi
        else
            print_status "No package-lock.json cache found, installing dependencies..."
            need_install=true
        fi
    fi
    
    # Install dependencies if needed
    if [ "$need_install" = true ]; then
        # Use npm install instead of npm ci for better caching
        npm install --no-audit --no-fund --loglevel=error
        
        if [ $? -ne 0 ]; then
            print_error "Failed to install contracts dependencies"
            cd ..
            return 1
        fi
        
        # Cache package-lock.json for future comparison
        cp package-lock.json node_modules/.package-lock.json 2>/dev/null || true
    else
        print_status "Dependencies are up to date, skipping install..."
    fi
    
    # Check if we need to build
    local need_build=false
    
    # Check if dist directory exists
    if [ ! -d "dist" ]; then
        print_status "dist directory not found, building..."
        need_build=true
    else
        # Check if source files are newer than build
        local newest_source=$(find src -name "*.ts" -type f -exec stat -f "%m" {} \; 2>/dev/null | sort -n | tail -1)
        local oldest_build=$(find dist -name "*.js" -type f -exec stat -f "%m" {} \; 2>/dev/null | sort -n | head -1 2>/dev/null || echo 0)
        
        if [ -n "$newest_source" ] && [ "$newest_source" -gt "$oldest_build" ]; then
            print_status "Source files changed, rebuilding..."
            need_build=true
        fi
    fi
    
    # Build if needed
    if [ "$need_build" = true ]; then
        print_status "Compiling contracts..."
        npm run build --silent
        
        if [ $? -ne 0 ]; then
            print_error "Failed to build contracts"
            cd ..
            return 1
        fi
    else
        print_status "Contracts already built and up to date, skipping..."
    fi
    
    cd ..
    print_success "Contracts ready"
    return 0
}

# Function to build a service (OPTIMIZED VERSION)
build_service() {
    local service_dir=$1
    local service_name=$2
    
    print_status "Building $service_name..."
    
    if [ ! -d "$service_dir" ]; then
        print_error "$service_name directory not found: $service_dir"
        return 1
    fi
    
    cd "$service_dir"
    
    # Check if it's a TypeScript project
    if [ -f "package.json" ]; then
        # Check if we need to install dependencies
        local need_install=false
        
        if [ ! -d "node_modules" ]; then
            print_status "Installing $service_name dependencies..."
            need_install=true
        else
            # Check if package.json has changed
            if [ -f "node_modules/.package-lock.json" ]; then
                if ! cmp -s "package-lock.json" "node_modules/.package-lock.json"; then
                    print_status "package-lock.json changed, reinstalling dependencies..."
                    need_install=true
                fi
            else
                print_status "No package-lock.json cache found, installing dependencies..."
                need_install=true
            fi
        fi
        
        # Install dependencies if needed
        if [ "$need_install" = true ]; then
            npm install --no-audit --no-fund --loglevel=error
            
            if [ $? -ne 0 ]; then
                print_error "Failed to install $service_name dependencies"
                cd ..
                return 1
            fi
            
            # Cache package-lock.json
            cp package-lock.json node_modules/.package-lock.json 2>/dev/null || true
        else
            print_status "Dependencies are up to date, skipping install..."
        fi
        
        # Check if we need to build TypeScript
        if [ -f "tsconfig.json" ]; then
            local need_build=false
            
            if [ ! -d "dist" ]; then
                print_status "dist directory not found, building..."
                need_build=true
            else
                # Check if source files are newer than build
                local newest_source=$(find src -name "*.ts" -type f -exec stat -f "%m" {} \; 2>/dev/null | sort -n | tail -1)
                local oldest_build=$(find dist -name "*.js" -type f -exec stat -f "%m" {} \; 2>/dev/null | sort -n | head -1 2>/dev/null || echo 0)
                
                if [ -n "$newest_source" ] && [ "$newest
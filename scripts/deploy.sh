#!/bin/bash

# 🚀 AZORA OS - ONE COMMAND DEPLOYMENT SCRIPT
# This script sets up the complete Azora OS ecosystem

set -e

echo "🚀 Starting Azora OS Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    print_success "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env() {
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating template..."
        cat > .env << EOF
# Azora OS Environment Configuration

# Database
DATABASE_URL=postgresql://azora:azora@localhost:5432/azora_os

# JWT Secret
JWT_SECRET=azora-super-secret-jwt-key-2025

# OpenAI API Key (required for AI features)
OPENAI_API_KEY=your-openai-api-key-here

# Stripe Keys (required for payments)
STRIPE_SECRET_KEY=your-stripe-secret-key-here
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret-here

# Service URLs (for local development)
AUTH_URL=http://localhost:3001
MINT_URL=http://localhost:3002
LMS_URL=http://localhost:3003
FORGE_URL=http://localhost:3004
NEXUS_URL=http://localhost:3005
EDUCATION_URL=http://localhost:3007
PAYMENTS_URL=http://localhost:3008

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000
EOF
        print_warning "Please edit the .env file with your actual API keys before running this script again."
        exit 1
    fi

    print_success "Environment file found"
}

# Setup databases
setup_databases() {
    print_status "Setting up databases..."

    # Create database directory if it doesn't exist
    mkdir -p database

    # Create database initialization script
    cat > database/init.sql << 'EOF'
-- Azora OS Database Initialization

-- Create databases for each service
CREATE DATABASE azora_auth;
CREATE DATABASE azora_mint;
CREATE DATABASE azora_lms;
CREATE DATABASE azora_forge;
CREATE DATABASE azora_nexus;
CREATE DATABASE azora_education;
CREATE DATABASE azora_payments;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE azora_auth TO azora;
GRANT ALL PRIVILEGES ON DATABASE azora_mint TO azora;
GRANT ALL PRIVILEGES ON DATABASE azora_lms TO azora;
GRANT ALL PRIVILEGES ON DATABASE azora_forge TO azora;
GRANT ALL PRIVILEGES ON DATABASE azora_nexus TO azora;
GRANT ALL PRIVILEGES ON DATABASE azora_education TO azora;
GRANT ALL PRIVILEGES ON DATABASE azora_payments TO azora;
EOF

    print_success "Database setup complete"
}

# Setup nginx configuration
setup_nginx() {
    print_status "Setting up Nginx configuration..."

    mkdir -p nginx/ssl

    # Create nginx configuration
    cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # Performance
    sendfile        on;
    tcp_nopush      on;
    tcp_nodelay     on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Upstream servers
    upstream azora_frontend {
        server frontend:3000;
    }

    upstream azora_api {
        server api-gateway:4000;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name localhost;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name localhost;

        # SSL configuration (self-signed for development)
        ssl_certificate /etc/nginx/ssl/localhost.crt;
        ssl_certificate_key /etc/nginx/ssl/localhost.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Frontend
        location / {
            proxy_pass http://azora_frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # API Gateway
        location /api/ {
            proxy_pass http://azora_api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

    # Generate self-signed SSL certificate for development
    if [ ! -f "nginx/ssl/localhost.crt" ]; then
        openssl req -x509 -newkey rsa:4096 -keyout nginx/ssl/localhost.key -out nginx/ssl/localhost.crt -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        print_success "Self-signed SSL certificate generated"
    fi

    print_success "Nginx setup complete"
}

# Build and start services
deploy_services() {
    print_status "Building and starting services..."

    # Build all services
    docker-compose build

    # Start all services
    docker-compose up -d

    print_success "Services started successfully"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."

    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 30

    # Run migrations for each service
    services=("auth-service" "mint-service" "lms-service" "forge-service" "nexus-service" "education-service" "payments-service")

    for service in "${services[@]}"; do
        print_status "Running migrations for $service..."
        docker-compose exec -T $service npm run db:migrate
        docker-compose exec -T $service npm run db:generate
    done

    print_success "Database migrations complete"
}

# Health check
health_check() {
    print_status "Running health checks..."

    services=(
        "api-gateway:4000"
        "auth-service:3001"
        "mint-service:3002"
        "lms-service:3003"
        "forge-service:3004"
        "nexus-service:3005"
        "education-service:3007"
        "payments-service:3008"
        "frontend:3000"
    )

    for service in "${services[@]}"; do
        name=$(echo $service | cut -d: -f1)
        port=$(echo $service | cut -d: -f2)

        if curl -f -s http://localhost:$port/health > /dev/null; then
            print_success "$name is healthy"
        else
            print_error "$name health check failed"
        fi
    done
}

# Main deployment function
main() {
    print_status "🚀 Azora OS Deployment Starting..."

    check_docker
    check_env
    setup_databases
    setup_nginx
    deploy_services
    run_migrations
    health_check

    echo ""
    print_success "🎉 Azora OS deployment complete!"
    echo ""
    echo "🌐 Frontend: https://localhost"
    echo "🚪 API Gateway: http://localhost:4000"
    echo "📊 Services:"
    echo "  • Auth Service: http://localhost:3001"
    echo "  • Mint Service: http://localhost:3002"
    echo "  • LMS Service: http://localhost:3003"
    echo "  • Forge Service: http://localhost:3004"
    echo "  • Nexus Service: http://localhost:3005"
    echo "  • Education Service: http://localhost:3007"
    echo "  • Payments Service: http://localhost:3008"
    echo ""
    echo "📝 Don't forget to:"
    echo "  • Update your .env file with real API keys"
    echo "  • Configure SSL certificates for production"
    echo "  • Set up monitoring and logging"
    echo "  • Configure backup strategies"
}

# Run main function
main "$@"
#!/bin/bash

# 🛠️ AZORA OS - DEVELOPMENT SETUP SCRIPT
# Sets up development environment with hot reloading and debugging

set -e

echo "🛠️ Setting up Azora OS Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi

    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    print_success "Prerequisites check passed"
}

# Setup environment
setup_environment() {
    print_status "Setting up environment..."

    # Copy environment template if .env doesn't exist
    if [ ! -f ".env" ]; then
        cp .env.example .env 2>/dev/null || {
            print_warning ".env.example not found. Creating basic .env file..."
            cat > .env << EOF
# Azora OS Development Environment

# Database
DATABASE_URL=postgresql://azora:azora@localhost:5432/azora_os

# JWT Secret
JWT_SECRET=azora-dev-secret-key-2025

# OpenAI API Key (optional for development)
OPENAI_API_KEY=your-openai-api-key-here

# Stripe Keys (optional for development)
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
        }
    fi

    print_success "Environment setup complete"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."

    # Install root dependencies
    npm install

    # Install service dependencies
    services=("api-gateway" "auth-service" "mint-service" "lms-service" "forge-service" "nexus-service" "education-service" "payments-service")

    for service in "${services[@]}"; do
        print_status "Installing dependencies for $service..."
        cd services/$service
        npm install
        cd ../..
    done

    print_success "Dependencies installed"
}

# Setup databases
setup_databases() {
    print_status "Setting up development databases..."

    # Start only database and redis
    docker-compose up -d database redis

    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 15

    print_success "Development databases ready"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."

    services=("auth-service" "mint-service" "lms-service" "forge-service" "nexus-service" "education-service" "payments-service")

    for service in "${services[@]}"; do
        print_status "Running migrations for $service..."
        cd services/$service
        npm run db:migrate
        npm run db:generate
        cd ../..
    done

    print_success "Database migrations complete"
}

# Setup VS Code workspace
setup_vscode() {
    print_status "Setting up VS Code workspace..."

    # Create .vscode directory if it doesn't exist
    mkdir -p .vscode

    # Create settings.json
    cat > .vscode/settings.json << EOF
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.associations": {
    "*.env": "properties",
    "Dockerfile*": "dockerfile"
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  "git.autofetch": true,
  "git.enableSmartCommit": true,
  "terminal.integrated.shell.linux": "/bin/bash"
}
EOF

    # Create launch.json for debugging
    cat > .vscode/launch.json << EOF
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug API Gateway",
      "type": "node",
      "request": "launch",
      "program": "\${workspaceFolder}/services/api-gateway/index.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Auth Service",
      "type": "node",
      "request": "launch",
      "program": "\${workspaceFolder}/services/auth-service/index.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    },
    {
      "name": "Debug All Services",
      "type": "node",
      "request": "launch",
      "program": "\${workspaceFolder}/scripts/debug-all.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    }
  ]
}
EOF

    print_success "VS Code workspace configured"
}

# Setup development tools
setup_dev_tools() {
    print_status "Setting up development tools..."

    # Install ESLint and Prettier globally if not present
    if ! command -v eslint &> /dev/null; then
        npm install -g eslint
        print_success "ESLint installed globally"
    fi

    if ! command -v prettier &> /dev/null; then
        npm install -g prettier
        print_success "Prettier installed globally"
    fi

    # Setup Git hooks
    if [ -d ".husky" ]; then
        npm run prepare
        print_success "Git hooks installed"
    fi
}

# Create helper scripts
create_helper_scripts() {
    print_status "Creating helper scripts..."

    # Create dev-start script
    cat > dev-start.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Azora OS Development Environment"
echo "============================================"

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d database redis

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Start all services
echo "🔄 Starting all services..."
npm run dev:all

echo "✅ Development environment started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🚪 API Gateway: http://localhost:4000"
echo "🔐 Auth Service: http://localhost:3001"
echo "📊 Grafana: http://localhost:3030"
echo "📈 Prometheus: http://localhost:9090"
EOF

    chmod +x dev-start.sh

    # Create dev-stop script
    cat > dev-stop.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping Azora OS Development Environment"

# Stop all services
pkill -f "npm run dev" || true
pkill -f "node.*index.js" || true

# Stop Docker services
docker-compose down

echo "✅ Development environment stopped"
EOF

    chmod +x dev-stop.sh

    # Create test script
    cat > run-tests.sh << 'EOF'
#!/bin/bash
echo "🧪 Running Azora OS Test Suite"
echo "=============================="

# Run linting
echo "🔍 Running ESLint..."
npm run lint

# Run TypeScript checks
echo "🔧 Running TypeScript checks..."
npm run type-check

# Run unit tests
echo "🧪 Running unit tests..."
npm run test

# Run integration tests
echo "🔗 Running integration tests..."
npm run test:integration

echo "✅ All tests completed!"
EOF

    chmod +x run-tests.sh

    print_success "Helper scripts created"
}

# Main function
main() {
    check_prerequisites
    setup_environment
    install_dependencies
    setup_databases
    run_migrations
    setup_vscode
    setup_dev_tools
    create_helper_scripts
    show_menu
}

# Run main function
main "$@"
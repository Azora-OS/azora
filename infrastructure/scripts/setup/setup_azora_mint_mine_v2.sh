#!/bin/bash

# AZORA MINT-MINE INTEGRATION SETUP SCRIPT v2.0
# Complete setup for advanced mining and token minting system

set -e

echo "🚀 AZORA Mint-Mine Integration Setup v2.0"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="/workspaces/azora-os"
AZORA_CHAIN_RPC="${AZORA_RPC_URL:-http://localhost:8545}"
AZORA_CHAIN_ID="${AZORA_CHAIN_ID:-1337}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-azora_os}"
DB_USER="${DB_USER:-azora}"
DB_PASSWORD="${DB_PASSWORD:-}"

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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+"
        exit 1
    fi

    # Check if Python is installed
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.8+"
        exit 1
    fi

    # Check if PostgreSQL is available
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL client not found. Database setup will be skipped."
        SKIP_DB=true
    fi

    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        print_warning "Docker not found. Some services may not be available."
    fi

    print_success "Prerequisites check completed"
}

# Setup Python environment
setup_python_env() {
    print_status "Setting up Python environment..."

    cd "$PROJECT_ROOT"

    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_success "Created Python virtual environment"
    fi

    # Activate virtual environment
    source venv/bin/activate

    # Install Python dependencies
    pip install --upgrade pip
    pip install web3 requests psycopg2-binary flask plotly pandas numpy

    print_success "Python environment setup completed"
}

# Setup Node.js environment
setup_node_env() {
    print_status "Setting up Node.js environment..."

    cd "$PROJECT_ROOT"

    # Install dependencies if package.json exists
    if [ -f "package.json" ]; then
        npm install
        print_success "Node.js dependencies installed"
    else
        print_warning "No package.json found, skipping npm install"
    fi
}

# Setup database
setup_database() {
    if [ "$SKIP_DB" = true ]; then
        print_warning "Skipping database setup due to missing PostgreSQL client"
        return
    fi

    print_status "Setting up PostgreSQL database..."

    # Create database if it doesn't exist
    if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -l | grep -q "$DB_NAME"; then
        createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
        print_success "Created database: $DB_NAME"
    else
        print_status "Database $DB_NAME already exists"
    fi

    # Run schema
    if [ -f "database/schema.sql" ]; then
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f database/schema.sql
        print_success "Database schema applied"
    else
        print_error "Database schema file not found"
        exit 1
    fi
}

# Deploy smart contracts
deploy_contracts() {
    print_status "Deploying smart contracts..."

    cd "$PROJECT_ROOT"

    # Check if Hardhat is available
    if [ ! -f "hardhat.config.js" ]; then
        print_warning "Hardhat config not found, using mock deployment"
        # Create mock contract address for development
        mkdir -p secrets
        echo "0x1234567890123456789012345678901234567890" > secrets/azr_contract_address.txt
        print_success "Mock contract deployment completed"
        return
    fi

    # Deploy contracts using Hardhat
    npx hardhat run scripts/deploy-contracts.js --network localhost

    print_success "Smart contracts deployed"
}

# Setup wallet and keys
setup_wallet() {
    print_status "Setting up wallet configuration..."

    mkdir -p secrets

    # Generate or load private key
    if [ ! -f "secrets/minter_pk.txt" ]; then
        # Generate a new private key for development
        node -e "
        const { Wallet } = require('ethers');
        const wallet = Wallet.createRandom();
        console.log(wallet.privateKey.slice(2));
        " > secrets/minter_pk.txt
        print_success "Generated new private key"
    fi

    # Generate or load address
    if [ ! -f "secrets/minter_key.txt" ]; then
        node -e "
        const { Wallet } = require('ethers');
        const fs = require('fs');
        const pk = fs.readFileSync('secrets/minter_pk.txt', 'utf8').trim();
        const wallet = new Wallet('0x' + pk);
        console.log(wallet.address);
        " > secrets/minter_key.txt
        print_success "Generated wallet address"
    fi

    # Set proper permissions
    chmod 600 secrets/minter_pk.txt
    chmod 644 secrets/minter_key.txt

    print_success "Wallet setup completed"
}

# Setup mining configuration
setup_mining_config() {
    print_status "Setting up mining configuration..."

    mkdir -p config

    # Create mining pools configuration
    cat > config/mining_pools.json << EOF
{
    "pools": [
        {
            "name": "WoolyPooly IRON",
            "algorithm": "FishHash",
            "url": "iron.woolypooly.com",
            "port": 3104,
            "priority": 1,
            "active": true
        },
        {
            "name": "FlexPool IRON",
            "algorithm": "FishHash",
            "url": "iron.flexpool.io",
            "port": 3333,
            "priority": 2,
            "active": true
        },
        {
            "name": "HERO IRON",
            "algorithm": "FishHash",
            "url": "iron.herominers.com",
            "port": 1143,
            "priority": 3,
            "active": true
        }
    ],
    "algorithm": "FishHash",
    "coin": "IRON",
    "hashrate_mhs": 42.0,
    "conversion_rate": 100.0
}
EOF

    # Create wallets configuration
    cat > config/wallets.json << EOF
{
    "minter_wallet": {
        "address": "$(cat secrets/minter_key.txt)",
        "type": "minter"
    },
    "reward_wallets": [
        {
            "address": "$(cat secrets/minter_key.txt)",
            "allocation": 100
        }
    ]
}
EOF

    print_success "Mining configuration setup completed"
}

# Create environment configuration
create_env_config() {
    print_status "Creating environment configuration..."

    cat > .env << EOF
# AZORA Chain Configuration
AZORA_RPC_URL=$AZORA_CHAIN_RPC
AZORA_CHAIN_ID=$AZORA_CHAIN_ID

# Database Configuration
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Mining Configuration
MINING_ALGORITHM=FishHash
MINING_COIN=IRON
HASH_RATE_MHS=42.0
CONVERSION_RATE=100.0

# Security
ALERT_WEBHOOK=

# Logging
LOG_LEVEL=INFO
EOF

    print_success "Environment configuration created"
}

# Setup monitoring and logging
setup_monitoring() {
    print_status "Setting up monitoring and logging..."

    mkdir -p logs
    mkdir -p monitoring

    # Create log rotation configuration
    cat > monitoring/logrotate.conf << EOF
/var/log/azora/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 azora azora
}
EOF

    print_success "Monitoring setup completed"
}

# Create systemd services (optional)
create_services() {
    if [ -d "/etc/systemd/system" ] && [ "$EUID" -eq 0 ]; then
        print_status "Creating systemd services..."

        # Mining engine service
        cat > /etc/systemd/system/azora-mining-engine.service << EOF
[Unit]
Description=AZORA Mint-Mine Integration Engine
After=network.target postgresql.service

[Service]
Type=simple
User=azora
WorkingDirectory=$PROJECT_ROOT
ExecStart=$PROJECT_ROOT/venv/bin/python3 azora_mint_mine_engine_v2.py
Restart=always
RestartSec=10
Environment=PATH=$PROJECT_ROOT/venv/bin

[Install]
WantedBy=multi-user.target
EOF

        # Dashboard service
        cat > /etc/systemd/system/azora-dashboard.service << EOF
[Unit]
Description=AZORA Mint-Mine Dashboard
After=network.target azora-mining-engine.service

[Service]
Type=simple
User=azora
WorkingDirectory=$PROJECT_ROOT
ExecStart=$PROJECT_ROOT/venv/bin/python3 azora-mint-mine-dashboard.py
Restart=always
RestartSec=10
Environment=PATH=$PROJECT_ROOT/venv/bin

[Install]
WantedBy=multi-user.target
EOF

        systemctl daemon-reload
        print_success "Systemd services created"
    else
        print_warning "Skipping systemd services (not running as root or systemd not available)"
    fi
}

# Create startup scripts
create_startup_scripts() {
    print_status "Creating startup scripts..."

    # Main startup script
    cat > start_azora_mint_mine.sh << 'EOF'
#!/bin/bash
# AZORA Mint-Mine Integration Startup Script

echo "🚀 Starting AZORA Mint-Mine Integration..."

# Set working directory
cd "$(dirname "$0")"

# Activate Python environment
source venv/bin/activate

# Start mining engine in background
echo "⛏️ Starting mining engine..."
python3 azora_mint_mine_engine_v2.py &
ENGINE_PID=$!

# Wait a moment for engine to initialize
sleep 5

# Start dashboard
echo "📊 Starting dashboard..."
python3 azora-mint-mine-dashboard.py &
DASHBOARD_PID=$!

echo "✅ AZORA Mint-Mine Integration started!"
echo "📊 Dashboard: http://localhost:5000"
echo "⛏️ Engine PID: $ENGINE_PID"
echo "📊 Dashboard PID: $DASHBOARD_PID"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "echo '🛑 Stopping services...'; kill $ENGINE_PID $DASHBOARD_PID 2>/dev/null; exit" INT
wait
EOF

    chmod +x start_azora_mint_mine.sh

    # Stop script
    cat > stop_azora_mint_mine.sh << 'EOF'
#!/bin/bash
# AZORA Mint-Mine Integration Stop Script

echo "🛑 Stopping AZORA Mint-Mine Integration..."

# Kill all related processes
pkill -f "azora_mint_mine_engine_v2.py" || true
pkill -f "azora-mint-mine-dashboard.py" || true

echo "✅ Services stopped"
EOF

    chmod +x stop_azora_mint_mine.sh

    print_success "Startup scripts created"
}

# Main setup function
main() {
    print_status "Starting AZORA Mint-Mine Integration setup..."

    check_prerequisites
    setup_python_env
    setup_node_env
    setup_database
    deploy_contracts
    setup_wallet
    setup_mining_config
    create_env_config
    setup_monitoring
    create_services
    create_startup_scripts

    print_success "AZORA Mint-Mine Integration setup completed!"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Start the system: ./start_azora_mint_mine.sh"
    echo "2. Access dashboard: http://localhost:5000"
    echo "3. Monitor logs: tail -f logs/*.log"
    echo ""
    echo "📚 Configuration files:"
    echo "   - .env (environment variables)"
    echo "   - config/mining_pools.json (mining configuration)"
    echo "   - config/wallets.json (wallet configuration)"
    echo "   - secrets/ (secure wallet keys)"
    echo ""
    echo "🔧 Services:"
    if [ -f "/etc/systemd/system/azora-mining-engine.service" ]; then
        echo "   - systemctl start azora-mining-engine"
        echo "   - systemctl start azora-dashboard"
    fi
}

# Run main function
main "$@"
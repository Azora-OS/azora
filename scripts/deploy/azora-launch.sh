#!/bin/bash
# azora-launch.sh - One-command planetary ignition for Azora OS
# Run with: bash azora-launch.sh

set -e  # Exit on any error

echo "🌌 Igniting Azora OS..."

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "❌ Install Docker first, sensei."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ Node.js 22+ required."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js not found."; exit 1; }

NODE_VERSION=$(node --version | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo "❌ Node.js version $NODE_VERSION detected. Need 22+."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Environment setup
if [ ! -f ".env.local" ]; then
    echo "📋 Setting up environment..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "⚠️  Please configure .env.local with your API keys and settings"
    else
        echo "⚠️  No .env.example found. Creating basic .env.local..."
        cat > .env.local << EOF
# Azora OS Environment Configuration
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://azora:azora@localhost:5432/azora_os

# Redis
REDIS_URL=redis://localhost:6379

# API Keys (Configure these!)
OPENAI_API_KEY=your_openai_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
SENTRY_DSN=your_sentry_dsn_here
GOOGLE_API_KEY=your_google_api_key

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Other services
LUNO_API_KEY=your_luno_key
LUNO_SECRET=your_luno_secret
EOF
    fi
fi

# Start infrastructure
echo "🐳 Starting infrastructure..."
docker-compose up -d postgres redis
echo "⏳ Waiting for databases to be ready..."
sleep 10

# Initialize databases if script exists
if npm run | grep -q "db:init"; then
    echo "🗄️  Initializing databases..."
    npm run db:init
else
    echo "⚠️  No db:init script found. Using in-memory database for testing."
fi

# Build all services
echo "🔨 Building Azora OS services..."
npm run build &
BUILD_PID=$!
echo "✅ Build started in background (PID: $BUILD_PID)"

# Launch services in background
echo "🚀 Launching planetary services..."

# Start the main backend server (includes all services)
echo "🔧 Starting Azora Backend Server..."
node server.js &
SERVER_PID=$!
echo "✅ Backend Server started (PID: $SERVER_PID)"

# Start the Next.js frontend in dev mode
echo "🌐 Starting Azora Frontend (Dev Mode)..."
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"

# Wait for build to complete
echo "⏳ Waiting for build to complete..."
wait $BUILD_PID
echo "✅ Build completed successfully"

# Wait a bit more for services to fully initialize
echo "⏳ Allowing services to fully initialize..."
sleep 5

# Health check
echo "🔍 System Pulse Check:"
echo ""

# Function to check service health
check_service() {
    local url=$1
    local name=$2
    if curl -s --max-time 5 "$url" > /dev/null; then
        echo "✅ $name: Online"
    else
        echo "❌ $name: Offline (check logs)"
    fi
}

check_service "http://localhost:3002" "Azora Frontend"
check_service "http://localhost:3001/health" "Azora Backend API"
check_service "http://localhost:3001/api/withdrawals" "Withdrawal System"

echo ""
echo "🌟 Azora OS Planetary Ignition Complete!"
echo "🌐 Frontend Portal: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo "💰 Withdrawal System: http://localhost:3001/api/withdraw/azr-to-google-wallet"
echo ""
echo "📊 To monitor: docker-compose logs -f"
echo "🛑 To stop: docker-compose down && kill $SERVER_PID $FRONTEND_PID"
echo ""
echo "🌌 Command the stars, architect. The knowledge economy awaits."

echo ""
echo "🌟 Azora OS Planetary Ignition Complete!"
echo "🌐 Frontend Portal: http://localhost:3000"
echo "🏰 Aegis Citadel: http://localhost:4099"
echo "🎓 Azora Sapiens: http://localhost:4200"
echo "💰 Azora Mint: http://localhost:4300"
echo "🔮 Azora Oracle: http://localhost:4030"
echo ""
echo "📊 To monitor: docker-compose logs -f"
echo "🛑 To stop: docker-compose down && kill $CITadel_PID $SAPIENS_PID $MINT_PID $ORACLE_PID"
echo ""
echo "🌌 Command the stars, architect. The knowledge economy awaits."
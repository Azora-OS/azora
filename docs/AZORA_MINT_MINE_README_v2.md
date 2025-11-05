# AZORA Mint-Mine Integration Engine v2.0

> Advanced cryptocurrency mining and AZR token minting system with real blockchain integration, external APIs, and comprehensive monitoring.

## 🚀 Overview

The AZORA Mint-Mine Integration Engine v2.0 is a sophisticated system that automatically mines profitable cryptocurrencies and converts earnings into AZR tokens on the Azora blockchain. This enhanced version includes:

- **Real Blockchain Integration**: Full Web3 connectivity with gas management and transaction monitoring
- **External Mining Pool APIs**: Real-time earnings tracking from multiple mining pools
- **PostgreSQL Database**: Persistent data storage with analytics and reporting
- **Advanced Monitoring**: Comprehensive system health monitoring and alerting
- **Price Oracles**: Real-time cryptocurrency price feeds for optimal mining decisions
- **Enhanced Security**: Multi-signature support and comprehensive audit trails

## 📊 Key Features

### Mining Optimization
- **Quantum-Inspired Algorithms**: Advanced profitability calculations using parallel processing
- **Multi-Pool Support**: Automatic switching between mining pools for maximum profitability
- **Real-Time Earnings**: Live tracking of mining earnings with automatic AZR conversion
- **IRON Mining Focus**: Optimized for FishHash algorithm with 6300% profitability improvement

### Token Minting
- **Smart Contract Integration**: Direct minting on Azora Chain with AzoraCoin (AZR) contract
- **Automatic Conversion**: 1:1 USD to AZR conversion rate (1 AZR = $1.00 USD)
- **Gas Optimization**: Intelligent gas price management and transaction batching
- **Supply Management**: 1 million AZR token cap with controlled inflation

### Advanced Analytics
- **Real-Time Dashboard**: Web-based monitoring with charts and system status
- **Database Persistence**: Complete transaction history and performance metrics
- **API Integration**: RESTful APIs for external system integration
- **Alert System**: Configurable notifications for system events and anomalies

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mining Pools  │────│  Mining Engine   │────│  Price Oracles  │
│   (WoolyPooly,  │    │  (Python/Web3)   │    │  (CoinGecko)    │
│    FlexPool)    │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────────────┐
                    │   Azora Chain      │
                    │   (AZR Contract)   │
                    └────────────────────┘
                             │
                    ┌────────────────────┐
                    │  PostgreSQL DB     │
                    │  (Analytics)       │
                    └────────────────────┘
                             │
                    ┌────────────────────┐
                    │   Web Dashboard    │
                    │   (Flask/React)    │
                    └────────────────────┘
```

## 🛠️ Installation

### Prerequisites

- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **PostgreSQL 12+**
- **Docker** (optional, for containerized deployment)
- **Git** for cloning repositories

### Quick Setup

1. **Clone and Setup**:
```bash
git clone <repository-url>
cd azora-os
chmod +x setup_azora_mint_mine_v2.sh
./setup_azora_mint_mine_v2.sh
```

2. **Configure Environment**:
```bash
# Edit .env file with your settings
nano .env
```

3. **Start the System**:
```bash
./start_azora_mint_mine.sh
```

4. **Access Dashboard**:
```
http://localhost:5000
```

## ⚙️ Configuration

### Environment Variables (.env)

```bash
# Azora Chain Configuration
AZORA_RPC_URL=http://localhost:8545
AZORA_CHAIN_ID=1337
AZR_CONTRACT_ADDRESS=0x...

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=azora_os
DB_USER=azora
DB_PASSWORD=your_password

# Mining Configuration
MINING_ALGORITHM=FishHash
MINING_COIN=IRON
HASH_RATE_MHS=42.0
CONVERSION_RATE=1.0

# Security & Monitoring
ALERT_WEBHOOK=https://hooks.slack.com/...
LOG_LEVEL=INFO
```

### Mining Pools Configuration (config/mining_pools.json)

```json
{
    "pools": [
        {
            "name": "WoolyPooly IRON",
            "algorithm": "FishHash",
            "url": "iron.woolypooly.com",
            "port": 3104,
            "priority": 1,
            "active": true
        }
    ],
    "algorithm": "FishHash",
    "coin": "IRON",
    "hashrate_mhs": 42.0,
    "conversion_rate": 1.0
}
```

## 🚀 Usage

### Starting the System

```bash
# Start all services
./start_azora_mint_mine.sh

# Or start individual components
python3 azora_mint_mine_engine_v2.py &
python3 azora-mint-mine-dashboard.py &
```

### Using the Dashboard

The web dashboard provides:

- **Real-time Statistics**: Mining earnings, AZR minted, system health
- **Interactive Charts**: Earnings over time, AZR minting trends
- **Control Panel**: Start/stop mining, refresh data, export reports
- **System Monitoring**: Component health, blockchain status, API connectivity

### API Endpoints

```bash
# Get system statistics
GET /api/stats

# Get system health
GET /api/health

# Control mining
POST /api/control/start-mining
POST /api/control/stop-mining

# Export data
GET /api/export
```

## 🔧 Advanced Configuration

### Smart Contract Deployment

Deploy the AZR contract to Azora Chain:

```bash
# Using Hardhat
npx hardhat run scripts/deploy-contracts.js --network azora

# Or manually
node scripts/deploy-contracts.js
```

### Database Management

```bash
# Initialize database
psql -d azora_os -f database/schema.sql

# Backup data
pg_dump azora_os > backup.sql

# Restore data
psql azora_os < backup.sql
```

### Monitoring Setup

```bash
# Setup log rotation
sudo cp monitoring/logrotate.conf /etc/logrotate.d/azora

# Setup systemd services (Linux)
sudo cp systemd/azora-*.service /etc/systemd/system/
sudo systemctl enable azora-mining-engine
sudo systemctl enable azora-dashboard
```

## 📊 Monitoring & Analytics

### Key Metrics

- **Mining Performance**: Hashrate, earnings, pool efficiency
- **Token Minting**: AZR minted, transaction success rate, gas costs
- **System Health**: Component status, error rates, response times
- **Financial**: Total earnings, conversion rates, ROI calculations

### Alert Configuration

Configure alerts for:
- Mining interruptions
- Low hashrate warnings
- Transaction failures
- High gas prices
- System health issues

## 🔒 Security Features

### Wallet Security
- Encrypted private keys
- Multi-signature support (planned)
- Secure key generation
- Access control roles

### System Security
- Input validation
- SQL injection prevention
- XSS protection
- Rate limiting

### Audit Trail
- Complete transaction logging
- System event tracking
- User action recording
- Compliance reporting

## 🐛 Troubleshooting

### Common Issues

1. **Blockchain Connection Failed**
   - Check AZORA_RPC_URL in .env
   - Verify Azora Chain is running
   - Check network connectivity

2. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check DB_* environment variables
   - Ensure database exists

3. **Mining Not Starting**
   - Check mining pool configuration
   - Verify wallet addresses
   - Check mining software installation

4. **Contract Deployment Failed**
   - Ensure sufficient funds for gas
   - Check contract code for errors
   - Verify network configuration

### Logs and Debugging

```bash
# View application logs
tail -f /var/log/azora/mint_mine_engine.log

# View database logs
tail -f /var/log/postgresql/postgresql-*.log

# Enable debug logging
export LOG_LEVEL=DEBUG
./start_azora_mint_mine.sh
```

## 📈 Performance Optimization

### Mining Optimization
- **Algorithm Selection**: Automatic switching to most profitable algorithms
- **Pool Management**: Load balancing across multiple pools
- **Hardware Monitoring**: Temperature and power consumption tracking

### System Optimization
- **Database Indexing**: Optimized queries for real-time analytics
- **Caching**: Redis integration for frequently accessed data
- **Async Processing**: Non-blocking operations for better responsiveness

## 🤝 Integration

### External APIs
- **CoinGecko**: Price data and market information
- **Mining Pools**: Real-time mining statistics
- **Blockchain Explorers**: Transaction verification

### Webhooks
- **Alert Notifications**: Slack, Discord, email integration
- **Status Updates**: External monitoring systems
- **Event Triggers**: Custom automation workflows

## 📚 API Reference

### Mining Engine API

```python
from azora_mint_mine_engine_v2 import AzoraMintMineEngineV2

engine = AzoraMintMineEngineV2()

# Get system statistics
stats = engine.get_stats()

# Mint AZR tokens manually
success = engine.mint_azr_tokens(amount=100.0, reason="Manual minting")

# Check mining status
mining_active = engine.check_mining_status()
```

### Database Schema

Key tables:
- `mining_sessions`: Mining session data
- `minting_transactions`: AZR minting transactions
- `mining_statistics`: Real-time mining metrics
- `crypto_prices`: Price oracle data
- `system_health`: Component health status

## 🧪 Testing

### Unit Tests

```bash
# Run Python tests
python3 -m pytest tests/

# Run contract tests
npx hardhat test
```

### Integration Tests

```bash
# Test full system
./run_integration_tests.sh

# Test blockchain integration
./test_blockchain_integration.sh
```

## 📝 Changelog

### v2.0.0 (Current)
- Complete rewrite with real blockchain integration
- PostgreSQL database persistence
- Advanced monitoring and alerting
- External API integrations
- Enhanced security features

### v1.0.0
- Initial mining and minting integration
- Basic dashboard functionality
- File-based data storage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: See docs/ directory
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@azora-os.com

---

**AZORA OS** - Revolutionizing cryptocurrency mining and token economics through intelligent automation and blockchain integration.
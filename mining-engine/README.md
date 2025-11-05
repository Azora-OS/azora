# Azora AI Mining Engine

The most advanced AI-powered cryptocurrency mining engine with parallel processing, real-time optimization, and quantum-inspired algorithms for maximum profitability.

## 🚀 NEW: Autonomous 365-Day Operation

**Latest Enhancement**: The mining engine now runs autonomously for 365 days with free electricity optimization and cloud GPU auto-scaling.

### Quick Autonomous Start

```bash
# Start 365-day autonomous mining
./start_autonomous.sh

# Check status and earnings
./check_status.sh
```

**Key Features:**
- ✅ **365-Day Continuous Operation**: No manual intervention required
- ✅ **Free Electricity Optimization**: Assumes $0.00/kWh costs
- ✅ **Cloud GPU Auto-Scaling**: AWS, GCP, Vast.ai integration
- ✅ **AI Coin Switching**: Real-time profitability optimization
- ✅ **Daily Reports**: Automated earnings and performance logs

**Current Earnings (Free Electricity):**
- Local RTX 3060: **$2.70/day** ($985/year)
- Cloud GPUs: Currently unprofitable (monitoring for opportunities)

## 🚀 Features

- **AI-Driven Coin Selection**: Machine learning algorithms predict and switch to the most profitable coins
- **Parallel Node Management**: Coordinate thousands of mining rigs across multiple locations
- **Real-Time Optimization**: Continuous monitoring and adjustment based on market conditions
- **Energy Optimization**: Minimize power consumption while maximizing hash rate
- **Advanced Analytics**: Prometheus + Grafana monitoring with custom dashboards
- **Auto-Scaling**: Dynamic node allocation based on profitability
- **Multi-Algorithm Support**: Ethash, SHA256, RandomX, KawPow, and more
- **Pool Failover**: Automatic switching between mining pools
- **Hardware Monitoring**: Temperature, power consumption, and efficiency tracking

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dashboard     │    │  Orchestrator   │    │   Optimizer     │
│   (Web UI)      │◄──►│   (Control)     │◄──►│   (AI Engine)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Miner Agents  │    │     Redis       │    │  PostgreSQL     │
│   (Edge Nodes)  │◄──►│   (Cache)       │    │   (Storage)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Mining Pools    │    │   Exchanges     │    │   Wallets       │
│ (Stratum)       │    │   (APIs)        │    │   (Cold/Hot)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Quick Start

### Autonomous Operation (Recommended)

```bash
# 1. Configure cloud credentials (optional)
nano config.ini

# 2. Start autonomous mining
./start_autonomous.sh

# 3. Monitor progress
./check_status.sh
```

### Manual Operation

```bash
cd mining-engine
pip install -r requirements.txt

# Start with Docker Compose (recommended)
docker-compose up -d

# Or run individually
redis-server &
python orchestrator/main.py &
python dashboard/app.py &
```

### Access Interfaces

- **Main Dashboard**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **Autonomous Logs**: `/tmp/azr_mining_engine.log`
- **Earnings Data**: `/tmp/azr_earnings.json`

## 🎯 AI Optimization Engine

### Coin Selection Algorithm

The AI engine uses multiple strategies:

1. **Rule-Based**: Profit = Revenue - Energy Cost - Pool Fees
2. **Machine Learning**: Random Forest regression on historical data
3. **Reinforcement Learning**: Contextual bandits for exploration/exploitation
4. **Time-Series Forecasting**: Predict price movements and difficulty changes

### Profitability Calculation

```
Expected_Revenue = (HashRate × 86400 ÷ Difficulty) × BlockReward × CoinPrice
Energy_Cost = (PowerConsumption ÷ 1000) × 24 × ElectricityPrice
Net_Profit = Expected_Revenue - Energy_Cost - PoolFees
```

### Switching Logic

- **Hysteresis**: Only switch if new coin > current coin + margin
- **Cooldown**: Prevent rapid switching (hardware wear)
- **Thermal Limits**: Don't switch if temperature > threshold
- **Pool Health**: Switch pools if latency > 100ms or reject rate > 5%

## 📊 Monitoring & Analytics

### Metrics Collected

- Hash rate (MH/s, GH/s, TH/s)
- Power consumption (Watts)
- Temperature (°C)
- Efficiency (MH/J)
- Accepted/Rejected shares
- Pool latency (ms)
- Uptime percentage
- Coin profitability ($/day)

### Dashboards

- **Real-time Overview**: Current hash rates, profits, temperatures
- **Historical Trends**: 24h/7d/30d profitability charts
- **Node Health**: Hardware status, alerts, maintenance schedules
- **AZR Treasury**: Mining yield allocation and reinforcement tracking

## 🔧 Configuration

### Autonomous Operation Config

Edit `config.ini` for autonomous settings:

```ini
[GENERAL]
autonomous_days = 365
free_electricity = true
electricity_cost_kwh = 0.0

[CLOUD_GPUS]
aws_region = us-east-1
gcp_project = azora-mining
vast_api_key = YOUR_API_KEY

[MINING]
coin_priorities = ETH, BTC, RVN, ERG, CFX
min_profit_threshold = 0.001
```

### Orchestrator Config

```python
# orchestrator/config.py
ORCHESTRATOR_CONFIG = {
    'optimization_interval': 300,  # 5 minutes
    'switch_hysteresis': 0.05,     # 5% margin
    'max_switch_frequency': 3600,  # 1 hour cooldown
    'thermal_limit': 80,           # °C
    'electricity_price': 0.12,     # $/kWh (0.0 for free)
}
```

### Coin Configurations

```python
COIN_CONFIGS = {
    'ETH': {
        'algorithm': 'ethash',
        'pools': ['ethermine.org', 'sparkpool.com'],
        'wallet': '0x...',
        'min_profit_margin': 0.1
    },
    'BTC': {
        'algorithm': 'sha256',
        'pools': ['slushpool.com', 'antpool.com'],
        'wallet': 'bc1...',
        'min_profit_margin': 0.05
    }
}
```

## 🚀 Deployment Options

### Free Tier (Development)

- **Fly.io**: Orchestrator + Dashboard
- **Railway**: Database + Redis
- **Render**: Monitoring stack
- **Local Hardware**: Mining rigs

### Production Scale

- **Kubernetes**: Multi-node orchestration
- **AWS/GCP**: Cloud mining fleet
- **Bare Metal**: Dedicated mining farm
- **Edge Computing**: Distributed across global locations

## 🔒 Security

- **Secrets Management**: HashiCorp Vault or AWS Secrets Manager
- **Network Security**: WireGuard VPN mesh
- **Access Control**: OAuth2 + RBAC
- **Audit Logging**: Immutable event logs
- **Cold Storage**: Hardware wallets for treasury

## 📈 Performance Optimization

### Hardware Optimization

- **Undervolting**: Reduce power while maintaining hash rate
- **Clock Tuning**: Optimize GPU/CPU frequencies
- **Memory Timing**: Improve efficiency on memory-bound algorithms
- **Thermal Management**: Active cooling optimization

### Software Optimization

- **Parallel Processing**: Multi-GPU coordination
- **Memory Pooling**: Efficient memory allocation
- **Async Operations**: Non-blocking I/O
- **Caching**: Redis for hot data

## 🎯 AZR Integration

### Treasury Reinforcement

1. **Yield Collection**: Aggregate mined coins from all nodes
2. **Conversion**: Swap to stablecoins via DEXes
3. **Liquidity**: Add to AZR liquidity pools
4. **Rewards**: Distribute to AZR holders
5. **Burn/Mint**: Protocol-controlled supply adjustments

### Ceremonial Events

- **Quantum Alignment**: Special mining events for AZR rituals
- **Yield Ceremonies**: Public burn events with mining yield
- **Node Blessings**: New rig activation ceremonies

## 🧪 Testing

```bash
# Run unit tests
pytest tests/

# Integration tests
python -m pytest tests/integration/

# Load testing
locust -f tests/load/locustfile.py
```

## 📚 API Reference

### Orchestrator API

- `GET /nodes` - List all mining nodes
- `POST /nodes/{id}/register` - Register new node
- `POST /optimize` - Trigger AI optimization
- `GET /coins` - Get coin configurations

### Miner Agent API

- `POST /telemetry` - Report node status
- `GET /commands` - Check for pending commands
- `POST /switch/{coin}` - Switch mining coin

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## ⚠️ Disclaimer

Cryptocurrency mining involves financial risk. This software is for educational and research purposes. Always verify profitability calculations and monitor hardware temperatures to prevent damage.

---

**Ready to mine with AI? Start with `docker-compose up` and watch your profits soar! 🚀⛏️**
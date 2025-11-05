# AZR Ultra Mining Dashboard

A beautiful web dashboard for monitoring your AZR ultra mining engine, balance, and cryptocurrency prices.

## Features

- **Real-time Balance**: Live AZR token and USD balance updates
- **Mining Status**: Current algorithm, hashrate, and uptime monitoring
- **Crypto Prices**: Live prices for ERG, CFX, RVN, and ETH
- **Performance Metrics**: Hardware optimization status and projections
- **Auto-refresh**: Updates every 30 seconds automatically

## Quick Start

### 1. Start the Dashboard

```bash
cd /workspaces/azora-os/mining-engine
./start_dashboard.sh
```

Or manually:
```bash
pip3 install -r requirements-dashboard.txt
python3 dashboard.py
```

### 2. Open Dashboard

Open your browser to: **http://localhost:5000**

### 3. Check Balance (Terminal)

```bash
./check_balance.sh
```

## Dashboard Features

### Balance Card
- Current AZR token balance
- USD equivalent value
- Monthly and yearly projections

### Mining Status Card
- Live mining status (Active/Inactive)
- Current mining algorithm (ERG, CFX, RVN, ETH)
- Hashrate display
- Uptime tracking

### Crypto Prices Card
- Real-time prices from CoinGecko API
- ERG (Ergo), CFX (Conflux), RVN (Ravencoin), ETH (Ethereum)

### Performance Card
- 13.4x optimization boost
- 8-thread hyperthreading utilization
- 3.9GHz turbo boost
- DDR4-3200 memory bandwidth

## API Endpoints

- `GET /` - Main dashboard page
- `GET /api/data` - JSON API for real-time data

## Requirements

- Python 3.7+
- Flask
- requests

## Files

- `dashboard.py` - Main dashboard application
- `requirements-dashboard.txt` - Python dependencies
- `start_dashboard.sh` - Startup script
- `check_balance.sh` - Quick balance check script

## Ultra Mining Engine Integration

The dashboard automatically reads from:
- `/tmp/ultra_mining_earnings.json` - Balance and mining data
- CoinGecko API - Live cryptocurrency prices

## Troubleshooting

**Dashboard not loading?**
- Ensure mining engine is running: `./start_ultra_mining.sh`
- Check if port 5000 is available
- Install dependencies: `pip3 install -r requirements-dashboard.txt`

**No balance data?**
- Start mining: `./start_ultra_mining.sh`
- Check earnings file: `ls -la /tmp/ultra_mining_earnings.json`

**Prices not updating?**
- Check internet connection
- CoinGecko API may be rate-limited (fallback prices will be used)
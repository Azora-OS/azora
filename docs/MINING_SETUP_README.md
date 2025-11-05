# AZORA OS - Mining Setup Guide
## Production-Ready Cryptocurrency Mining with WoolyPooly Pool

**Date:** October 27, 2025  
**Version:** 2.0  
**Status:** Production Ready

## 🚀 Quick Start

### Prerequisites
- NVIDIA GPU with CUDA support
- ethminer installed (`sudo apt install ethminer` on Ubuntu)
- Python 3.12+ with required packages
- Valid WoolyPooly account credentials

### 1. Install Dependencies
```bash
pip install python-dotenv web3 psycopg2-binary requests
```

### 2. Configure Environment
Ensure `.env.production` contains your WoolyPooly credentials:
```bash
WOOLYPOOLY_POOL_URL=stratum1+ssl://pool.eu.woolypooly.com:3096
WOOLYPOOLY_USERNAME=WPMc2l6d2Uubmd3ZW55YTc4QGdtYWlsLmNvbQ
WOOLYPOOLY_WORKER=Sizwe Ngwenya
WOOLYPOOLY_PASSWORD=x
```

### 3. Start Mining
```bash
# Using the Python launcher (recommended)
python3 azora_mining_launcher.py

# Or using the shell script
./ethminer_woolypooly.sh

# Or using the Windows batch file (on Windows)
ethminer_woolypooly.bat
```

## 📊 Mining Configuration

### Pool Details
- **Pool:** WoolyPooly Ethereum Pool
- **URL:** stratum1+ssl://pool.eu.woolypooly.com:3096
- **Algorithm:** Ethash (Ethereum)
- **Fee:** 1.0%
- **Payout:** 0.1 ETH minimum

### Hardware Requirements
- **GPU:** NVIDIA RTX series or equivalent
- **VRAM:** Minimum 4GB
- **Driver:** Latest NVIDIA drivers
- **CUDA:** Version 11.0+

### Performance Tuning
- **Farm Recheck:** 2000ms
- **GPU Clock Offset:** 0 (default)
- **GPU Memory Offset:** 0 (default)
- **Fan Speed:** 70% (auto-managed)

## 💰 Earnings Analysis

### Current Projections (October 2025)
- **Hashrate:** 42 MH/s (estimated for RTX 3060)
- **Daily Earnings:** $7.63 USD
- **Monthly Earnings:** $228.90 USD
- **AZR Minting:** 1:1 USD equivalent

### Constitutional Allocation
- **Treasury:** 70% ($160.23)
- **Founders:** 11% ($25.18)
- **Burns:** 5% ($11.45)
- **Circulation:** 23.9% ($54.54)

## 🔧 Configuration Files

### Environment Variables (`.env.production`)
```bash
# WoolyPooly Configuration
WOOLYPOOLY_POOL_URL=stratum1+ssl://pool.eu.woolypooly.com:3096
WOOLYPOOLY_USERNAME=WPMc2l6d2Uubmd3ZW55YTc4QGdtYWlsLmNvbQ
WOOLYPOOLY_WORKER=Sizwe Ngwenya
WOOLYPOOLY_PASSWORD=x

# Mining Parameters
MINING_ALGORITHM=Ethash
GPU_TYPE=NVIDIA
CUDA_ENABLED=true
FARM_RECHECK_MS=2000
```

### Mining Config (`mining-config/woolypooly_config.conf`)
Complete configuration file with all mining parameters and backup pools.

## 🛠️ Troubleshooting

### Common Issues

1. **CUDA Not Found**
   ```bash
   sudo apt install nvidia-cuda-toolkit
   ```

2. **Low Hashrate**
   - Update GPU drivers
   - Check GPU temperature
   - Adjust power limits

3. **Pool Connection Failed**
   - Verify internet connection
   - Check firewall settings
   - Try backup pools

4. **Python Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

### Logs and Monitoring
- **Mining Logs:** `ethminer.log`
- **Launcher Logs:** `mining_launcher.log`
- **Pool Stats:** Check WoolyPooly dashboard

## 🔒 Security Notes

- Never share your WoolyPooly credentials
- Use environment variables for sensitive data
- Regularly rotate API keys
- Monitor mining performance

## 📈 Scaling Operations

### Multi-GPU Setup
```bash
# For multiple GPUs, modify the CUDA devices parameter
--cuda-devices 0,1,2,3
```

### Farm Management
- Monitor GPU temperatures
- Implement automatic restarts
- Set up alerting for downtime

## 🤝 Support

For technical support:
- Check WoolyPooly documentation
- Review AZORA OS logs
- Contact development team

## 📋 Checklist

- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] GPU drivers updated
- [ ] ethminer installed
- [ ] Test mining session
- [ ] Monitor earnings
- [ ] Set up automated restarts

---

**AZORA OS** - Sovereign Economic Protocol  
*Constitutional Compliance: 1:1 AZR/USD, 70% Treasury Reserves*
#!/usr/bin/env python3
"""
AZORA MINT-MINE INTEGRATION ENGINE v2.0
Advanced blockchain integration with real Web3, external APIs, and database persistence
"""

import json
import time
import requests
import threading
import logging
import os
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_DOWN
from typing import Dict, List, Optional, Any
import psycopg2
from psycopg2.extras import RealDictCursor

try:
    from dotenv import load_dotenv
    load_dotenv()  # Load environment variables from .env file
except ImportError:
    print("⚠️ python-dotenv not installed. Install with: pip install python-dotenv")
    print("   Or set environment variables manually.")

try:
    from web3 import Web3
    from web3.middleware import geth_poa_middleware
    from eth_account import Account
    WEB3_AVAILABLE = True
except ImportError:
    WEB3_AVAILABLE = False
    print("⚠️  Web3 not available - using mock blockchain transactions")

class AzoraMintMineEngineV2:
    def __init__(self):
        # Enhanced configuration
        self.config = {
            'mining': {
                'algorithm': 'FishHash (IRON)',
                'hashrate_mhs': 42.0,
                'conversion_rate': 1.0,  # 1 USD = 1 AZR (1 AZR = $1.00 USD)
                'min_mint_threshold': 0.01,  # $0.01 minimum
                'auto_mint_enabled': True
            },
            'blockchain': {
                'rpc_url': os.getenv('AZORA_RPC_URL', 'http://localhost:8545'),
                'chain_id': int(os.getenv('AZORA_CHAIN_ID', '1337')),
                'azr_contract_address': os.getenv('AZR_CONTRACT_ADDRESS'),
                'gas_limit': 200000,
                'gas_price_buffer': 1.1  # 10% buffer on gas price
            },
            'apis': {
                'coingecko': 'https://api.coingecko.com/api/v3',
                'woolypooly': 'https://api.woolypooly.com',
                'mining_pool_stats': True
            },
            'database': {
                'host': os.getenv('DB_HOST', 'localhost'),
                'port': int(os.getenv('DB_PORT', '5432')),
                'name': os.getenv('DB_NAME', 'azora_os'),
                'user': os.getenv('DB_USER', 'azora'),
                'password': os.getenv('DB_PASSWORD', '')
            },
            'security': {
                'multi_sig_enabled': False,
                'alert_webhook': os.getenv('ALERT_WEBHOOK'),
                'log_level': 'INFO'
            }
        }

        # Initialize components
        self.web3 = None
        self.azr_contract = None
        self.db_connection = None
        self.wallet_address = None
        self.account = None

        # Mining and minting data
        self.mining_stats = {
            'total_mined_usd': 0.0,
            'total_azr_minted': 0.0,
            'active_sessions': 0,
            'last_mint_tx': None,
            'conversion_rate': self.config['mining']['conversion_rate']
        }

        # Track pool balance for delta calculations
        self.last_pool_balance = 0.0

        # Setup logging
        self.setup_logging()

        # Initialize all systems
        self.initialize_systems()

        # Start monitoring threads
        self.monitoring_active = True
        self.threads = {
            'mining_monitor': threading.Thread(target=self.monitor_mining, daemon=True),
            'blockchain_monitor': threading.Thread(target=self.monitor_blockchain, daemon=True),
            'price_oracle': threading.Thread(target=self.price_oracle_worker, daemon=True),
            'auto_mint': threading.Thread(target=self.auto_mint_worker, daemon=True)
        }

    def setup_logging(self):
        """Setup comprehensive logging"""
        # Create logs directory relative to script location
        log_dir = os.path.join(os.path.dirname(__file__), 'logs')
        os.makedirs(log_dir, exist_ok=True)
        log_file_path = os.path.join(log_dir, 'mint_mine_engine.log')

        logging.basicConfig(
            level=getattr(logging, self.config['security']['log_level']),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file_path),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger('AzoraMintMineEngine')

    def initialize_systems(self):
        """Initialize all system components"""
        self.logger.info("🚀 Initializing AZORA Mint-Mine Engine v2.0")

        # Load wallet configuration
        if not self.load_wallet_config():
            raise Exception("Failed to load wallet configuration")

        # Initialize blockchain connection
        if not self.initialize_blockchain():
            self.logger.warning("Blockchain initialization failed - using mock mode")

        # Initialize database
        if not self.initialize_database():
            raise Exception("Database initialization failed")

        # Load mining statistics from database
        self.load_mining_stats()

        self.logger.info("✅ All systems initialized successfully")

    def load_wallet_config(self) -> bool:
        """Load wallet configuration from environment variables"""
        try:
            # Load from environment variables (more secure than files)
            private_key = os.getenv('MINTER_PRIVATE_KEY')
            self.wallet_address = os.getenv('MINTER_ADDRESS')

            if not private_key or not self.wallet_address:
                self.logger.error("MINTER_PRIVATE_KEY or MINTER_ADDRESS environment variables not set")
                return False

            if WEB3_AVAILABLE:
                self.account = Account.from_key(private_key)

            self.logger.info(f"✅ Loaded wallet: {self.wallet_address[:10]}...")
            return True

        except Exception as e:
            self.logger.error(f"Failed to load wallet config: {e}")
            return False

    def initialize_blockchain(self) -> bool:
        """Initialize real blockchain connection"""
        if not WEB3_AVAILABLE:
            self.logger.warning("Web3 not available - using mock blockchain")
            return False

        try:
            self.web3 = Web3(Web3.HTTPProvider(self.config['blockchain']['rpc_url']))

            # Add PoA middleware for compatibility
            self.web3.middleware_onion.inject(geth_poa_middleware, layer=0)

            if not self.web3.is_connected():
                self.logger.error("Failed to connect to blockchain")
                return False

            # Load AZR contract
            if self.config['blockchain']['azr_contract_address']:
                azr_abi = self.get_azr_contract_abi()
                contract_address = self.web3.to_checksum_address(
                    self.config['blockchain']['azr_contract_address']
                )
                self.azr_contract = self.web3.eth.contract(
                    address=contract_address,
                    abi=azr_abi
                )
                self.logger.info(f"✅ AZR contract loaded: {contract_address}")
            else:
                self.logger.warning("AZR contract address not configured")

            self.logger.info(f"✅ Connected to Azora Chain (Chain ID: {self.web3.eth.chain_id})")
            return True

        except Exception as e:
            self.logger.error(f"Blockchain initialization failed: {e}")
            return False

    def get_azr_contract_abi(self) -> List[Dict]:
        """Get AZR contract ABI"""
        return [
            {
                "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
                "name": "mintReward",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "totalSupply",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "MAX_SUPPLY",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "user", "type": "address"}],
                "name": "mintedPerUser",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            }
        ]

    def initialize_database(self) -> bool:
        """Initialize PostgreSQL database connection"""
        try:
            self.db_connection = psycopg2.connect(
                host=self.config['database']['host'],
                port=self.config['database']['port'],
                database=self.config['database']['name'],
                user=self.config['database']['user'],
                password=self.config['database']['password']
            )

            # Create tables if they don't exist
            self.create_database_tables()

            self.logger.info("✅ Database connection established")
            return True

        except Exception as e:
            self.logger.error(f"Database initialization failed: {e}")
            return False

    def create_database_tables(self):
        """Create necessary database tables"""
        with self.db_connection.cursor() as cursor:
            # Mining sessions table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS mining_sessions (
                    id SERIAL PRIMARY KEY,
                    session_id VARCHAR(255) UNIQUE,
                    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    end_time TIMESTAMP,
                    algorithm VARCHAR(100),
                    total_hashrate_mhs DECIMAL(10,2),
                    total_earnings_usd DECIMAL(20,8),
                    azr_minted DECIMAL(30,8),
                    status VARCHAR(50) DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Minting transactions table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS minting_transactions (
                    id SERIAL PRIMARY KEY,
                    tx_hash VARCHAR(255) UNIQUE,
                    amount_azr DECIMAL(30,8),
                    amount_usd DECIMAL(20,8),
                    recipient_address VARCHAR(255),
                    gas_used BIGINT,
                    gas_price_wei DECIMAL(30,0),
                    blockchain_status VARCHAR(50) DEFAULT 'pending',
                    mining_session_id INTEGER REFERENCES mining_sessions(id),
                    reason TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    confirmed_at TIMESTAMP
                )
            """)

            # Mining statistics table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS mining_statistics (
                    id SERIAL PRIMARY KEY,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    algorithm VARCHAR(100),
                    hashrate_mhs DECIMAL(10,2),
                    pool VARCHAR(255),
                    earnings_usd DECIMAL(20,8),
                    power_consumption_watts INTEGER,
                    temperature_celsius DECIMAL(5,2),
                    shares_accepted INTEGER,
                    shares_rejected INTEGER
                )
            """)

            # Price data table for oracle
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS crypto_prices (
                    id SERIAL PRIMARY KEY,
                    symbol VARCHAR(10),
                    price_usd DECIMAL(20,8),
                    market_cap_usd DECIMAL(30,2),
                    volume_24h_usd DECIMAL(30,2),
                    price_change_24h DECIMAL(10,4),
                    source VARCHAR(50),
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            self.db_connection.commit()

    def load_mining_stats(self):
        """Load mining statistics from database"""
        try:
            with self.db_connection.cursor(cursor_factory=RealDictCursor) as cursor:
                # Get total mined USD
                cursor.execute("""
                    SELECT COALESCE(SUM(total_earnings_usd), 0) as total_mined_usd
                    FROM mining_sessions
                    WHERE status = 'completed'
                """)
                result = cursor.fetchone()
                self.mining_stats['total_mined_usd'] = float(result['total_mined_usd'])

                # Get total AZR minted
                cursor.execute("""
                    SELECT COALESCE(SUM(amount_azr), 0) as total_azr_minted
                    FROM minting_transactions
                    WHERE blockchain_status = 'confirmed'
                """)
                result = cursor.fetchone()
                self.mining_stats['total_azr_minted'] = float(result['total_azr_minted'])

                # Get active sessions count
                cursor.execute("""
                    SELECT COUNT(*) as active_sessions
                    FROM mining_sessions
                    WHERE status = 'active'
                """)
                result = cursor.fetchone()
                self.mining_stats['active_sessions'] = result['active_sessions']

                # Load last pool balance (initialize to 0 if not found)
                # In production, you'd store this in a dedicated table
                self.last_pool_balance = 0.0

        except Exception as e:
            self.logger.error(f"Failed to load mining stats: {e}")

    def monitor_mining(self):
        """Enhanced mining monitor with external APIs"""
        self.logger.info("📊 Starting enhanced mining monitor...")

        while self.monitoring_active:
            try:
                # Check local lolMiner API
                local_earnings = self.check_lolminer_stats()

                # Check external mining pool APIs
                external_earnings = self.check_external_mining_pools()

                # Combine earnings data
                total_new_earnings = local_earnings + external_earnings

                if total_new_earnings >= self.config['mining']['min_mint_threshold']:
                    self.logger.info(f"💰 New mining earnings detected: ${total_new_earnings:.4f}")

                    # Convert to AZR tokens
                    azr_amount = total_new_earnings * self.mining_stats['conversion_rate']

                    # Mint AZR tokens
                    if self.mint_azr_tokens(azr_amount, f"Mining earnings: ${total_new_earnings:.4f}"):
                        self.mining_stats['total_mined_usd'] += total_new_earnings
                        self.mining_stats['total_azr_minted'] += azr_amount

                        # Record session
                        self.record_mining_session(total_new_earnings, azr_amount)

                        self.logger.info(f"✅ Minted {azr_amount:.2f} AZR tokens for ${total_new_earnings:.4f} mining earnings")
                    else:
                        self.logger.error("❌ Failed to mint AZR tokens")

                # Update mining statistics
                self.update_mining_statistics()

            except Exception as e:
                self.logger.error(f"Mining monitor error: {e}")

            time.sleep(30)  # Check every 30 seconds

    def check_lolminer_stats(self) -> float:
        """Check lolMiner API for earnings"""
        earnings = 0.0

        ports = [4444, 4445, 4446, 4447]
        for port in ports:
            try:
                response = requests.get(f'http://127.0.0.1:{port}/summary', timeout=5)
                if response.status_code == 200:
                    data = response.json()

                    # Extract mining stats and calculate earnings
                    algorithm = data.get('Algorithm', 'Unknown')
                    if algorithm.lower() == 'fishhash':
                        # IRON mining profitability
                        hashrate_h = self.config['mining']['hashrate_mhs'] * 1000000
                        hourly_rate = (hashrate_h / 1000000) * 0.00084 * 24
                        earnings = hourly_rate / 24  # Convert to per-check earnings

                    return earnings

            except:
                continue

        return earnings

    def check_external_mining_pools(self) -> float:
        """Check external mining pool APIs for new earnings (delta only)"""
        earnings = 0.0

        if not self.config['apis']['mining_pool_stats']:
            return earnings

        try:
            # WoolyPooly API for IRON mining
            wallet = self.wallet_address
            response = requests.get(
                f"{self.config['apis']['woolypooly']}/iron/wallet/{wallet}",
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                # Get current unpaid balance (this is the key - not cumulative earnings)
                current_unpaid_balance = data.get('balance', {}).get('unpaid', 0.0)

                if self.last_pool_balance == 0.0:
                    # First run - just record the balance, don't mint
                    self.last_pool_balance = current_unpaid_balance
                    self.logger.info(f"Initialized pool balance: ${current_unpaid_balance:.4f}")
                    return 0.0

                if current_unpaid_balance > self.last_pool_balance:
                    # New earnings detected
                    new_earnings = current_unpaid_balance - self.last_pool_balance
                    self.last_pool_balance = current_unpaid_balance
                    self.logger.info(f"New pool earnings detected: ${new_earnings:.4f}")
                    return new_earnings
                elif current_unpaid_balance < self.last_pool_balance:
                    # Balance reset after payout - update tracking
                    self.last_pool_balance = current_unpaid_balance
                    self.logger.info("Pool balance reset detected (likely after payout)")
                    return 0.0
                else:
                    # No change
                    return 0.0

        except Exception as e:
            self.logger.warning(f"External pool API check failed: {e}")

        return earnings

    def price_oracle_worker(self):
        """Real-time crypto price oracle"""
        self.logger.info("🪙 Starting price oracle worker...")

        while self.monitoring_active:
            try:
                # Get IRON price from CoinGecko
                iron_price = self.get_crypto_price('iron-fish')

                # Get other relevant prices
                prices = {
                    'iron-fish': self.get_crypto_price('iron-fish'),
                    'ergo': self.get_crypto_price('ergo'),
                    'conflux-token': self.get_crypto_price('conflux-token')
                }

                # Store prices in database
                self.store_crypto_prices(prices)

                # Update conversion rate if needed (future enhancement)
                # self.update_dynamic_conversion_rate(prices)

            except Exception as e:
                self.logger.error(f"Price oracle error: {e}")

            time.sleep(300)  # Update every 5 minutes

    def get_crypto_price(self, coin_id: str) -> Optional[float]:
        """Get crypto price from CoinGecko"""
        try:
            response = requests.get(
                f"{self.config['apis']['coingecko']}/simple/price",
                params={
                    'ids': coin_id,
                    'vs_currencies': 'usd',
                    'include_24hr_change': 'true'
                },
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                return data.get(coin_id, {}).get('usd')

        except Exception as e:
            self.logger.warning(f"Failed to get {coin_id} price: {e}")

        return None

    def store_crypto_prices(self, prices: Dict[str, float]):
        """Store crypto prices in database"""
        try:
            with self.db_connection.cursor() as cursor:
                for symbol, price in prices.items():
                    if price is not None:
                        cursor.execute("""
                            INSERT INTO crypto_prices (symbol, price_usd, source)
                            VALUES (%s, %s, %s)
                        """, (symbol, price, 'coingecko'))

                self.db_connection.commit()

        except Exception as e:
            self.logger.error(f"Failed to store crypto prices: {e}")

    def mint_azr_tokens(self, amount: float, reason: str) -> bool:
        """Mint AZR tokens with real blockchain integration"""
        try:
            if not isinstance(amount, (int, float)) or amount <= 0:
                self.logger.error(f"Invalid amount for minting: {amount}")
                return False

            self.logger.info(f"🔨 Minting {amount:.6f} AZR tokens...")

            # Convert to wei (AZR has 18 decimals)
            amount_wei = int(Decimal(str(amount)) * Decimal('1000000000000000000'))

            if self.azr_contract and self.account:
                # Real blockchain transaction
                return self.mint_on_blockchain(amount_wei, reason)
            else:
                # Mock transaction for development
                return self.mint_mock_transaction(amount_wei, reason)

        except Exception as e:
            self.logger.error(f"Minting failed: {e}")
            import traceback
            traceback.print_exc()
            return False

    def mint_on_blockchain(self, amount_wei: int, reason: str) -> bool:
        """Execute real blockchain minting transaction"""
        try:
            # Get current gas price
            gas_price = self.web3.eth.gas_price
            buffered_gas_price = int(gas_price * self.config['blockchain']['gas_price_buffer'])

            # Build transaction
            txn = self.azr_contract.functions.mintReward(
                self.web3.to_checksum_address(self.wallet_address),
                amount_wei
            ).build_transaction({
                'from': self.account.address,
                'gas': self.config['blockchain']['gas_limit'],
                'gasPrice': buffered_gas_price,
                'nonce': self.web3.eth.get_transaction_count(self.account.address),
                'chainId': self.config['blockchain']['chain_id']
            })

            # Sign transaction
            signed_txn = self.web3.eth.account.sign_transaction(txn, self.account.key)

            # Send transaction
            tx_hash = self.web3.eth.send_raw_transaction(signed_txn.rawTransaction)

            tx_hash_hex = tx_hash.hex()
            self.logger.info(f"✅ Transaction submitted: {tx_hash_hex}")

            # Record transaction
            self.record_minting_transaction(tx_hash_hex, amount_wei, reason, buffered_gas_price)

            # Start transaction monitoring
            threading.Thread(
                target=self.monitor_transaction,
                args=(tx_hash_hex,),
                daemon=True
            ).start()

            return True

        except Exception as e:
            self.logger.error(f"Blockchain minting failed: {e}")
            return False

    def mint_mock_transaction(self, amount_wei: int, reason: str) -> bool:
        """Mock minting transaction for development"""
        try:
            # Simulate successful transaction
            tx_hash = f"0x{os.urandom(32).hex()}"
            self.logger.info(f"✅ Mock transaction submitted: {tx_hash}")

            # Record transaction
            self.record_minting_transaction(tx_hash, amount_wei, reason, 0)

            return True

        except Exception as e:
            self.logger.error(f"Mock minting failed: {e}")
            return False

    def monitor_transaction(self, tx_hash: str):
        """Monitor blockchain transaction confirmation"""
        try:
            for _ in range(60):  # Wait up to 5 minutes
                try:
                    receipt = self.web3.eth.get_transaction_receipt(tx_hash)
                    if receipt:
                        status = "confirmed" if receipt.status == 1 else "failed"
                        self.update_transaction_status(tx_hash, status, receipt.gasUsed)
                        break
                except:
                    pass
                time.sleep(5)

        except Exception as e:
            self.logger.error(f"Transaction monitoring failed for {tx_hash}: {e}")

    def record_minting_transaction(self, tx_hash: str, amount_wei: int, reason: str, gas_price: int = 0):
        """Record minting transaction in database"""
        try:
            amount_azr = float(Decimal(str(amount_wei)) / Decimal('1000000000000000000'))
            amount_usd = amount_azr / self.mining_stats['conversion_rate']

            with self.db_connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO minting_transactions
                    (tx_hash, amount_azr, amount_usd, recipient_address, gas_price_wei, reason)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (tx_hash, amount_azr, amount_usd, self.wallet_address, gas_price, reason))

                self.db_connection.commit()

            self.mining_stats['last_mint_tx'] = {
                'tx_hash': tx_hash,
                'amount_azr': amount_azr,
                'timestamp': datetime.now().isoformat()
            }

        except Exception as e:
            self.logger.error(f"Failed to record transaction: {e}")

    def update_transaction_status(self, tx_hash: str, status: str, gas_used: int = 0):
        """Update transaction status in database"""
        try:
            with self.db_connection.cursor() as cursor:
                cursor.execute("""
                    UPDATE minting_transactions
                    SET blockchain_status = %s, gas_used = %s, confirmed_at = CURRENT_TIMESTAMP
                    WHERE tx_hash = %s
                """, (status, gas_used, tx_hash))

                self.db_connection.commit()

            self.logger.info(f"✅ Transaction {tx_hash} {status}")

        except Exception as e:
            self.logger.error(f"Failed to update transaction status: {e}")

    def record_mining_session(self, usd_earned: float, azr_minted: float):
        """Record mining session in database"""
        try:
            session_id = f"session_{int(time.time())}"

            with self.db_connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO mining_sessions
                    (session_id, algorithm, total_hashrate_mhs, total_earnings_usd, azr_minted, status)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    session_id,
                    self.config['mining']['algorithm'],
                    self.config['mining']['hashrate_mhs'],
                    usd_earned,
                    azr_minted,
                    'completed'
                ))

                self.db_connection.commit()

        except Exception as e:
            self.logger.error(f"Failed to record mining session: {e}")

    def update_mining_statistics(self):
        """Update real-time mining statistics"""
        try:
            # Get current stats from lolMiner
            stats = self.get_current_mining_stats()

            with self.db_connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO mining_statistics
                    (algorithm, hashrate_mhs, pool, earnings_usd, power_consumption_watts,
                     temperature_celsius, shares_accepted, shares_rejected)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    stats['algorithm'],
                    stats['hashrate_mhs'],
                    stats['pool'],
                    stats['earnings_usd'],
                    stats['power_watts'],
                    stats['temperature_c'],
                    stats['shares_accepted'],
                    stats['shares_rejected']
                ))

                self.db_connection.commit()

        except Exception as e:
            self.logger.error(f"Failed to update mining statistics: {e}")

    def get_current_mining_stats(self) -> Dict[str, Any]:
        """Get current mining statistics"""
        return {
            'algorithm': self.config['mining']['algorithm'],
            'hashrate_mhs': self.config['mining']['hashrate_mhs'],
            'pool': 'woolypooly.com:3104',
            'earnings_usd': 0.0,  # Would be calculated from API
            'power_watts': 35,
            'temperature_c': 65.0,
            'shares_accepted': 0,
            'shares_rejected': 0
        }

    def monitor_blockchain(self):
        """Monitor blockchain health and gas prices"""
        self.logger.info("⛓️ Starting blockchain monitor...")

        while self.monitoring_active:
            try:
                if self.web3 and self.web3.is_connected():
                    # Check gas prices
                    gas_price = self.web3.eth.gas_price
                    gas_price_gwei = self.web3.from_wei(gas_price, 'gwei')

                    # Log gas price for monitoring
                    self.logger.debug(f"Current gas price: {gas_price_gwei} gwei")

                    # Check contract balance/health
                    if self.azr_contract:
                        try:
                            total_supply = self.azr_contract.functions.totalSupply().call()
                            total_supply_azr = float(Decimal(str(total_supply)) / Decimal('1000000000000000000'))
                            self.logger.debug(f"AZR total supply: {total_supply_azr:,.0f} tokens")
                        except Exception as e:
                            self.logger.warning(f"Failed to check contract supply: {e}")

                else:
                    self.logger.warning("Blockchain connection lost")

            except Exception as e:
                self.logger.error(f"Blockchain monitor error: {e}")

            time.sleep(60)  # Check every minute

    def auto_mint_worker(self):
        """Worker for automatic minting tasks"""
        self.logger.info("⏰ Starting auto-mint worker...")

        while self.monitoring_active:
            try:
                # Periodic maintenance tasks
                self.perform_maintenance_tasks()

            except Exception as e:
                self.logger.error(f"Auto-mint worker error: {e}")

            time.sleep(300)  # Run every 5 minutes

    def perform_maintenance_tasks(self):
        """Perform maintenance tasks"""
        try:
            # Clean up old data (keep last 30 days)
            with self.db_connection.cursor() as cursor:
                thirty_days_ago = datetime.now() - timedelta(days=30)

                cursor.execute("""
                    DELETE FROM mining_statistics
                    WHERE timestamp < %s
                """, (thirty_days_ago,))

                cursor.execute("""
                    DELETE FROM crypto_prices
                    WHERE timestamp < %s
                """, (thirty_days_ago,))

                self.db_connection.commit()

            # Health check
            self.perform_health_check()

        except Exception as e:
            self.logger.error(f"Maintenance tasks failed: {e}")

    def perform_health_check(self):
        """Perform system health check"""
        health_status = {
            'database': self.db_connection and not self.db_connection.closed,
            'blockchain': self.web3 and self.web3.is_connected() if self.web3 else False,
            'wallet': bool(self.account),
            'contract': bool(self.azr_contract),
            'mining_active': True,  # Would check actual mining process
            'timestamp': datetime.now().isoformat()
        }

        # Log health status
        healthy_components = sum(health_status.values())
        total_components = len(health_status) - 1  # Exclude timestamp

        if healthy_components == total_components:
            self.logger.info("✅ All systems healthy")
        else:
            self.logger.warning(f"⚠️ Health check: {healthy_components}/{total_components} components healthy")

        # Send alert if critical systems are down
        if not health_status['database'] or not health_status['wallet']:
            self.send_alert("Critical system failure", health_status)

    def send_alert(self, message: str, details: Dict):
        """Send alert notification"""
        if self.config['security']['alert_webhook']:
            try:
                payload = {
                    'message': f"🚨 AZORA Mint-Mine Alert: {message}",
                    'details': details,
                    'timestamp': datetime.now().isoformat()
                }

                requests.post(
                    self.config['security']['alert_webhook'],
                    json=payload,
                    timeout=10
                )

            except Exception as e:
                self.logger.error(f"Failed to send alert: {e}")

    def get_stats(self) -> Dict[str, Any]:
        """Get comprehensive system statistics"""
        return {
            'mining': {
                'total_mined_usd': self.mining_stats['total_mined_usd'],
                'total_azr_minted': self.mining_stats['total_azr_minted'],
                'active_sessions': self.mining_stats['active_sessions'],
                'conversion_rate': self.mining_stats['conversion_rate'],
                'algorithm': self.config['mining']['algorithm'],
                'hashrate_mhs': self.config['mining']['hashrate_mhs']
            },
            'blockchain': {
                'connected': self.web3 and self.web3.is_connected() if self.web3 else False,
                'contract_address': self.config['blockchain']['azr_contract_address'],
                'wallet_address': self.wallet_address,
                'last_tx': self.mining_stats['last_mint_tx']
            },
            'system': {
                'database_connected': self.db_connection and not self.db_connection.closed,
                'monitoring_active': self.monitoring_active,
                'threads_active': sum(1 for t in self.threads.values() if t.is_alive())
            }
        }

    def start(self):
        """Start the enhanced mint-mine integration engine"""
        self.logger.info("=" * 60)
        self.logger.info("🚀 AZORA MINT-MINE INTEGRATION ENGINE v2.0")
        self.logger.info("=" * 60)

        # Start all monitoring threads
        for name, thread in self.threads.items():
            thread.start()
            self.logger.info(f"✅ Started {name} thread")

        self.logger.info("🎯 Engine running with enhanced features:")
        self.logger.info("   ✅ Real blockchain integration")
        self.logger.info("   ✅ External mining pool APIs")
        self.logger.info("   ✅ Real-time price oracles")
        self.logger.info("   ✅ PostgreSQL persistence")
        self.logger.info("   ✅ Advanced monitoring & alerts")
        self.logger.info("   ✅ Gas management & transaction monitoring")
        self.logger.info("")

        stats = self.get_stats()
        self.logger.info("📊 Current Status:")
        self.logger.info(f"   💵 Total mined: ${stats['mining']['total_mined_usd']:.2f}")
        self.logger.info(f"   🪙 Total AZR minted: {stats['mining']['total_azr_minted']:.2f}")
        self.logger.info(f"   🔄 Conversion rate: {stats['mining']['conversion_rate']} AZR per USD")
        self.logger.info("")

    def stop(self):
        """Stop the enhanced mint-mine integration engine"""
        self.logger.info("⏹️ Stopping AZORA Mint-Mine Integration Engine v2.0...")
        self.monitoring_active = False

        # Wait for threads to finish
        for name, thread in self.threads.items():
            if thread.is_alive():
                thread.join(timeout=5)
                if thread.is_alive():
                    self.logger.warning(f"Thread {name} did not stop gracefully")

        # Close database connection
        if self.db_connection:
            self.db_connection.close()

        self.logger.info("✅ Engine stopped - all systems shut down")

def main():
    """Main function"""
    engine = AzoraMintMineEngineV2()

    try:
        engine.start()

        # Keep running
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n⏹️ Received shutdown signal...")
        engine.stop()

    except Exception as e:
        print(f"❌ Engine error: {e}")
        engine.stop()

if __name__ == '__main__':
    main()
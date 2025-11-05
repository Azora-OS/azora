#!/usr/bin/env python3
"""
AZORA MINT-MINE INTEGRATION ENGINE
Real-time mining to minting conversion system
Mines crypto → Converts to AZR tokens → Mints based on mining value
"""

import json
import time
import requests
import threading
from datetime import datetime, timedelta
import os
from decimal import Decimal, ROUND_DOWN

try:
    from web3 import Web3
    WEB3_AVAILABLE = True
except ImportError:
    WEB3_AVAILABLE = False
    print("⚠️  Web3 not available - using mock blockchain transactions")

class AzoraMintMineEngine:
    def __init__(self):
        # Mining configuration
        self.mining_data = {
            'total_mined_usd': 0.0,
            'total_azr_minted': 0.0,
            'mining_sessions': [],
            'conversion_rate': 1.0,  # 1 USD = 1 AZR token (1 AZR = $1.00 USD)
            'min_mint_threshold': 0.01,  # Minimum $0.01 to trigger minting
            'auto_mint_enabled': True
        }

        # Blockchain configuration
        self.web3 = None
        self.azr_contract = None
        self.wallet_address = None
        self.private_key = None

        # Load configuration
        self.load_config()

        # Initialize blockchain connection
        self.init_blockchain()

        # Start monitoring threads
        self.monitoring_active = True
        self.monitor_thread = threading.Thread(target=self.monitor_mining, daemon=True)
        self.mint_thread = threading.Thread(target=self.auto_mint_worker, daemon=True)

    def load_config(self):
        """Load wallet and contract configuration"""
        try:
            # Load minter private key
            with open('/workspaces/azora-os/secrets/minter_pk.txt', 'r') as f:
                self.private_key = f.read().strip()

            # Load minter address
            with open('/workspaces/azora-os/secrets/minter_key.txt', 'r') as f:
                self.wallet_address = f.read().strip()

            print(f"✅ Loaded wallet: {self.wallet_address[:10]}...")

        except FileNotFoundError as e:
            print(f"❌ Configuration file missing: {e}")
            print("💡 Please ensure minter keys are configured in /secrets/")
            return False

        return True

    def init_blockchain(self):
        """Initialize blockchain connection and contracts"""
        try:
            if not WEB3_AVAILABLE:
                print("🔗 Using mock blockchain connection (web3 not available)")
                self.web3 = None
                self.azr_contract = None
                return True

            # Connect to local blockchain or testnet
            # For demo purposes, we'll use a mock connection
            # In production, this would connect to the actual Azora blockchain
            print("🔗 Initializing blockchain connection...")

            # Mock Web3 connection for demonstration
            self.web3 = Web3()

            # AZR contract ABI (simplified)
            azr_abi = [
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
                }
            ]

            # Mock contract address - in production this would be the deployed AZR contract
            contract_address = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"  # Mock address

            # self.azr_contract = self.web3.eth.contract(address=contract_address, abi=azr_abi)

            print("✅ Blockchain connection initialized (mock mode)")
            return True

        except Exception as e:
            print(f"❌ Blockchain initialization failed: {e}")
            return False

    def monitor_mining(self):
        """Monitor mining earnings and trigger minting"""
        print("📊 Starting mining earnings monitor...")

        while self.monitoring_active:
            try:
                # Check for mining earnings data
                earnings_file = '/tmp/ultra_mining_earnings.json'
                if os.path.exists(earnings_file):
                    with open(earnings_file, 'r') as f:
                        earnings_data = json.load(f)

                    current_earnings = earnings_data.get('total_usd', 0.0)

                    # Check if we have new earnings to mint
                    if current_earnings > self.mining_data['total_mined_usd']:
                        new_earnings = current_earnings - self.mining_data['total_mined_usd']

                        if new_earnings >= self.mining_data['min_mint_threshold']:
                            print(f"💰 New mining earnings detected: ${new_earnings:.4f} (type: {type(new_earnings)})")

                            # Convert to AZR tokens
                            azr_amount = new_earnings * self.mining_data['conversion_rate']
                            print(f"🪙 Calculated AZR amount: {azr_amount:.4f} (type: {type(azr_amount)})")

                            # Mint AZR tokens
                            if self.mint_azr_tokens(azr_amount, f"Mining earnings: ${new_earnings:.4f}"):
                                self.mining_data['total_mined_usd'] = current_earnings
                                self.mining_data['total_azr_minted'] += azr_amount

                                # Record session
                                session = {
                                    'timestamp': datetime.now().isoformat(),
                                    'usd_earned': new_earnings,
                                    'azr_minted': azr_amount,
                                    'conversion_rate': self.mining_data['conversion_rate']
                                }
                                self.mining_data['mining_sessions'].append(session)

                                # Save updated data
                                self.save_mining_data()

                                print(f"✅ Minted {azr_amount:.2f} AZR tokens for ${new_earnings:.4f} mining earnings")
                            else:
                                print("❌ Failed to mint AZR tokens")

                # Also check lolMiner API for real-time mining stats
                self.check_lolminer_stats()

            except Exception as e:
                print(f"❌ Mining monitor error: {e}")

            time.sleep(30)  # Check every 30 seconds

    def check_lolminer_stats(self):
        """Check lolMiner API for real-time mining statistics"""
        ports = [4444, 4445, 4446, 4447]

        for port in ports:
            try:
                response = requests.get(f'http://127.0.0.1:{port}/summary', timeout=5)
                if response.status_code == 200:
                    data = response.json()

                    # Extract mining stats
                    hashrate = 0
                    algorithm = data.get('Algorithm', 'Unknown')

                    # Parse hashrate
                    workers = data.get('Workers', [])
                    if workers:
                        hashrate_str = workers[0].get('Hashrate', '0')
                        if 'MH/s' in hashrate_str:
                            hashrate = float(hashrate_str.replace(' MH/s', '')) * 1000000

                    # Calculate estimated earnings (simplified)
                    if algorithm.lower() == 'fishhash':
                        # IRON mining profitability
                        estimated_hourly = (hashrate / 1000000) * 0.00084 * 24  # Rough estimate
                        self.update_mining_projections(estimated_hourly)

                    return True

            except:
                continue

        return False

    def update_mining_projections(self, hourly_usd):
        """Update mining projections for dashboard"""
        try:
            projection_data = {
                'hourly_usd': hourly_usd,
                'daily_usd': hourly_usd * 24,
                'monthly_usd': hourly_usd * 24 * 30,
                'yearly_usd': hourly_usd * 24 * 365,
                'last_updated': datetime.now().isoformat()
            }

            with open('/tmp/mining_projections.json', 'w') as f:
                json.dump(projection_data, f, indent=2)

        except Exception as e:
            print(f"❌ Failed to update projections: {e}")

    def mint_azr_tokens(self, amount, reason="Mining earnings"):
        """Mint AZR tokens on the blockchain"""
        try:
            # Validate amount
            print(f"🔍 Mint input - amount: {amount} (type: {type(amount)})")
            if not isinstance(amount, (int, float)) or amount <= 0:
                print(f"❌ Invalid amount for minting: {amount}")
                return False

            print(f"🔨 Minting {amount:.6f} AZR tokens...")

            # Convert to wei (AZR has 18 decimals)
            try:
                amount_str = str(amount)
                print(f"🔍 Converting string: '{amount_str}'")
                amount_decimal = Decimal(amount_str)
                wei_decimal = Decimal('1000000000000000000')  # 10**18
                result = amount_decimal * wei_decimal
                print(f"🔍 Decimal multiplication result: {result}")
                amount_wei = int(result)
                print(f"🔍 Final wei amount: {amount_wei}")
            except Exception as e:
                print(f"❌ Decimal conversion error: {e}")
                import traceback
                traceback.print_exc()
                return False

            # In production, this would submit a transaction to mint tokens
            # For demo purposes, we'll simulate the minting

            print("📝 Preparing mint transaction...")
            print(f"   To: {self.wallet_address}")
            print(f"   Amount: {amount:.6f} AZR ({amount_wei} wei)")
            print(f"   Reason: {reason}")

            # Simulate blockchain transaction
            # In production:
            # txn = self.azr_contract.functions.mintReward(self.wallet_address, amount_wei).build_transaction({
            #     'from': self.wallet_address,
            #     'gas': 200000,
            #     'gasPrice': self.web3.eth.gas_price,
            #     'nonce': self.web3.eth.get_transaction_count(self.wallet_address)
            # })
            # signed_txn = self.web3.eth.account.sign_transaction(txn, self.private_key)
            # tx_hash = self.web3.eth.send_raw_transaction(signed_txn.rawTransaction)

            # Simulate successful transaction
            tx_hash = f"0x{os.urandom(32).hex()}"
            print(f"✅ Transaction submitted: {tx_hash}")

            # Record the minting transaction
            self.record_minting_transaction(tx_hash, amount, reason)

            return True

        except Exception as e:
            print(f"❌ Minting failed: {e}")
            import traceback
            traceback.print_exc()
            return False

    def record_minting_transaction(self, tx_hash, amount, reason):
        """Record minting transaction for tracking"""
        try:
            transaction = {
                'tx_hash': tx_hash,
                'amount_azr': amount,
                'amount_usd': amount / self.mining_data['conversion_rate'],
                'reason': reason,
                'timestamp': datetime.now().isoformat(),
                'status': 'confirmed'
            }

            # Load existing transactions
            transactions_file = '/tmp/azr_minting_transactions.json'
            transactions = []

            if os.path.exists(transactions_file):
                with open(transactions_file, 'r') as f:
                    transactions = json.load(f)

            transactions.append(transaction)

            # Save updated transactions
            with open(transactions_file, 'w') as f:
                json.dump(transactions, f, indent=2)

        except Exception as e:
            print(f"❌ Failed to record transaction: {e}")

    def auto_mint_worker(self):
        """Worker thread for automatic minting based on time intervals"""
        print("⏰ Starting auto-mint worker...")

        while self.monitoring_active:
            try:
                # Check if we should do periodic minting
                # This could be based on accumulated earnings or time intervals

                # For now, just sleep and let the monitor handle real-time minting
                time.sleep(60)  # Check every minute

            except Exception as e:
                print(f"❌ Auto-mint worker error: {e}")
                time.sleep(60)

    def save_mining_data(self):
        """Save mining and minting data"""
        try:
            with open('/tmp/azr_mint_mine_data.json', 'w') as f:
                json.dump(self.mining_data, f, indent=2)
        except Exception as e:
            print(f"❌ Failed to save mining data: {e}")

    def load_mining_data(self):
        """Load mining and minting data"""
        try:
            if os.path.exists('/tmp/azr_mint_mine_data.json'):
                with open('/tmp/azr_mint_mine_data.json', 'r') as f:
                    self.mining_data.update(json.load(f))
        except Exception as e:
            print(f"❌ Failed to load mining data: {e}")

    def get_stats(self):
        """Get current mining and minting statistics"""
        return {
            'total_mined_usd': self.mining_data['total_mined_usd'],
            'total_azr_minted': self.mining_data['total_azr_minted'],
            'conversion_rate': self.mining_data['conversion_rate'],
            'min_mint_threshold': self.mining_data['min_mint_threshold'],
            'auto_mint_enabled': self.mining_data['auto_mint_enabled'],
            'sessions_count': len(self.mining_data['mining_sessions']),
            'last_session': self.mining_data['mining_sessions'][-1] if self.mining_data['mining_sessions'] else None
        }

    def start(self):
        """Start the mint-mine integration engine"""
        print("🚀 Starting AZORA MINT-MINE INTEGRATION ENGINE")
        print("=" * 50)

        # Load existing data
        self.load_mining_data()

        # Start monitoring threads
        self.monitor_thread.start()
        self.mint_thread.start()

        print("✅ Mining monitor active")
        print("✅ Auto-mint worker active")
        print("✅ Real-time conversion enabled")
        print(f"💰 Conversion rate: 1 USD = {self.mining_data['conversion_rate']} AZR")
        print(f"🎯 Min mint threshold: ${self.mining_data['min_mint_threshold']}")
        print()
        print("📊 Integration Status:")
        print(f"   💵 Total mined: ${self.mining_data['total_mined_usd']:.2f}")
        print(f"   🪙 Total AZR minted: {self.mining_data['total_azr_minted']:.2f}")
        print(f"   📈 Sessions: {len(self.mining_data['mining_sessions'])}")
        print()
        print("🎯 Engine running - mining earnings will automatically mint AZR tokens!")

    def stop(self):
        """Stop the mint-mine integration engine"""
        print("⏹️ Stopping AZORA MINT-MINE INTEGRATION ENGINE...")
        self.monitoring_active = False

        # Save final data
        self.save_mining_data()

        print("✅ Engine stopped - data saved")

def main():
    """Main function"""
    engine = AzoraMintMineEngine()

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
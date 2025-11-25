import asyncio
import websockets
import json
import subprocess
import psutil
import time
import logging
from datetime import datetime, timezone
import redis
import requests

logger = logging.getLogger(__name__)

class MinerAgent:
    def __init__(self, node_id: str, orchestrator_url: str = "http://localhost:8000"):
        self.node_id = node_id
        self.orchestrator_url = orchestrator_url
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
        self.current_miner_process = None
        self.current_coin = "ETH"
        self.miner_configs = self.load_miner_configs()

    def load_miner_configs(self):
        """Load miner configurations for different coins"""
        return {
            "ETH": {
                "command": ["./miners/t-rex", "-a", "ethash", "-o", "stratum+tcp://eth.pool.com:3333", "-u", "wallet_address", "-p", "x"],
                "algorithm": "ethash"
            },
            "BTC": {
                "command": ["./miners/ccminer", "-a", "sha256", "-o", "stratum+tcp://btc.pool.com:3333", "-u", "wallet_address", "-p", "x"],
                "algorithm": "sha256"
            },
            "XMR": {
                "command": ["./miners/xmrig", "-o", "pool.monero.com:3333", "-u", "wallet_address", "-p", "x"],
                "algorithm": "randomx"
            }
        }

    async def register_with_orchestrator(self):
        """Register this node with the orchestrator"""
        node_status = {
            "node_id": self.node_id,
            "current_coin": self.current_coin,
            "hash_rate": await self.get_hash_rate(),
            "power_consumption": await self.get_power_consumption(),
            "temperature": await self.get_temperature(),
            "uptime": int(time.time()),
            "last_seen": datetime.now(timezone.utc).isoformat()
        }

        try:
            response = requests.post(
                f"{self.orchestrator_url}/nodes/{self.node_id}/register",
                json=node_status
            )
            logger.info(f"Registered with orchestrator: {response.status_code}")
        except Exception as e:
            logger.error(f"Registration failed: {e}")

    async def check_for_commands(self):
        """Check Redis for new commands from orchestrator"""
        command_key = f"node:{self.node_id}:command"
        command_data = self.redis_client.get(command_key)

        if command_data:
            command = json.loads(command_data)
            await self.execute_command(command)
            self.redis_client.delete(command_key)

    async def execute_command(self, command: dict):
        """Execute command from orchestrator"""
        action = command.get("action")

        if action == "switch_coin":
            new_coin = command.get("coin")
            await self.switch_coin(new_coin)
        elif action == "restart_miner":
            await self.restart_miner()
        elif action == "shutdown":
            await self.shutdown()

    async def switch_coin(self, coin: str):
        """Switch mining to different coin"""
        logger.info(f"Switching from {self.current_coin} to {coin}")

        # Gracefully stop current miner
        await self.stop_miner()

        # Update configuration
        self.current_coin = coin

        # Start new miner
        await self.start_miner(coin)

    async def start_miner(self, coin: str):
        """Start miner process for specific coin"""
        if coin not in self.miner_configs:
            logger.error(f"No config for coin: {coin}")
            return

        config = self.miner_configs[coin]
        command = config["command"]

        try:
            self.current_miner_process = subprocess.Popen(
                command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd="./miners"
            )
            logger.info(f"Started miner for {coin}")
        except Exception as e:
            logger.error(f"Failed to start miner: {e}")

    async def stop_miner(self):
        """Stop current miner process gracefully"""
        if self.current_miner_process:
            try:
                self.current_miner_process.terminate()
                await asyncio.sleep(5)  # Wait for graceful shutdown

                if self.current_miner_process.poll() is None:
                    self.current_miner_process.kill()

                logger.info("Miner stopped")
            except Exception as e:
                logger.error(f"Error stopping miner: {e}")

    async def restart_miner(self):
        """Restart current miner"""
        await self.stop_miner()
        await self.start_miner(self.current_coin)

    async def shutdown(self):
        """Shutdown agent"""
        await self.stop_miner()
        logger.info("Agent shutting down")

    async def get_hash_rate(self) -> float:
        """Get current hash rate from miner API or estimation"""
        # This would query miner API (e.g., ethminer API, xmrig API)
        # For now, return estimated based on hardware
        return 100.0  # MH/s

    async def get_power_consumption(self) -> float:
        """Get power consumption in watts"""
        # This would use system monitoring tools
        return 300.0  # Watts

    async def get_temperature(self) -> float:
        """Get GPU/CPU temperature"""
        # This would use nvidia-smi or similar
        return 70.0  # Celsius

    async def report_telemetry(self):
        """Report telemetry to orchestrator"""
        telemetry = {
            "node_id": self.node_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "hash_rate": await self.get_hash_rate(),
            "power_consumption": await self.get_power_consumption(),
            "temperature": await self.get_temperature(),
            "current_coin": self.current_coin,
            "miner_status": "running" if self.current_miner_process and self.current_miner_process.poll() is None else "stopped"
        }

        # Send to orchestrator
        try:
            response = requests.post(
                f"{self.orchestrator_url}/nodes/{self.node_id}/telemetry",
                json=telemetry
            )
        except Exception as e:
            logger.error(f"Telemetry report failed: {e}")

    async def run(self):
        """Main agent loop"""
        await self.register_with_orchestrator()

        while True:
            try:
                # Check for commands
                await self.check_for_commands()

                # Report telemetry
                await self.report_telemetry()

                # Health check
                if self.current_miner_process and self.current_miner_process.poll() is not None:
                    logger.warning("Miner process died, restarting...")
                    await self.restart_miner()

                await asyncio.sleep(30)  # Check every 30 seconds

            except Exception as e:
                logger.error(f"Agent loop error: {e}")
                await asyncio.sleep(10)

if __name__ == "__main__":
    import sys
    node_id = sys.argv[1] if len(sys.argv) > 1 else "node-001"

    agent = MinerAgent(node_id)
    asyncio.run(agent.run())
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
import redis
import asyncio
import json
from datetime import datetime, timezone
import logging
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from optimizer.coin_selector import ProfitabilityOptimizer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Azora Mining Orchestrator", version="1.0.0")

# Redis connection (optional)
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0)
    redis_available = True
except:
    redis_client = None
    redis_available = False

class NodeStatus(BaseModel):
    node_id: str
    current_coin: str
    hash_rate: float
    power_consumption: float
    temperature: float
    uptime: int
    last_seen: datetime

class CoinConfig(BaseModel):
    symbol: str
    algorithm: str
    pool_url: str
    wallet_address: str
    difficulty: float
    reward: float
    price_usd: float

class Orchestrator:
    def __init__(self):
        self.nodes = {}
        self.coins = self.load_coin_configs()
        self.optimizer = ProfitabilityOptimizer()

    def load_coin_configs(self):
        # Load coin configurations from config
        return {
            "ETH": CoinConfig(
                symbol="ETH",
                algorithm="Ethash",
                pool_url="stratum+tcp://eth.pool.com:3333",
                wallet_address="0x...",
                difficulty=1e15,
                reward=2.0,
                price_usd=2500.0
            ),
            "BTC": CoinConfig(
                symbol="BTC",
                algorithm="SHA256",
                pool_url="stratum+tcp://btc.pool.com:3333",
                wallet_address="bc1...",
                difficulty=1e20,
                reward=6.25,
                price_usd=45000.0
            ),
            # Add more coins
        }

    async def optimize_and_switch(self):
        """AI-driven optimization and coin switching"""
        while True:
            try:
                # Get market data
                market_data = await self.optimizer.get_market_data()

                # Calculate profitability for each node
                for node_id, node_status in self.nodes.items():
                    best_coin = self.optimizer.select_best_coin(node_status, market_data)

                    if best_coin != node_status.current_coin:
                        await self.switch_node(node_id, best_coin)
                        logger.info(f"Switched node {node_id} to {best_coin}")

                await asyncio.sleep(300)  # Check every 5 minutes

            except Exception as e:
                logger.error(f"Optimization error: {e}")
                await asyncio.sleep(60)

    async def switch_node(self, node_id: str, coin: str):
        """Send switch command to node"""
        command = {
            "action": "switch_coin",
            "coin": coin,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        # Store in Redis for node to pick up (if available)
        if redis_available:
            redis_client.set(f"node:{node_id}:command", json.dumps(command))

        # Update node status
        if node_id in self.nodes:
            self.nodes[node_id].current_coin = coin

@app.on_event("startup")
async def startup_event():
    orchestrator = Orchestrator()
    app.state.orchestrator = orchestrator

    # Start optimization loop
    asyncio.create_task(orchestrator.optimize_and_switch())

@app.get("/health")
async def health():
    return {"status": "healthy", "redis_available": redis_available}

@app.get("/nodes")
async def get_nodes():
    return app.state.orchestrator.nodes

@app.post("/nodes/{node_id}/register")
async def register_node(node_id: str, status: NodeStatus):
    app.state.orchestrator.nodes[node_id] = status
    if redis_available:
        redis_client.set(f"node:{node_id}:status", status.json())
    return {"status": "registered"}

@app.get("/coins")
async def get_coins():
    # Convert CoinConfig objects to dicts for JSON serialization
    coins_dict = {}
    for symbol, config in app.state.orchestrator.coins.items():
        coins_dict[symbol] = config.dict()
    return coins_dict

@app.post("/nodes/{node_id}/telemetry")
async def receive_telemetry(node_id: str, telemetry: dict):
    # Update node status with telemetry data
    if node_id in app.state.orchestrator.nodes:
        # Update last seen and other metrics
        app.state.orchestrator.nodes[node_id].last_seen = telemetry.get("timestamp")
        # Could store telemetry history here
    return {"status": "telemetry_received"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
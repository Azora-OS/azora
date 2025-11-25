import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import requests
import asyncio
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class ProfitabilityOptimizer:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.market_cache = {}
        self.is_trained = False

    async def get_market_data(self) -> Dict:
        """Fetch real-time market data for coins"""
        try:
            # CoinGecko API for prices and market data
            response = requests.get(
                "https://api.coingecko.com/api/v3/coins/markets",
                params={
                    "vs_currency": "usd",
                    "ids": "bitcoin,ethereum,monero,litecoin,dogecoin",
                    "order": "market_cap_desc",
                    "per_page": 10,
                    "page": 1,
                    "sparkline": False
                }
            )
            data = response.json()

            market_data = {}
            for coin in data:
                symbol = coin['symbol'].upper()
                market_data[symbol] = {
                    'price': coin['current_price'],
                    'market_cap': coin['market_cap'],
                    'volume': coin['total_volume'],
                    'change_24h': coin['price_change_percentage_24h'],
                    'difficulty': await self.get_difficulty(symbol),
                    'reward': await self.get_block_reward(symbol)
                }

            self.market_cache = market_data
            return market_data

        except Exception as e:
            logger.error(f"Market data fetch error: {e}")
            return self.market_cache or {}

    async def get_difficulty(self, symbol: str) -> float:
        """Get mining difficulty for coin"""
        # This would integrate with mining pool APIs
        difficulties = {
            'BTC': 1e20,
            'ETH': 1e15,
            'XMR': 3e11,
            'LTC': 3.5e7,  # Much higher for realistic LTC mining
            'DOGE': 1e10
        }
        return difficulties.get(symbol, 1e12)

    async def get_block_reward(self, symbol: str) -> float:
        """Get block reward for coin"""
        rewards = {
            'BTC': 6.25,
            'ETH': 2.0,
            'XMR': 0.6,
            'LTC': 12.5,
            'DOGE': 10000
        }
        return rewards.get(symbol, 1.0)

    def calculate_profitability(self, coin: str, node_hashrate: float,
                              power_cost: float, electricity_price: float) -> float:
        """Calculate expected profit for coin on specific node"""
        if coin not in self.market_cache:
            return 0.0

        data = self.market_cache[coin]
        price = data['price']
        difficulty = data['difficulty']
        reward = data['reward']

        # Expected blocks per day
        blocks_per_day = (node_hashrate * 86400) / difficulty

        # Daily revenue
        daily_revenue = blocks_per_day * reward * price

        # Daily costs
        daily_power_cost = (power_cost / 1000) * 24 * electricity_price  # kWh to cost

        # Net profit
        net_profit = daily_revenue - daily_power_cost

        return max(0, net_profit)  # No negative profits

    def select_best_coin(self, node_status, market_data: Dict) -> str:
        """AI-powered coin selection using ML model"""
        if not market_data:
            return "ETH"  # Default fallback

        best_coin = "ETH"
        best_profit = 0

        for coin_symbol in market_data.keys():
            profit = self.calculate_profitability(
                coin_symbol,
                node_status.hash_rate,
                node_status.power_consumption,
                0.12  # $0.12/kWh electricity price
            )

            if profit > best_profit:
                best_coin = coin_symbol
                best_profit = profit

        # Use ML model if trained
        if self.is_trained:
            features = self.prepare_features(node_status, market_data)
            predictions = self.model.predict(features)
            best_coin = list(market_data.keys())[np.argmax(predictions)]

        return best_coin

    def prepare_features(self, node_status, market_data: Dict) -> np.ndarray:
        """Prepare features for ML model"""
        features = []
        for coin, data in market_data.items():
            feature_vector = [
                node_status.hash_rate,
                node_status.power_consumption,
                node_status.temperature,
                data['price'],
                data['difficulty'],
                data['reward'],
                data['change_24h']
            ]
            features.append(feature_vector)

        return np.array(features)

    def train_model(self, historical_data: pd.DataFrame):
        """Train ML model on historical profitability data"""
        if len(historical_data) < 10:
            return

        # Prepare training data
        X = historical_data.drop('profit', axis=1)
        y = historical_data['profit']

        # Scale features
        X_scaled = self.scaler.fit_transform(X)

        # Train model
        self.model.fit(X_scaled, y)
        self.is_trained = True

        logger.info("ML model trained on historical data")

    async def continuous_learning(self):
        """Continuous learning loop"""
        while True:
            try:
                # Collect performance data
                performance_data = await self.collect_performance_data()

                if performance_data:
                    self.train_model(performance_data)

                await asyncio.sleep(3600)  # Retrain hourly

            except Exception as e:
                logger.error(f"Learning error: {e}")
                await asyncio.sleep(300)

    async def collect_performance_data(self) -> pd.DataFrame:
        """Collect historical performance data for training"""
        # This would query Redis/PostgreSQL for historical mining data
        # For now, return empty DataFrame
        return pd.DataFrame()
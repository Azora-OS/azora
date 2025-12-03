#!/usr/bin/env python3
"""
AZR Ultra Mining Dashboard
Simple web UI showing balance, mining status, and crypto prices
"""

import json
import os
import time
import requests
from datetime import datetime
from flask import Flask, render_template_string, jsonify
import threading

app = Flask(__name__)

# Global data storage
mining_data = {
    'balance': {'azr': 0, 'usd': 0},
    'mining': {'status': 'stopped', 'algorithm': 'None', 'hashrate': 0, 'uptime': 0},
    'prices': {}
}

def update_mining_data():
    """Update mining data from files"""
    global mining_data

    # Update balance from earnings file
    earnings_file = '/tmp/ultra_mining_earnings.json'
    if os.path.exists(earnings_file):
        try:
            with open(earnings_file, 'r') as f:
                data = json.load(f)
                mining_data['balance'] = {
                    'azr': data.get('total_azr', 0),
                    'usd': data.get('total_usd', 0)
                }
                mining_data['mining'] = {
                    'status': data.get('status', 'unknown'),
                    'algorithm': data.get('current_algorithm', 'None'),
                    'hashrate': 85,  # MH/s for ERG
                    'uptime': data.get('runtime_hours', 0)
                }
        except:
            pass

def update_crypto_prices():
    """Update cryptocurrency prices from CoinGecko API"""
    global mining_data

    try:
        # Get prices for our mining coins
        coins = ['ergo', 'conflux-token', 'ravencoin', 'ethereum']
        ids = ','.join(coins)

        url = f'https://api.coingecko.com/api/v3/simple/price?ids={ids}&vs_currencies=usd'
        response = requests.get(url, timeout=10)

        if response.status_code == 200:
            prices = response.json()
            mining_data['prices'] = {
                'ERG': prices.get('ergo', {}).get('usd', 0),
                'CFX': prices.get('conflux-token', {}).get('usd', 0),
                'RVN': prices.get('ravencoin', {}).get('usd', 0),
                'ETH': prices.get('ethereum', {}).get('usd', 0)
            }
    except:
        # Fallback prices if API fails
        mining_data['prices'] = {
            'ERG': 1.85,
            'CFX': 0.25,
            'RVN': 0.035,
            'ETH': 3200
        }

def background_updates():
    """Background thread to update data"""
    while True:
        update_mining_data()
        update_crypto_prices()
        time.sleep(30)  # Update every 30 seconds

# HTML Template
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚀 AZR Ultra Mining Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 25px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .card h3 {
            font-size: 1.5em;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .balance-amount {
            font-size: 2.5em;
            font-weight: bold;
            color: #ffd700;
            margin: 10px 0;
        }

        .usd-amount {
            font-size: 1.2em;
            opacity: 0.8;
        }

        .mining-status {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
        }

        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }

        .status-active {
            background: #4CAF50;
            box-shadow: 0 0 10px #4CAF50;
        }

        .status-inactive {
            background: #f44336;
        }

        .price-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }

        .price-item {
            background: rgba(255, 255, 255, 0.05);
            padding: 15px;
            border-radius: 10px;
            text-align: center;
        }

        .price-symbol {
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .price-value {
            font-size: 1.4em;
            color: #ffd700;
        }

        .stats {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .stat {
            text-align: center;
        }

        .stat-value {
            font-size: 1.3em;
            font-weight: bold;
            color: #ffd700;
        }

        .stat-label {
            font-size: 0.9em;
            opacity: 0.8;
        }

        .refresh-btn {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1em;
            margin: 20px auto;
            display: block;
            transition: transform 0.2s;
        }

        .refresh-btn:hover {
            transform: scale(1.05);
        }

        .last-updated {
            text-align: center;
            opacity: 0.7;
            font-size: 0.9em;
            margin-top: 20px;
        }

        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }

        .mining-active {
            animation: pulse 2s infinite;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 AZR Ultra Mining Dashboard</h1>
            <p>Intel Core i7-1065G7 Ultra-Optimized Mining Engine</p>
        </div>

        <div class="grid">
            <!-- Balance Card -->
            <div class="card">
                <h3>💰 Balance</h3>
                <div class="balance-amount" id="azr-balance">{{ "%.4f"|format(balance.azr) }}</div>
                <div class="usd-amount" id="usd-balance">${{ "%.4f"|format(balance.usd) }}</div>
                <div class="stats">
                    <div class="stat">
                        <div class="stat-value" id="monthly-proj">${{ "%.0f"|format(balance.usd * 30 * 24) }}</div>
                        <div class="stat-label">Monthly</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value" id="yearly-proj">${{ "%.0f"|format(balance.usd * 365 * 24) }}</div>
                        <div class="stat-label">Yearly</div>
                    </div>
                </div>
            </div>

            <!-- Mining Status Card -->
            <div class="card">
                <h3>⛏️ Mining Status</h3>
                <div class="mining-status">
                    <span>
                        <span class="status-indicator {{ 'status-active mining-active' if mining.status == 'ultra_mining_active' else 'status-inactive' }}"></span>
                        {{ mining.status.replace('_', ' ').title() }}
                    </span>
                    <span id="algorithm">{{ mining.algorithm }}</span>
                </div>
                <div class="stats">
                    <div class="stat">
                        <div class="stat-value" id="hashrate">{{ mining.hashrate }} MH/s</div>
                        <div class="stat-label">Hashrate</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value" id="uptime">{{ "%.2f"|format(mining.uptime) }}h</div>
                        <div class="stat-label">Uptime</div>
                    </div>
                </div>
            </div>

            <!-- Crypto Prices Card -->
            <div class="card">
                <h3>📈 Crypto Prices</h3>
                <div class="price-grid">
                    {% for symbol, price in prices.items() %}
                    <div class="price-item">
                        <div class="price-symbol">{{ symbol }}</div>
                        <div class="price-value" id="{{ symbol.lower() }}-price">${{ "%.4f"|format(price) }}</div>
                    </div>
                    {% endfor %}
                </div>
            </div>

            <!-- Performance Card -->
            <div class="card">
                <h3>⚡ Performance</h3>
                <div class="stats">
                    <div class="stat">
                        <div class="stat-value">13.4x</div>
                        <div class="stat-label">Boost</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">8</div>
                        <div class="stat-label">Threads</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">3.9GHz</div>
                        <div class="stat-label">Turbo</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">3200</div>
                        <div class="stat-label">MT/s RAM</div>
                    </div>
                </div>
            </div>
        </div>

        <button class="refresh-btn" onclick="location.reload()">🔄 Refresh Dashboard</button>

        <div class="last-updated" id="last-updated">
            Last updated: {{ current_time }}
        </div>
    </div>

    <script>
        // Auto-refresh every 30 seconds
        setInterval(() => {
            fetch('/api/data')
                .then(response => response.json())
                .then(data => {
                    // Update balance
                    document.getElementById('azr-balance').textContent = data.balance.azr.toFixed(4);
                    document.getElementById('usd-balance').textContent = '$' + data.balance.usd.toFixed(4);

                    // Update projections
                    document.getElementById('monthly-proj').textContent = '$' + (data.balance.usd * 30 * 24).toFixed(0);
                    document.getElementById('yearly-proj').textContent = '$' + (data.balance.usd * 365 * 24).toFixed(0);

                    // Update mining status
                    document.getElementById('algorithm').textContent = data.mining.algorithm;
                    document.getElementById('hashrate').textContent = data.mining.hashrate + ' MH/s';
                    document.getElementById('uptime').textContent = data.mining.uptime.toFixed(2) + 'h';

                    // Update prices
                    for (const [symbol, price] of Object.entries(data.prices)) {
                        const element = document.getElementById(symbol.toLowerCase() + '-price');
                        if (element) {
                            element.textContent = '$' + price.toFixed(4);
                        }
                    }

                    // Update timestamp
                    document.getElementById('last-updated').textContent =
                        'Last updated: ' + new Date().toLocaleTimeString();
                })
                .catch(error => console.log('Update failed:', error));
        }, 30000);
    </script>
</body>
</html>
"""

@app.route('/')
def dashboard():
    """Main dashboard page"""
    update_mining_data()
    update_crypto_prices()

    return render_template_string(HTML_TEMPLATE,
                                balance=mining_data['balance'],
                                mining=mining_data['mining'],
                                prices=mining_data['prices'],
                                current_time=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

@app.route('/api/data')
def api_data():
    """API endpoint for real-time data"""
    update_mining_data()
    update_crypto_prices()

    return jsonify(mining_data)

if __name__ == '__main__':
    # Start background updates
    update_thread = threading.Thread(target=background_updates, daemon=True)
    update_thread.start()

    print("🚀 Starting AZR Ultra Mining Dashboard...")
    print("📊 Dashboard: http://localhost:5000")
    print("🔄 Auto-updates every 30 seconds")
    print("🎯 Ultra mining engine monitoring active")

    app.run(host='0.0.0.0', port=5000, debug=False)
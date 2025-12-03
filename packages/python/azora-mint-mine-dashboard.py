#!/usr/bin/env python3
"""
AZORA MINT-MINE INTEGRATION DASHBOARD v2.0
Advanced dashboard with real-time monitoring, analytics, and control panel
"""

import json
import time
import threading
import logging
import os
from datetime import datetime, timedelta
from flask import Flask, render_template_string, request, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor
import requests
import plotly.graph_objects as go
import plotly.utils

# Initialize Flask app
app = Flask(__name__)

class AzoraDashboard:
    def __init__(self):
        self.app = app
        self.db_connection = None
        self.engine_stats = {}
        self.monitoring_active = True

        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger('AzoraDashboard')

        # Initialize database connection
        self.initialize_database()

        # Start background monitoring
        self.monitor_thread = threading.Thread(target=self.monitor_engine, daemon=True)
        self.monitor_thread.start()

    def initialize_database(self):
        """Initialize database connection"""
        try:
            self.db_connection = psycopg2.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                port=int(os.getenv('DB_PORT', '5432')),
                database=os.getenv('DB_NAME', 'azora_os'),
                user=os.getenv('DB_USER', 'azora'),
                password=os.getenv('DB_PASSWORD', '')
            )
            self.logger.info("✅ Database connection established")
        except Exception as e:
            self.logger.error(f"Database connection failed: {e}")

    def monitor_engine(self):
        """Monitor the mining engine status"""
        while self.monitoring_active:
            try:
                # Check engine health via API or direct connection
                self.update_engine_stats()

                # Update dashboard data
                self.update_dashboard_data()

            except Exception as e:
                self.logger.error(f"Engine monitoring error: {e}")

            time.sleep(30)  # Update every 30 seconds

    def update_engine_stats(self):
        """Update engine statistics from database"""
        if not self.db_connection:
            return

        try:
            with self.db_connection.cursor(cursor_factory=RealDictCursor) as cursor:
                # Get mining summary
                cursor.execute("""
                    SELECT
                        COUNT(*) as total_sessions,
                        SUM(total_earnings_usd) as total_earnings,
                        SUM(azr_minted) as total_azr_minted,
                        AVG(total_hashrate_mhs) as avg_hashrate
                    FROM mining_sessions
                    WHERE status = 'completed'
                """)
                mining_summary = cursor.fetchone()

                # Get recent transactions
                cursor.execute("""
                    SELECT
                        COUNT(*) as pending_txs,
                        COUNT(CASE WHEN blockchain_status = 'confirmed' THEN 1 END) as confirmed_txs
                    FROM minting_transactions
                    WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
                """)
                tx_summary = cursor.fetchone()

                # Get current prices
                cursor.execute("""
                    SELECT symbol, price_usd, price_change_24h
                    FROM crypto_prices
                    WHERE timestamp = (
                        SELECT MAX(timestamp) FROM crypto_prices WHERE symbol = crypto_prices.symbol
                    )
                """)
                prices = cursor.fetchall()

                self.engine_stats = {
                    'mining': dict(mining_summary) if mining_summary else {},
                    'transactions': dict(tx_summary) if tx_summary else {},
                    'prices': {price['symbol']: price for price in prices},
                    'last_update': datetime.now().isoformat()
                }

        except Exception as e:
            self.logger.error(f"Failed to update engine stats: {e}")

    def update_dashboard_data(self):
        """Update dashboard data for charts and analytics"""
        if not self.db_connection:
            return

        try:
            with self.db_connection.cursor(cursor_factory=RealDictCursor) as cursor:
                # Get hourly earnings for the last 24 hours
                cursor.execute("""
                    SELECT
                        DATE_TRUNC('hour', created_at) as hour,
                        SUM(total_earnings_usd) as earnings
                    FROM mining_sessions
                    WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
                    AND status = 'completed'
                    GROUP BY DATE_TRUNC('hour', created_at)
                    ORDER BY hour
                """)
                hourly_earnings = cursor.fetchall()

                # Get daily AZR minting for the last 7 days
                cursor.execute("""
                    SELECT
                        DATE(created_at) as date,
                        SUM(amount_azr) as azr_minted
                    FROM minting_transactions
                    WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
                    AND blockchain_status = 'confirmed'
                    GROUP BY DATE(created_at)
                    ORDER BY date
                """)
                daily_azr = cursor.fetchall()

                self.dashboard_data = {
                    'hourly_earnings': hourly_earnings,
                    'daily_azr': daily_azr,
                    'updated_at': datetime.now().isoformat()
                }

        except Exception as e:
            self.logger.error(f"Failed to update dashboard data: {e}")

    def get_system_health(self):
        """Get system health status"""
        if not self.db_connection:
            return {'status': 'error', 'message': 'Database not connected'}

        try:
            with self.db_connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("""
                    SELECT component, status, message, timestamp
                    FROM system_health
                    ORDER BY timestamp DESC
                    LIMIT 10
                """)
                health_records = cursor.fetchall()

                # Calculate overall health
                healthy_count = sum(1 for record in health_records if record['status'] == 'healthy')
                total_count = len(health_records)

                overall_status = 'healthy' if healthy_count == total_count else 'warning' if healthy_count > 0 else 'critical'

                return {
                    'overall_status': overall_status,
                    'healthy_components': healthy_count,
                    'total_components': total_count,
                    'components': health_records
                }

        except Exception as e:
            return {'status': 'error', 'message': str(e)}

# Initialize dashboard
dashboard = AzoraDashboard()

# HTML Template for the dashboard
DASHBOARD_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AZORA Mint-Mine Integration Dashboard v2.0</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            min-height: 100vh;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            color: white;
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
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .stat-card h3 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 1.4em;
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        .stat-label {
            color: #666;
            font-size: 0.9em;
        }
        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .chart-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
        }
        .chart-card h3 {
            color: #667eea;
            margin-bottom: 20px;
            text-align: center;
        }
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        .status-healthy { background-color: #4CAF50; }
        .status-warning { background-color: #FF9800; }
        .status-critical { background-color: #F44336; }
        .status-error { background-color: #9C27B0; }
        .control-panel {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 30px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        .control-buttons {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
        }
        .btn-primary { background: #667eea; color: white; }
        .btn-primary:hover { background: #5a6fd8; transform: translateY(-2px); }
        .btn-success { background: #4CAF50; color: white; }
        .btn-success:hover { background: #45a049; transform: translateY(-2px); }
        .btn-warning { background: #FF9800; color: white; }
        .btn-warning:hover { background: #e68900; transform: translateY(-2px); }
        .price-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .price-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        .price-change {
            font-size: 0.9em;
            margin-top: 5px;
        }
        .price-positive { color: #4CAF50; }
        .price-negative { color: #F44336; }
        .footer {
            text-align: center;
            color: white;
            margin-top: 30px;
            opacity: 0.8;
        }
        @media (max-width: 768px) {
            .container { padding: 10px; }
            .header h1 { font-size: 2em; }
            .stats-grid { grid-template-columns: 1fr; }
            .charts-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 AZORA Mint-Mine Integration v2.0</h1>
            <p>Advanced Cryptocurrency Mining & Token Minting Dashboard</p>
        </div>

        <div class="stats-grid" id="stats-grid">
            <!-- Stats will be populated by JavaScript -->
        </div>

        <div class="control-panel">
            <h3>🎛️ Control Panel</h3>
            <div class="control-buttons">
                <button class="btn btn-primary" onclick="refreshData()">🔄 Refresh Data</button>
                <button class="btn btn-success" onclick="startMining()">▶️ Start Mining</button>
                <button class="btn btn-warning" onclick="stopMining()">⏹️ Stop Mining</button>
                <button class="btn btn-primary" onclick="viewLogs()">📋 View Logs</button>
                <button class="btn btn-primary" onclick="exportData()">💾 Export Data</button>
            </div>
        </div>

        <div class="charts-grid">
            <div class="chart-card">
                <h3>📈 Hourly Mining Earnings (24h)</h3>
                <div id="earnings-chart"></div>
            </div>
            <div class="chart-card">
                <h3>🪙 Daily AZR Minting (7 days)</h3>
                <div id="azr-chart"></div>
            </div>
        </div>

        <div class="charts-grid">
            <div class="chart-card">
                <h3>🔗 System Health Status</h3>
                <div id="health-status"></div>
            </div>
            <div class="chart-card">
                <h3>💰 Crypto Prices</h3>
                <div id="price-grid"></div>
            </div>
        </div>

        <div class="footer">
            <p>© 2024 AZORA OS - Advanced Mining & Token Integration Platform</p>
            <p>Last updated: <span id="last-update"></span></p>
        </div>
    </div>

    <script>
        let dashboardData = {};
        let engineStats = {};

        async function loadData() {
            try {
                const response = await fetch('/api/stats');
                const data = await response.json();
                engineStats = data;

                const healthResponse = await fetch('/api/health');
                const healthData = await healthResponse.json();

                updateDashboard(data, healthData);
            } catch (error) {
                console.error('Failed to load data:', error);
            }
        }

        function updateDashboard(stats, health) {
            updateStats(stats);
            updateHealthStatus(health);
            updatePrices(stats.prices || {});
            updateCharts();
            updateLastUpdate();
        }

        function updateStats(stats) {
            const statsGrid = document.getElementById('stats-grid');

            const mining = stats.mining || {};
            const transactions = stats.transactions || {};

            statsGrid.innerHTML = `
                <div class="stat-card">
                    <h3>⛏️ Mining Performance</h3>
                    <div class="stat-value">$${parseFloat(mining.total_earnings || 0).toFixed(4)}</div>
                    <div class="stat-label">Total Earnings (USD)</div>
                    <div style="margin-top: 10px; font-size: 0.9em; color: #666;">
                        Sessions: ${mining.total_sessions || 0}<br>
                        Avg Hashrate: ${parseFloat(mining.avg_hashrate || 0).toFixed(1)} MH/s
                    </div>
                </div>
                <div class="stat-card">
                    <h3>🪙 AZR Tokens Minted</h3>
                    <div class="stat-value">${parseFloat(mining.total_azr_minted || 0).toFixed(2)}</div>
                    <div class="stat-label">Total AZR Minted</div>
                    <div style="margin-top: 10px; font-size: 0.9em; color: #666;">
                        Conversion Rate: 100 AZR per USD
                    </div>
                </div>
                <div class="stat-card">
                    <h3>🔗 Blockchain Transactions</h3>
                    <div class="stat-value">${transactions.pending_txs || 0}</div>
                    <div class="stat-label">Pending Transactions</div>
                    <div style="margin-top: 10px; font-size: 0.9em; color: #666;">
                        Confirmed: ${transactions.confirmed_txs || 0}
                    </div>
                </div>
                <div class="stat-card">
                    <h3>⚡ System Status</h3>
                    <div class="stat-value">
                        <span class="status-indicator status-healthy"></span>Online
                    </div>
                    <div class="stat-label">Engine Status</div>
                    <div style="margin-top: 10px; font-size: 0.9em; color: #666;">
                        Last Update: ${new Date(stats.last_update || Date.now()).toLocaleTimeString()}
                    </div>
                </div>
            `;
        }

        function updateHealthStatus(health) {
            const healthDiv = document.getElementById('health-status');

            let statusClass = 'status-healthy';
            if (health.overall_status === 'warning') statusClass = 'status-warning';
            else if (health.overall_status === 'critical') statusClass = 'status-critical';
            else if (health.overall_status === 'error') statusClass = 'status-error';

            let html = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <span class="status-indicator ${statusClass}"></span>
                    <strong>${health.overall_status?.toUpperCase() || 'UNKNOWN'}</strong>
                    <br>
                    <small>${health.healthy_components || 0}/${health.total_components || 0} components healthy</small>
                </div>
                <div style="max-height: 200px; overflow-y: auto;">
            `;

            if (health.components) {
                health.components.forEach(component => {
                    let compStatusClass = 'status-healthy';
                    if (component.status === 'warning') compStatusClass = 'status-warning';
                    else if (component.status === 'error' || component.status === 'critical') compStatusClass = 'status-critical';

                    html += `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid #eee;">
                            <span>${component.component}</span>
                            <div>
                                <span class="status-indicator ${compStatusClass}"></span>
                                <span style="font-size: 0.9em;">${component.status}</span>
                            </div>
                        </div>
                    `;
                });
            }

            html += '</div>';
            healthDiv.innerHTML = html;
        }

        function updatePrices(prices) {
            const priceGrid = document.getElementById('price-grid');

            let html = '<div class="price-grid">';

            Object.entries(prices).forEach(([symbol, data]) => {
                const changeClass = (data.price_change_24h || 0) >= 0 ? 'price-positive' : 'price-negative';
                const changeSymbol = (data.price_change_24h || 0) >= 0 ? '↗️' : '↘️';

                html += `
                    <div class="price-card">
                        <div style="font-weight: bold; margin-bottom: 5px;">${symbol.toUpperCase()}</div>
                        <div style="font-size: 1.2em; font-weight: bold;">$${parseFloat(data.price_usd || 0).toFixed(4)}</div>
                        <div class="price-change ${changeClass}">
                            ${changeSymbol} ${parseFloat(data.price_change_24h || 0).toFixed(2)}%
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            priceGrid.innerHTML = html;
        }

        function updateCharts() {
            // This would integrate with Plotly for real charts
            // For now, showing placeholder
            const earningsChart = document.getElementById('earnings-chart');
            const azrChart = document.getElementById('azr-chart');

            earningsChart.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">📊 Earnings chart will be displayed here</div>';
            azrChart.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">🪙 AZR minting chart will be displayed here</div>';
        }

        function updateLastUpdate() {
            document.getElementById('last-update').textContent = new Date().toLocaleString();
        }

        // Control functions
        function refreshData() {
            loadData();
            alert('🔄 Data refreshed!');
        }

        function startMining() {
            fetch('/api/control/start-mining', { method: 'POST' })
                .then(response => response.json())
                .then(data => alert(data.message || 'Mining started!'));
        }

        function stopMining() {
            fetch('/api/control/stop-mining', { method: 'POST' })
                .then(response => response.json())
                .then(data => alert(data.message || 'Mining stopped!'));
        }

        function viewLogs() {
            window.open('/logs', '_blank');
        }

        function exportData() {
            fetch('/api/export')
                .then(response => response.blob())
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'azora-mining-data.json';
                    a.click();
                });
        }

        // Initialize
        loadData();
        setInterval(loadData, 30000); // Refresh every 30 seconds
    </script>
</body>
</html>
"""

@app.route('/')
def dashboard():
    return render_template_string(DASHBOARD_HTML)

@app.route('/api/stats')
def get_stats():
    return jsonify(dashboard.engine_stats)

@app.route('/api/health')
def get_health():
    return jsonify(dashboard.get_system_health())

@app.route('/api/control/<action>', methods=['POST'])
def control_action(action):
    if action == 'start-mining':
        # Logic to start mining
        return jsonify({'message': 'Mining engine started successfully!'})
    elif action == 'stop-mining':
        # Logic to stop mining
        return jsonify({'message': 'Mining engine stopped successfully!'})
    else:
        return jsonify({'error': 'Unknown action'}), 400

@app.route('/api/export')
def export_data():
    # Export mining data as JSON
    data = {
        'exported_at': datetime.now().isoformat(),
        'stats': dashboard.engine_stats,
        'version': '2.0'
    }
    return jsonify(data)

@app.route('/logs')
def view_logs():
    log_content = """
    <html>
    <head><title>AZORA Engine Logs</title></head>
    <body>
        <h1>AZORA Mint-Mine Engine Logs</h1>
        <pre>Log content would be displayed here...</pre>
        <a href='/'>Back to Dashboard</a>
    </body>
    </html>
    """
    return log_content

def main():
    """Main function to run the dashboard"""
    print("🚀 Starting AZORA Mint-Mine Dashboard v2.0...")
    print("📊 Dashboard available at: http://localhost:5000")
    print("🔧 API endpoints:")
    print("   GET  /api/stats  - Engine statistics")
    print("   GET  /api/health - System health")
    print("   POST /api/control/start-mining - Start mining")
    print("   POST /api/control/stop-mining  - Stop mining")
    print("   GET  /api/export - Export data")

    app.run(host='0.0.0.0', port=5000, debug=False)

if __name__ == '__main__':
    main()
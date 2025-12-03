-- AI Treasury & Enterprise Tokenomics Schema

-- Earnings ledger (tracks all mints and enforces caps)
CREATE TABLE IF NOT EXISTS earnings_ledger (
  id VARCHAR(100) PRIMARY KEY,
  user_id UUID NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'enterprise', 'business', 'governance')),
  amount DECIMAL(20, 6) NOT NULL,
  net_amount DECIMAL(20, 6) NOT NULL,
  reinvest_amount DECIMAL(20, 6) NOT NULL,
  source VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pool statistics (real-time tracking of allocations)
CREATE TABLE IF NOT EXISTS pool_statistics (
  pool_type VARCHAR(20) PRIMARY KEY CHECK (pool_type IN ('student', 'enterprise', 'business', 'governance', 'ai_treasury')),
  total_minted DECIMAL(20, 6) DEFAULT 0,
  last_mint_amount DECIMAL(20, 6),
  last_mint_user UUID,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id VARCHAR(100) PRIMARY KEY,
  action VARCHAR(50) NOT NULL,
  user_id UUID,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Initialize pool statistics
INSERT INTO pool_statistics (pool_type, total_minted) VALUES
  ('student', 0),
  ('enterprise', 0),
  ('business', 0),
  ('governance', 0),
  ('ai_treasury', 0)
ON CONFLICT (pool_type) DO NOTHING;

-- Mining and Minting Engine Tables

-- Mining sessions table
CREATE TABLE IF NOT EXISTS mining_sessions (
  id VARCHAR(100) PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id VARCHAR(100) UNIQUE NOT NULL,
  total_hashrate_mhs DECIMAL(10, 2) DEFAULT 0,
  total_earnings_usd DECIMAL(20, 6) DEFAULT 0,
  azr_minted DECIMAL(20, 6) DEFAULT 0,
  shares_accepted INTEGER DEFAULT 0,
  shares_rejected INTEGER DEFAULT 0,
  start_time TIMESTAMP DEFAULT NOW(),
  end_time TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'stopped', 'error')),
  algorithm VARCHAR(50) DEFAULT 'FishHash',
  pool_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Minting transactions table
CREATE TABLE IF NOT EXISTS minting_transactions (
  id VARCHAR(100) PRIMARY KEY,
  mining_session_id VARCHAR(100) REFERENCES mining_sessions(id),
  user_id UUID NOT NULL,
  amount_azr DECIMAL(20, 6) NOT NULL,
  amount_usd DECIMAL(20, 6) NOT NULL,
  transaction_hash VARCHAR(255),
  blockchain_status VARCHAR(20) DEFAULT 'pending' CHECK (blockchain_status IN ('pending', 'confirmed', 'failed')),
  gas_used DECIMAL(20, 6),
  gas_price DECIMAL(20, 6),
  created_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP
);

-- Crypto prices table
CREATE TABLE IF NOT EXISTS crypto_prices (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL,
  price_usd DECIMAL(20, 6) NOT NULL,
  price_change_24h DECIMAL(10, 4),
  volume_24h DECIMAL(20, 6),
  market_cap DECIMAL(30, 6),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- System health monitoring
CREATE TABLE IF NOT EXISTS system_health (
  id SERIAL PRIMARY KEY,
  component VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'warning', 'error', 'critical')),
  message TEXT,
  response_time_ms INTEGER,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Mining pool configurations
CREATE TABLE IF NOT EXISTS mining_pools (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  url VARCHAR(255) NOT NULL,
  algorithm VARCHAR(50) NOT NULL,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default mining pools
INSERT INTO mining_pools (id, name, url, algorithm, priority) VALUES
  ('ironfish', 'Iron Fish Pool', 'iron.woolypooly.com:3104', 'FishHash', 1),
  ('backup1', 'Backup Pool 1', 'pool.example.com:3333', 'FishHash', 2)
ON CONFLICT (id) DO NOTHING;

-- Indexes for mining tables
CREATE INDEX idx_mining_sessions_user ON mining_sessions(user_id, status);
CREATE INDEX idx_mining_sessions_status ON mining_sessions(status, created_at);
CREATE INDEX idx_minting_tx_user ON minting_transactions(user_id, blockchain_status);
CREATE INDEX idx_minting_tx_session ON minting_transactions(mining_session_id);
CREATE INDEX idx_crypto_prices_symbol ON crypto_prices(symbol, timestamp);
CREATE INDEX idx_system_health_component ON system_health(component, timestamp);

-- Knowledge rewards table (from existing Proof-of-Knowledge system)
CREATE TABLE IF NOT EXISTS knowledge_rewards (
  id VARCHAR(100) PRIMARY KEY,
  user_id UUID NOT NULL,
  reward_type VARCHAR(50) NOT NULL,
  reward_category VARCHAR(50) NOT NULL,
  amount DECIMAL(20, 6) NOT NULL,
  achievement TEXT,
  program_id VARCHAR(100),
  module_name VARCHAR(100),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes for knowledge rewards
CREATE INDEX idx_knowledge_rewards_user ON knowledge_rewards(user_id, timestamp);
CREATE INDEX idx_knowledge_rewards_type ON knowledge_rewards(reward_type, reward_category);

GRANT ALL PRIVILEGES ON mining_sessions TO azora_user;
GRANT ALL PRIVILEGES ON minting_transactions TO azora_user;
GRANT ALL PRIVILEGES ON crypto_prices TO azora_user;
GRANT ALL PRIVILEGES ON system_health TO azora_user;
GRANT ALL PRIVILEGES ON mining_pools TO azora_user;
GRANT ALL PRIVILEGES ON knowledge_rewards TO azora_user;

-- View: Current allocation status
CREATE OR REPLACE VIEW allocation_status AS
SELECT 
  'Enterprise' as category,
  600000 as total_allocation,
  COALESCE(SUM(amount), 0) as minted,
  600000 - COALESCE(SUM(amount), 0) as remaining,
  (COALESCE(SUM(amount), 0) / 600000 * 100) as percent_used
FROM earnings_ledger WHERE user_type = 'enterprise'
UNION ALL
SELECT 
  'Business' as category,
  200000 as total_allocation,
  COALESCE(SUM(amount), 0) as minted,
  200000 - COALESCE(SUM(amount), 0) as remaining,
  (COALESCE(SUM(amount), 0) / 200000 * 100) as percent_used
FROM earnings_ledger WHERE user_type = 'business'
UNION ALL
SELECT 
  'Student' as category,
  100000 as total_allocation,
  COALESCE(SUM(amount), 0) as minted,
  100000 - COALESCE(SUM(amount), 0) as remaining,
  (COALESCE(SUM(amount), 0) / 100000 * 100) as percent_used
FROM earnings_ledger WHERE user_type = 'student';

GRANT ALL PRIVILEGES ON earnings_ledger TO azora_user;
GRANT ALL PRIVILEGES ON pool_statistics TO azora_user;
GRANT ALL PRIVILEGES ON audit_log TO azora_user;
GRANT SELECT ON allocation_status TO azora_user;

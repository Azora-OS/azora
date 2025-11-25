-- AZORA OS Database Schema
-- PostgreSQL Schema for Treasury, Mining, and Ceremonial Ledger
-- Date: October 27, 2025
-- Constitutional Compliance: AZR 1:1 USD Valuation

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- USERS & WALLETS
-- ===========================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(255) UNIQUE NOT NULL,
    reputation_score DECIMAL(5,2) DEFAULT 0.00,
    jurisdiction VARCHAR(100),
    kyc_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- TREASURY LEDGER
-- ===========================================

CREATE TABLE treasury_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tx_hash VARCHAR(255) UNIQUE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('mint', 'burn', 'withdrawal', 'deposit', 'transfer')),
    amount_azr DECIMAL(30,8) NOT NULL,
    amount_usd DECIMAL(20,8) NOT NULL,
    treasury_allocation DECIMAL(5,4) DEFAULT 0.7000, -- 70% to treasury
    founder_allocation DECIMAL(5,4) DEFAULT 0.1100,  -- 11% to founders
    burn_allocation DECIMAL(5,4) DEFAULT 0.0500,     -- 5% to burns
    circulation_allocation DECIMAL(5,4) DEFAULT 0.2390, -- 23.9% to circulation
    recipient_address VARCHAR(255),
    sender_address VARCHAR(255),
    gas_used BIGINT,
    gas_price_wei DECIMAL(30,0),
    blockchain_status VARCHAR(50) DEFAULT 'pending',
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- ===========================================
-- MINING YIELDS & SESSIONS
-- ===========================================

CREATE TABLE mining_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    algorithm VARCHAR(100) NOT NULL,
    total_hashrate_mhs DECIMAL(10,2),
    total_earnings_usd DECIMAL(20,8) DEFAULT 0.00000000,
    azr_minted DECIMAL(30,8) DEFAULT 0.00000000,
    power_consumption_watts INTEGER DEFAULT 35,
    temperature_celsius DECIMAL(5,2) DEFAULT 65.0,
    pool_name VARCHAR(255),
    pool_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'interrupted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mining_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES mining_sessions(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    algorithm VARCHAR(100),
    hashrate_mhs DECIMAL(10,2),
    pool VARCHAR(255),
    earnings_usd DECIMAL(20,8) DEFAULT 0.00000000,
    power_consumption_watts INTEGER,
    temperature_celsius DECIMAL(5,2),
    shares_accepted INTEGER DEFAULT 0,
    shares_rejected INTEGER DEFAULT 0,
    difficulty DECIMAL(20,8),
    network_hashrate DECIMAL(20,2)
);

-- ===========================================
-- FOUNDER COMPENSATION
-- ===========================================

CREATE TABLE founder_compensation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    founder_id UUID REFERENCES users(id),
    founder_name VARCHAR(255) NOT NULL,
    amount_azr DECIMAL(30,8) NOT NULL,
    amount_usd DECIMAL(20,8) NOT NULL,
    month DATE NOT NULL,
    compensation_type VARCHAR(50) DEFAULT 'monthly' CHECK (compensation_type IN ('monthly', 'bonus', 'equity', 'special')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
    tx_hash VARCHAR(255),
    payment_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- CEREMONIAL EVENTS
-- ===========================================

CREATE TABLE ceremonial_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL CHECK (event_type IN ('burn_ritual', 'treasury_report', 'founder_payment', 'constitutional_amendment', 'sovereignty_declaration', 'embassy_establishment')),
    event_title VARCHAR(500) NOT NULL,
    description TEXT,
    azr_amount DECIMAL(30,8),
    usd_value DECIMAL(20,8),
    treasury_impact VARCHAR(50) CHECK (treasury_impact IN ('neutral', 'positive', 'negative')),
    constitutional_reference VARCHAR(255),
    ceremony_date TIMESTAMP WITH TIME ZONE,
    execution_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    officiant VARCHAR(255),
    witnesses TEXT[], -- Array of witness names/addresses
    documentation_url VARCHAR(500),
    blockchain_tx_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ===========================================
-- PRICE ORACLE & MARKET DATA
-- ===========================================

CREATE TABLE crypto_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    price_usd DECIMAL(20,8) NOT NULL,
    market_cap_usd DECIMAL(30,2),
    volume_24h_usd DECIMAL(30,2),
    price_change_24h DECIMAL(10,4),
    source VARCHAR(50) DEFAULT 'coingecko',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mining_pool_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pool_name VARCHAR(255) NOT NULL,
    algorithm VARCHAR(100) NOT NULL,
    hashrate_th DECIMAL(15,2),
    miners_count INTEGER,
    fee_percentage DECIMAL(5,2),
    payout_scheme VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- COMPLIANCE & AUDIT
-- ===========================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE compliance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_type VARCHAR(100) NOT NULL,
    report_period_start DATE,
    report_period_end DATE,
    total_transactions INTEGER,
    total_volume_azr DECIMAL(30,8),
    total_volume_usd DECIMAL(30,8),
    treasury_balance_azr DECIMAL(30,8),
    treasury_balance_usd DECIMAL(30,8),
    compliance_status VARCHAR(50) DEFAULT 'compliant',
    findings JSONB,
    recommendations TEXT,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    generated_by UUID REFERENCES users(id)
);

-- ===========================================
-- SYSTEM HEALTH & MONITORING
-- ===========================================

CREATE TABLE system_health (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('healthy', 'warning', 'critical', 'offline')),
    metric_name VARCHAR(255),
    metric_value DECIMAL(20,8),
    threshold_warning DECIMAL(20,8),
    threshold_critical DECIMAL(20,8),
    message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    component VARCHAR(100),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- Treasury Ledger Indexes
CREATE INDEX idx_treasury_ledger_tx_hash ON treasury_ledger(tx_hash);
CREATE INDEX idx_treasury_ledger_type ON treasury_ledger(transaction_type);
CREATE INDEX idx_treasury_ledger_status ON treasury_ledger(blockchain_status);
CREATE INDEX idx_treasury_ledger_created ON treasury_ledger(created_at);

-- Mining Indexes
CREATE INDEX idx_mining_sessions_user ON mining_sessions(user_id);
CREATE INDEX idx_mining_sessions_status ON mining_sessions(status);
CREATE INDEX idx_mining_sessions_created ON mining_sessions(created_at);
CREATE INDEX idx_mining_statistics_session ON mining_statistics(session_id);
CREATE INDEX idx_mining_statistics_timestamp ON mining_statistics(timestamp);

-- Founder Compensation Indexes
CREATE INDEX idx_founder_compensation_founder ON founder_compensation(founder_id);
CREATE INDEX idx_founder_compensation_month ON founder_compensation(month);
CREATE INDEX idx_founder_compensation_status ON founder_compensation(status);

-- Ceremonial Events Indexes
CREATE INDEX idx_ceremonial_events_type ON ceremonial_events(event_type);
CREATE INDEX idx_ceremonial_events_status ON ceremonial_events(status);
CREATE INDEX idx_ceremonial_events_date ON ceremonial_events(ceremony_date);

-- Price Data Indexes
CREATE INDEX idx_crypto_prices_symbol ON crypto_prices(symbol);
CREATE INDEX idx_crypto_prices_timestamp ON crypto_prices(timestamp);

-- Audit & Compliance Indexes
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX idx_compliance_reports_period ON compliance_reports(report_period_start, report_period_end);

-- System Monitoring Indexes
CREATE INDEX idx_system_health_component ON system_health(component);
CREATE INDEX idx_system_health_timestamp ON system_health(timestamp);
CREATE INDEX idx_alerts_type ON alerts(alert_type);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_resolved ON alerts(resolved);

-- ===========================================
-- TRIGGERS FOR AUTOMATION
-- ===========================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_founder_compensation_updated_at BEFORE UPDATE ON founder_compensation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- VIEWS FOR REPORTING
-- ===========================================

-- Treasury Summary View
CREATE VIEW treasury_summary AS
SELECT
    DATE_TRUNC('month', created_at) as month,
    transaction_type,
    COUNT(*) as transaction_count,
    SUM(amount_azr) as total_azr,
    SUM(amount_usd) as total_usd,
    AVG(treasury_allocation) as avg_treasury_allocation,
    AVG(founder_allocation) as avg_founder_allocation,
    AVG(burn_allocation) as avg_burn_allocation,
    AVG(circulation_allocation) as avg_circulation_allocation
FROM treasury_ledger
WHERE blockchain_status = 'confirmed'
GROUP BY DATE_TRUNC('month', created_at), transaction_type
ORDER BY month DESC, transaction_type;

-- Mining Performance View
CREATE VIEW mining_performance AS
SELECT
    DATE_TRUNC('day', ms.created_at) as date,
    ms.algorithm,
    COUNT(DISTINCT ms.id) as sessions_count,
    AVG(ms.total_hashrate_mhs) as avg_hashrate_mhs,
    SUM(ms.total_earnings_usd) as total_earnings_usd,
    SUM(ms.azr_minted) as total_azr_minted,
    AVG(ms.power_consumption_watts) as avg_power_watts,
    AVG(ms.temperature_celsius) as avg_temperature_c
FROM mining_sessions ms
WHERE ms.status = 'completed'
GROUP BY DATE_TRUNC('day', ms.created_at), ms.algorithm
ORDER BY date DESC;

-- Founder Compensation Summary View
CREATE VIEW founder_compensation_summary AS
SELECT
    fc.founder_name,
    DATE_TRUNC('month', fc.month) as month,
    SUM(fc.amount_azr) as total_azr_compensation,
    SUM(fc.amount_usd) as total_usd_compensation,
    COUNT(*) as payments_count,
    AVG(fc.amount_usd) as avg_monthly_compensation
FROM founder_compensation fc
WHERE fc.status = 'paid'
GROUP BY fc.founder_name, DATE_TRUNC('month', fc.month)
ORDER BY founder_name, month DESC;

-- ===========================================
-- INITIAL DATA SEEDING
-- ===========================================

-- Insert default admin user (Sizwe)
INSERT INTO users (wallet_address, reputation_score, jurisdiction, kyc_status)
VALUES ('0x742d35Cc6634C0532925a3b844Bc454e4438f44e', 100.00, 'South Africa', 'verified')
ON CONFLICT (wallet_address) DO NOTHING;

-- Insert ceremonial foundation event
INSERT INTO ceremonial_events (
    event_type,
    event_title,
    description,
    azr_amount,
    usd_value,
    constitutional_reference,
    status,
    officiant
) VALUES (
    'sovereignty_declaration',
    'AZORA OS Genesis Declaration',
    'Foundational ceremony establishing AZORA OS as a sovereign economic system with 1:1 AZR/USD valuation',
    0,
    0,
    'Article 1: AZR Valuation Standard',
    'completed',
    'Sizwe - Executive Director',
    ARRAY['Constitutional AI', 'AZORA Aegis Guardian'],
    NULL,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;

-- ===========================================
-- ROW LEVEL SECURITY (Optional)
-- ===========================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_compensation ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only see their own data)
CREATE POLICY users_own_data ON users
    FOR ALL USING (id = current_setting('app.current_user_id')::UUID);

CREATE POLICY treasury_user_access ON treasury_ledger
    FOR SELECT USING (recipient_address = current_setting('app.current_user_wallet') OR sender_address = current_setting('app.current_user_wallet'));

-- ===========================================
-- COMMENTS FOR DOCUMENTATION
-- ===========================================

COMMENT ON TABLE users IS 'User accounts with wallet addresses and reputation scores';
COMMENT ON TABLE treasury_ledger IS 'Complete audit trail of all AZR transactions and treasury movements';
COMMENT ON TABLE mining_sessions IS 'Mining sessions with performance metrics and earnings tracking';
COMMENT ON TABLE mining_statistics IS 'Real-time mining statistics and performance data';
COMMENT ON TABLE founder_compensation IS 'Monthly founder compensation payments (R10,000/month equivalent)';
COMMENT ON TABLE ceremonial_events IS 'Constitutional ceremonies, burn rituals, and sovereignty events';
COMMENT ON TABLE crypto_prices IS 'Cryptocurrency price data from oracles for mining profitability';
COMMENT ON TABLE audit_log IS 'Complete audit trail of all system actions and changes';
COMMENT ON TABLE compliance_reports IS 'Regulatory compliance reports and findings';
COMMENT ON TABLE system_health IS 'System component health monitoring and metrics';
COMMENT ON TABLE alerts IS 'System alerts and notifications with resolution tracking';

COMMENT ON COLUMN treasury_ledger.treasury_allocation IS '70% of all transactions allocated to treasury reserves';
COMMENT ON COLUMN treasury_ledger.founder_allocation IS '11% allocated to founder compensation';
COMMENT ON COLUMN treasury_ledger.burn_allocation IS '5% allocated to ceremonial burns';
COMMENT ON COLUMN treasury_ledger.circulation_allocation IS '23.9% allocated to market circulation';

-- ===========================================
-- CONSTITUTIONAL COMPLIANCE CONSTRAINTS
-- ===========================================

-- Ensure AZR/USD 1:1 valuation is maintained
ALTER TABLE treasury_ledger
ADD CONSTRAINT constitutional_valuation_check
CHECK (amount_azr = amount_usd);

-- Ensure treasury allocations sum to 100%
ALTER TABLE treasury_ledger
ADD CONSTRAINT treasury_allocation_check
CHECK (treasury_allocation + founder_allocation + burn_allocation + circulation_allocation = 1.0000);

-- ===========================================
-- FINAL NOTES
-- ===========================================

/*
AZORA OS Database Schema v1.0
- Constitutional Compliance: AZR 1:1 USD valuation enforced
- Treasury Allocation: 70% reserves, 11% founders, 5% burns, 23.9% circulation
- Sovereignty: Complete data ownership and audit trails
- Scalability: Indexed for high-performance queries
- Security: Row-level security and comprehensive audit logging

To apply this schema:
1. Connect to PostgreSQL as superuser
2. CREATE DATABASE azora_os;
3. CREATE USER azora WITH PASSWORD 'your_secure_password';
4. GRANT ALL PRIVILEGES ON DATABASE azora_os TO azora;
5. Run this script as the azora user

Next steps after schema creation:
1. Set up environment variables
2. Configure application connections
3. Run initial data migrations
4. Set up automated backups
*/
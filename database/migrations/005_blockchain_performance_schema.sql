-- AZORA BLOCKCHAIN AND PERFORMANCE OPTIMIZATION DATABASE SCHEMA
-- Migration for blockchain logging and performance optimization features

-- Blockchain logging tables
CREATE TABLE IF NOT EXISTS blockchain_blocks (
    id VARCHAR(255) PRIMARY KEY,
    height INTEGER NOT NULL UNIQUE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    entries_count INTEGER NOT NULL DEFAULT 0,
    previous_block_hash VARCHAR(64) NOT NULL,
    merkle_root VARCHAR(64) NOT NULL,
    hash VARCHAR(64) NOT NULL UNIQUE,
    signature TEXT NOT NULL,
    validator VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blockchain_entries (
    id VARCHAR(255) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    event_type VARCHAR(255) NOT NULL,
    data JSONB NOT NULL,
    hash VARCHAR(64) NOT NULL UNIQUE,
    previous_hash VARCHAR(64) NOT NULL,
    block_height INTEGER,
    validator VARCHAR(255) NOT NULL,
    signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS block_entries (
    block_id VARCHAR(255) NOT NULL REFERENCES blockchain_blocks(id) ON DELETE CASCADE,
    entry_id VARCHAR(255) NOT NULL REFERENCES blockchain_entries(id) ON DELETE CASCADE,
    PRIMARY KEY (block_id, entry_id)
);

-- Performance optimization tables
CREATE TABLE IF NOT EXISTS performance_metrics (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    service VARCHAR(255) NOT NULL,
    operation VARCHAR(255) NOT NULL,
    duration DECIMAL(10,3) NOT NULL,
    memory_usage JSONB,
    cpu_usage JSONB,
    throughput DECIMAL(10,3) NOT NULL DEFAULT 0,
    error_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
    cache_hit_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
    database_connections INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS query_logs (
    id SERIAL PRIMARY KEY,
    service VARCHAR(255) NOT NULL,
    query_text TEXT NOT NULL,
    parameters JSONB,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration DECIMAL(10,3),
    error_message TEXT,
    rows_affected INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS query_optimizations (
    id SERIAL PRIMARY KEY,
    query_hash VARCHAR(64) NOT NULL UNIQUE,
    original_query TEXT NOT NULL,
    optimized_query TEXT NOT NULL,
    original_time DECIMAL(10,3) NOT NULL,
    optimized_time DECIMAL(10,3) NOT NULL,
    improvement DECIMAL(5,2) NOT NULL,
    indexes JSONB NOT NULL DEFAULT '[]',
    execution_plan JSONB,
    applied BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cache_entries (
    id SERIAL PRIMARY KEY,
    cache_key VARCHAR(255) NOT NULL UNIQUE,
    service VARCHAR(255) NOT NULL,
    ttl_seconds INTEGER NOT NULL,
    size_bytes INTEGER NOT NULL,
    hits INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS resource_pools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    max_connections INTEGER NOT NULL,
    current_connections INTEGER NOT NULL DEFAULT 0,
    queue_length INTEGER NOT NULL DEFAULT 0,
    avg_response_time DECIMAL(10,3) NOT NULL DEFAULT 0,
    error_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blockchain_blocks_height ON blockchain_blocks(height);
CREATE INDEX IF NOT EXISTS idx_blockchain_blocks_hash ON blockchain_blocks(hash);
CREATE INDEX IF NOT EXISTS idx_blockchain_entries_event_type ON blockchain_entries(event_type);
CREATE INDEX IF NOT EXISTS idx_blockchain_entries_block_height ON blockchain_entries(block_height);
CREATE INDEX IF NOT EXISTS idx_blockchain_entries_timestamp ON blockchain_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_blockchain_entries_hash ON blockchain_entries(hash);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_service ON performance_metrics(service);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_operation ON performance_metrics(operation);

CREATE INDEX IF NOT EXISTS idx_query_logs_service ON query_logs(service);
CREATE INDEX IF NOT EXISTS idx_query_logs_started_at ON query_logs(started_at);
CREATE INDEX IF NOT EXISTS idx_query_logs_duration ON query_logs(duration);

CREATE INDEX IF NOT EXISTS idx_query_optimizations_query_hash ON query_optimizations(query_hash);
CREATE INDEX IF NOT EXISTS idx_query_optimizations_improvement ON query_optimizations(improvement);

CREATE INDEX IF NOT EXISTS idx_cache_entries_service ON cache_entries(service);
CREATE INDEX IF NOT EXISTS idx_cache_entries_expires_at ON cache_entries(expires_at);
CREATE INDEX IF NOT EXISTS idx_cache_entries_last_accessed ON cache_entries(last_accessed);

CREATE INDEX IF NOT EXISTS idx_resource_pools_type ON resource_pools(type);
CREATE INDEX IF NOT EXISTS idx_resource_pools_last_updated ON resource_pools(last_updated);

-- Triggers for automatic updates
CREATE OR REPLACE FUNCTION update_resource_pool_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_resource_pools_updated
    BEFORE UPDATE ON resource_pools
    FOR EACH ROW
    EXECUTE FUNCTION update_resource_pool_timestamp();

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM cache_entries WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get blockchain statistics
CREATE OR REPLACE FUNCTION get_blockchain_stats()
RETURNS TABLE (
    total_blocks BIGINT,
    total_entries BIGINT,
    current_height INTEGER,
    latest_block_timestamp TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM blockchain_blocks) as total_blocks,
        (SELECT COUNT(*) FROM blockchain_entries) as total_entries,
        (SELECT COALESCE(MAX(height), 0) FROM blockchain_blocks) as current_height,
        (SELECT MAX(timestamp) FROM blockchain_blocks) as latest_block_timestamp;
END;
$$ LANGUAGE plpgsql;

-- Function to validate blockchain integrity
CREATE OR REPLACE FUNCTION validate_blockchain_integrity()
RETURNS TABLE (
    block_height INTEGER,
    is_valid BOOLEAN,
    error_message TEXT
) AS $$
DECLARE
    block_record RECORD;
    prev_hash VARCHAR(64) := '0000000000000000000000000000000000000000000000000000000000000000';
BEGIN
    FOR block_record IN SELECT * FROM blockchain_blocks ORDER BY height LOOP
        -- Check previous hash chain
        IF block_record.previous_block_hash != prev_hash THEN
            RETURN QUERY SELECT block_record.height, FALSE, 'Previous hash mismatch'::TEXT;
            CONTINUE;
        END IF;

        -- Check block hash
        IF block_record.hash != calculate_block_hash(block_record.id, block_record.height, block_record.timestamp, block_record.previous_block_hash, block_record.merkle_root, block_record.validator) THEN
            RETURN QUERY SELECT block_record.height, FALSE, 'Block hash mismatch'::TEXT;
            CONTINUE;
        END IF;

        -- Mark as valid
        RETURN QUERY SELECT block_record.height, TRUE, NULL::TEXT;

        -- Update previous hash for next iteration
        prev_hash := block_record.hash;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Helper function for block hash calculation (simplified)
CREATE OR REPLACE FUNCTION calculate_block_hash(
    block_id VARCHAR(255),
    block_height INTEGER,
    block_timestamp TIMESTAMP WITH TIME ZONE,
    prev_hash VARCHAR(64),
    merkle_root VARCHAR(64),
    validator VARCHAR(255)
)
RETURNS VARCHAR(64) AS $$
DECLARE
    data_to_hash TEXT;
BEGIN
    data_to_hash := block_id || block_height::TEXT || block_timestamp::TEXT || prev_hash || merkle_root || validator;
    RETURN encode(digest(data_to_hash, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Insert initial resource pool configurations
INSERT INTO resource_pools (name, type, max_connections) VALUES
    ('database', 'database', 20),
    ('redis', 'redis', 10),
    ('api', 'api', 100),
    ('worker', 'worker', 50)
ON CONFLICT (name) DO NOTHING;

-- Insert genesis block if not exists
INSERT INTO blockchain_blocks (id, height, timestamp, entries_count, previous_block_hash, merkle_root, hash, signature, validator)
SELECT
    'genesis-block',
    0,
    '2025-01-01 00:00:00+00',
    0,
    '0000000000000000000000000000000000000000000000000000000000000000',
    '0000000000000000000000000000000000000000000000000000000000000000',
    encode(digest('Azora Blockchain Logger Genesis Block', 'sha256'), 'hex'),
    'genesis-signature',
    'azora-primary-validator'
WHERE NOT EXISTS (SELECT 1 FROM blockchain_blocks WHERE height = 0);

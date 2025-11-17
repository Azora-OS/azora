-- Constitutional AI Audit Log Schema
-- PostgreSQL schema for storing constitutional validation audit logs

-- Create audit logs table
CREATE TABLE IF NOT EXISTS constitutional_audit_logs (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    query TEXT NOT NULL,
    original_output TEXT NOT NULL,
    validated_output TEXT NOT NULL,
    violations JSONB NOT NULL,
    compliance_score INTEGER NOT NULL CHECK (compliance_score >= 0 AND compliance_score <= 100),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    tier VARCHAR(50) NOT NULL,
    processing_time INTEGER NOT NULL, -- milliseconds
    encrypted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON constitutional_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON constitutional_audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_compliance_score ON constitutional_audit_logs(compliance_score);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tier ON constitutional_audit_logs(tier);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON constitutional_audit_logs(user_id, timestamp DESC);

-- Create GIN index for JSONB violations column for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_violations ON constitutional_audit_logs USING GIN (violations);

-- Create compliance metrics materialized view for fast analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS constitutional_compliance_metrics AS
SELECT
    DATE_TRUNC('day', timestamp) as date,
    tier,
    COUNT(*) as total_validations,
    COUNT(*) FILTER (WHERE compliance_score >= 70) as successful_validations,
    COUNT(*) FILTER (WHERE compliance_score < 70) as failed_validations,
    ROUND(AVG(compliance_score)::numeric, 2) as avg_compliance_score,
    ROUND(AVG(processing_time)::numeric, 2) as avg_processing_time,
    COUNT(*) FILTER (WHERE jsonb_array_length(violations) > 0) as validations_with_violations
FROM constitutional_audit_logs
GROUP BY DATE_TRUNC('day', timestamp), tier;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_compliance_metrics_date ON constitutional_compliance_metrics(date DESC);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_compliance_metrics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY constitutional_compliance_metrics;
END;
$$ LANGUAGE plpgsql;

-- Create violation statistics view
CREATE OR REPLACE VIEW constitutional_violation_stats AS
SELECT
    DATE_TRUNC('day', timestamp) as date,
    jsonb_array_elements(violations)->>'type' as violation_type,
    COUNT(*) as violation_count,
    AVG(compliance_score) as avg_compliance_score
FROM constitutional_audit_logs
WHERE jsonb_array_length(violations) > 0
GROUP BY DATE_TRUNC('day', timestamp), jsonb_array_elements(violations)->>'type';

-- Create function to clean up old logs based on retention policy
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM constitutional_audit_logs
    WHERE timestamp < NOW() - (retention_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_audit_logs_updated_at
    BEFORE UPDATE ON constitutional_audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to get user compliance summary
CREATE OR REPLACE FUNCTION get_user_compliance_summary(
    p_user_id VARCHAR(255),
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_validations BIGINT,
    successful_validations BIGINT,
    failed_validations BIGINT,
    avg_compliance_score NUMERIC,
    most_common_violation TEXT,
    avg_processing_time NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) as total_validations,
        COUNT(*) FILTER (WHERE compliance_score >= 70) as successful_validations,
        COUNT(*) FILTER (WHERE compliance_score < 70) as failed_validations,
        ROUND(AVG(compliance_score)::numeric, 2) as avg_compliance_score,
        (
            SELECT jsonb_array_elements(violations)->>'type'
            FROM constitutional_audit_logs
            WHERE user_id = p_user_id
                AND timestamp >= NOW() - (p_days || ' days')::INTERVAL
                AND jsonb_array_length(violations) > 0
            GROUP BY jsonb_array_elements(violations)->>'type'
            ORDER BY COUNT(*) DESC
            LIMIT 1
        ) as most_common_violation,
        ROUND(AVG(processing_time)::numeric, 2) as avg_processing_time
    FROM constitutional_audit_logs
    WHERE user_id = p_user_id
        AND timestamp >= NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Create function to get system-wide compliance trends
CREATE OR REPLACE FUNCTION get_compliance_trends(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    date DATE,
    total_validations BIGINT,
    avg_compliance_score NUMERIC,
    success_rate NUMERIC,
    ubuntu_violations BIGINT,
    bias_violations BIGINT,
    privacy_violations BIGINT,
    harm_violations BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE_TRUNC('day', timestamp)::DATE as date,
        COUNT(*) as total_validations,
        ROUND(AVG(compliance_score)::numeric, 2) as avg_compliance_score,
        ROUND((COUNT(*) FILTER (WHERE compliance_score >= 70)::NUMERIC / COUNT(*)::NUMERIC * 100), 2) as success_rate,
        COUNT(*) FILTER (WHERE violations @> '[{"type": "ubuntu"}]'::jsonb) as ubuntu_violations,
        COUNT(*) FILTER (WHERE violations @> '[{"type": "bias"}]'::jsonb) as bias_violations,
        COUNT(*) FILTER (WHERE violations @> '[{"type": "privacy"}]'::jsonb) as privacy_violations,
        COUNT(*) FILTER (WHERE violations @> '[{"type": "harm"}]'::jsonb) as harm_violations
    FROM constitutional_audit_logs
    WHERE timestamp >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY DATE_TRUNC('day', timestamp)
    ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT ON constitutional_audit_logs TO app_user;
-- GRANT SELECT ON constitutional_compliance_metrics TO app_user;
-- GRANT SELECT ON constitutional_violation_stats TO app_user;
-- GRANT EXECUTE ON FUNCTION cleanup_old_audit_logs TO app_admin;
-- GRANT EXECUTE ON FUNCTION get_user_compliance_summary TO app_user;
-- GRANT EXECUTE ON FUNCTION get_compliance_trends TO app_user;

-- Create scheduled job to refresh metrics (requires pg_cron extension)
-- SELECT cron.schedule('refresh-compliance-metrics', '0 * * * *', 'SELECT refresh_compliance_metrics()');

-- Create scheduled job to cleanup old logs (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-old-audit-logs', '0 2 * * *', 'SELECT cleanup_old_audit_logs(90)');

-- Comments for documentation
COMMENT ON TABLE constitutional_audit_logs IS 'Audit logs for Constitutional AI validation results';
COMMENT ON COLUMN constitutional_audit_logs.id IS 'Unique identifier for the audit log entry';
COMMENT ON COLUMN constitutional_audit_logs.user_id IS 'ID of the user who made the request';
COMMENT ON COLUMN constitutional_audit_logs.query IS 'Original user query';
COMMENT ON COLUMN constitutional_audit_logs.original_output IS 'AI output before constitutional validation';
COMMENT ON COLUMN constitutional_audit_logs.validated_output IS 'AI output after constitutional validation and mitigation';
COMMENT ON COLUMN constitutional_audit_logs.violations IS 'JSON array of detected violations';
COMMENT ON COLUMN constitutional_audit_logs.compliance_score IS 'Overall compliance score (0-100)';
COMMENT ON COLUMN constitutional_audit_logs.tier IS 'AI tier used (local, rap, external)';
COMMENT ON COLUMN constitutional_audit_logs.processing_time IS 'Validation processing time in milliseconds';
COMMENT ON COLUMN constitutional_audit_logs.encrypted IS 'Whether sensitive data is encrypted';

COMMENT ON MATERIALIZED VIEW constitutional_compliance_metrics IS 'Aggregated compliance metrics for analytics';
COMMENT ON VIEW constitutional_violation_stats IS 'Statistics on violations by type and date';

COMMENT ON FUNCTION cleanup_old_audit_logs IS 'Removes audit logs older than specified retention period';
COMMENT ON FUNCTION get_user_compliance_summary IS 'Returns compliance summary for a specific user';
COMMENT ON FUNCTION get_compliance_trends IS 'Returns system-wide compliance trends over time';

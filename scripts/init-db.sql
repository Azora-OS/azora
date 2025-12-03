-- Azora Database Initialization Script
-- This script runs automatically when the PostgreSQL container is first created

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Note: vector extension requires pgvector to be installed
-- For now, we'll skip it since the embedding field is commented out
-- Uncomment when ready to enable vector search:
-- CREATE EXTENSION IF NOT EXISTS "vector";

-- Create initial schema
CREATE SCHEMA IF NOT EXISTS public;

-- Grant permissions
GRANT ALL ON SCHEMA public TO azora;
GRANT ALL ON ALL TABLES IN SCHEMA public TO azora;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO azora;

-- Log successful initialization
DO $$
BEGIN
  RAISE NOTICE 'Azora database initialized successfully';
END $$;

-- Azora OS Database Initialization
-- Creates all required databases for microservices

-- Create databases
CREATE DATABASE IF NOT EXISTS azora_auth;
CREATE DATABASE IF NOT EXISTS azora_mint;
CREATE DATABASE IF NOT EXISTS azora_forge;
CREATE DATABASE IF NOT EXISTS azora_lms;
CREATE DATABASE IF NOT EXISTS azora_education;
CREATE DATABASE IF NOT EXISTS azora_ai_family;
CREATE DATABASE IF NOT EXISTS azora_notification;
CREATE DATABASE IF NOT EXISTS azora_analytics;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE azora_auth TO azora;
GRANT ALL PRIVILEGES ON DATABASE azora_mint TO azora;
GRANT ALL PRIVILEGES ON DATABASE azora_forge TO azora;
GRANT ALL PRIVILEGES ON DATABASE azora_lms TO azora;
GRANT ALL PRIVILEGES ON DATABASE azora_education TO azora;
GRANT ALL PRIVILEGES ON DATABASE azora_ai_family TO azora;
GRANT ALL PRIVILEGES ON DATABASE azora_notification TO azora;
GRANT ALL PRIVILEGES ON DATABASE azora_analytics TO azora;

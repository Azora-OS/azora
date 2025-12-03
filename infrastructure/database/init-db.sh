#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE azora_auth;
    CREATE DATABASE azora_education;
    GRANT ALL PRIVILEGES ON DATABASE azora_auth TO azora;
    GRANT ALL PRIVILEGES ON DATABASE azora_education TO azora;
EOSQL

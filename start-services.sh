#!/bin/bash

# Start api-gateway
cd services/api-gateway
npm start &
cd ../../

# Start auth-service
cd services/auth-service
npm start &
cd ../../

# Start database-service
cd services/database-service
npm start &
cd ../../

# Start logger-service
cd services/logger-service
npm start &
cd ../../

# Start ai-knowledge-base
cd services/ai-knowledge-base
npm start &
cd ../../

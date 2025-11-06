#!/bin/bash

# This script is intended to run database migrations for the Azora OS project.

set -e

# Define the migration command
MIGRATION_COMMAND="npx sequelize-cli db:migrate"

# Run the migration command
echo "Running database migrations..."
$MIGRATION_COMMAND

echo "Database migrations completed successfully."
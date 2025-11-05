#!/bin/bash

# Linting script for Azora OS
# This script runs the linter on the codebase to ensure code quality and adherence to style guidelines.

# Define the directories to lint
DIRECTORIES=(
  "contracts"
  "services"
  "ai-models"
  "frontend"
  "scripts"
)

# Run the linter on each directory
for DIR in "${DIRECTORIES[@]}"; do
  echo "Linting $DIR..."
  # Assuming we are using ESLint for JavaScript/TypeScript and flake8 for Python
  if [ -d "$DIR" ]; then
    if [ -f "$DIR/.eslintrc.js" ]; then
      eslint "$DIR" --fix
    elif [ -d "$DIR/ai-models" ]; then
      flake8 "$DIR"
    fi
  fi
done

echo "Linting completed."
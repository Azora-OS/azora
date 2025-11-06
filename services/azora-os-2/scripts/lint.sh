#!/bin/bash

# Linting script for Azora OS project
# This script checks the code quality and style using ESLint for JavaScript/TypeScript files
# and Flake8 for Python files.

# Define directories to lint
JS_DIR="./services"
TS_DIR="./frontend"
PY_DIR="./ai-models"

# Run ESLint for JavaScript and TypeScript files
echo "Running ESLint..."
eslint $JS_DIR/**/*.js $TS_DIR/**/*.ts

# Run Flake8 for Python files
echo "Running Flake8..."
flake8 $PY_DIR/**/*.py

echo "Linting completed."
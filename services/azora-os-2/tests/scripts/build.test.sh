#!/bin/bash

# This script is intended to run the build process for the Azora OS project.
# It will compile the necessary files and prepare the application for deployment.

# Exit immediately if a command exits with a non-zero status.
set -e

# Define the build directory
BUILD_DIR="./build"

# Create the build directory if it doesn't exist
mkdir -p $BUILD_DIR

# Compile TypeScript files
echo "Compiling TypeScript files..."
tsc

# Copy necessary files to the build directory
echo "Copying files to the build directory..."
cp -R ./frontend/apps/* $BUILD_DIR/
cp -R ./services/* $BUILD_DIR/
cp -R ./ai-models/* $BUILD_DIR/
cp -R ./contracts/* $BUILD_DIR/

# Notify completion
echo "Build process completed successfully."
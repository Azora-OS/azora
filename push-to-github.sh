#!/bin/bash
# Script to push everything to GitHub
# Run this after git is installed

cd /media/sizwe/OS/azora-os

echo "Checking git status..."
git status

echo "Adding all changes..."
git add .

echo "Committing changes..."
git commit -m "Update: Push all changes to GitHub - $(date '+%Y-%m-%d %H:%M:%S')"

echo "Pushing to GitHub..."
git push origin main

echo "Done!"


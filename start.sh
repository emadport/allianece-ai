#!/bin/bash

# Start script for Alliance AI
# Ensures Node 20 is used and starts both servers

set -e

echo "🚀 Starting Alliance AI..."

# Load nvm if available
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    source "$HOME/.nvm/nvm.sh"
fi

# Use Node 20
echo "📦 Switching to Node.js 20..."
nvm use 20

# Check Node version
NODE_VERSION=$(node -v)
echo "✅ Using Node.js $NODE_VERSION"

# Check if ports are free
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port 3000 is in use. Stopping..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port 8000 is in use. Stopping..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Start servers
echo ""
echo "🎯 Starting frontend and backend..."
npm run dev:all


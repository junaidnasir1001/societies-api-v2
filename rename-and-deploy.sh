#!/bin/bash

# Professional script to rename existing directory and deploy new version
# This keeps your existing setup and adds the new version alongside

set -e

echo "🚀 Professional deployment with directory rename..."

# Check if societies-api directory exists
if [ -d "societies-api" ]; then
    echo "📁 Found existing societies-api directory"
    
    # Rename existing directory
    RENAME_TO="societies-api-old-$(date +%Y%m%d-%H%M%S)"
    echo "🔄 Renaming existing directory to: $RENAME_TO"
    mv societies-api $RENAME_TO
    
    echo "✅ Existing directory renamed to: $RENAME_TO"
    echo "📋 You can access old version at: $RENAME_TO"
fi

# Clone fresh repository with new name
echo "📥 Cloning fresh repository..."
git clone https://github.com/boldspace/societies-api.git societies-api-new
cd societies-api-new

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js already installed: $(node --version)"
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
else
    echo "✅ PM2 already installed: $(pm2 --version)"
fi

# Stop existing process if running
echo "🔄 Stopping existing process..."
pm2 stop societies-api 2>/dev/null || true
pm2 delete societies-api 2>/dev/null || true

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Set environment variables
export NODE_ENV=production
export PORT=3001

# Start application
echo "🚀 Starting application..."
pm2 start src/api-server.js --name "societies-api" --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup

echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Application Status:"
pm2 status
echo ""
echo "🌐 API Endpoints:"
echo "  Health: http://localhost:3001/health"
echo "  API Info: http://localhost:3001/api/info"
echo ""
echo "📁 Directory Structure:"
echo "  New version: societies-api-new/"
echo "  Old version: $RENAME_TO/"
echo ""
echo "📋 Useful Commands:"
echo "  View logs: pm2 logs societies-api"
echo "  Monitor: pm2 monit"
echo "  Restart: pm2 restart societies-api"

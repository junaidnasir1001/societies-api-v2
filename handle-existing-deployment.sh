#!/bin/bash

# Professional deployment script for existing directory
# Handles backup, update, and deployment gracefully

set -e

echo "🚀 Professional deployment to existing societies-api directory..."

# Check if societies-api directory exists
if [ -d "societies-api" ]; then
    echo "📁 Found existing societies-api directory"
    
    # Create backup with timestamp
    BACKUP_NAME="societies-api-backup-$(date +%Y%m%d-%H%M%S)"
    echo "💾 Creating backup: $BACKUP_NAME"
    mv societies-api $BACKUP_NAME
    
    echo "✅ Backup created: $BACKUP_NAME"
    echo "📋 You can restore from backup if needed: mv $BACKUP_NAME societies-api"
fi

# Clone fresh repository
echo "📥 Cloning fresh repository..."
git clone https://github.com/boldspace/societies-api.git
cd societies-api

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
echo "📋 Backup Information:"
echo "  Backup location: $BACKUP_NAME"
echo "  To restore: mv $BACKUP_NAME societies-api"
echo ""
echo "📋 Useful Commands:"
echo "  View logs: pm2 logs societies-api"
echo "  Monitor: pm2 monit"
echo "  Restart: pm2 restart societies-api"

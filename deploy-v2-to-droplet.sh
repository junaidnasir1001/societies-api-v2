#!/bin/bash

# Deploy societies-api-v2 to DigitalOcean droplet
# This script handles the new repository deployment

set -e

echo "🚀 Deploying societies-api-v2 to DigitalOcean droplet..."

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

# Clone the new repository
echo "📥 Cloning societies-api-v2 repository..."
git clone https://github.com/junaidnasir1001/societies-api-v2.git
cd societies-api-v2

# Stop any existing societies-api process
echo "🔄 Stopping existing processes..."
pm2 stop societies-api 2>/dev/null || true
pm2 stop societies-api-v2 2>/dev/null || true
pm2 delete societies-api 2>/dev/null || true
pm2 delete societies-api-v2 2>/dev/null || true

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Set environment variables
export NODE_ENV=production
export PORT=3001

# Start application with new name
echo "🚀 Starting societies-api-v2..."
pm2 start src/api-server.js --name "societies-api-v2" --env production

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
echo "  Main API: http://localhost:3001/api/societies/test-content"
echo ""
echo "📋 Useful Commands:"
echo "  View logs: pm2 logs societies-api-v2"
echo "  Monitor: pm2 monit"
echo "  Restart: pm2 restart societies-api-v2"
echo "  Stop: pm2 stop societies-api-v2"
echo ""
echo "🔄 Update Commands:"
echo "  cd societies-api-v2"
echo "  git pull origin main"
echo "  npm install"
echo "  pm2 restart societies-api-v2"

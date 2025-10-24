#!/bin/bash

# DigitalOcean Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 Starting DigitalOcean deployment..."

# Check if running on DigitalOcean
if [ ! -f /etc/digitalocean ]; then
    echo "⚠️  This script is designed for DigitalOcean droplets"
fi

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 if not present
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# Clone or update repository
if [ -d "societies-api" ]; then
    echo "🔄 Updating existing repository..."
    cd societies-api
    git pull origin main
else
    echo "📥 Cloning repository..."
    git clone https://github.com/boldspace/societies-api.git
    cd societies-api
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Set environment variables
export NODE_ENV=production
export PORT=3001

# Stop existing PM2 process if running
pm2 stop societies-api 2>/dev/null || true
pm2 delete societies-api 2>/dev/null || true

# Start application with PM2
echo "🚀 Starting application..."
pm2 start src/api-server.js --name "societies-api" --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup

echo "✅ Deployment completed!"
echo "📊 Check status: pm2 status"
echo "📋 View logs: pm2 logs societies-api"
echo "🌐 API running on: http://localhost:3001"

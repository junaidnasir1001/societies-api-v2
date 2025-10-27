#!/bin/bash

# Update server with latest code
echo "🚀 Updating server with latest code..."

# SSH to server and update
ssh root@161.35.34.121 << 'EOF'
echo "📁 Navigating to project directory..."
cd /root/societies-api-v2

echo "📥 Pulling latest changes..."
git pull origin main

echo "🔄 Restarting PM2 process..."
pm2 restart societies-api-v2

echo "📊 Checking PM2 status..."
pm2 status

echo "🔍 Testing new endpoint..."
curl -s http://localhost:3001/health | head -1

echo "✅ Server update complete!"
EOF

echo "🎉 Deployment completed successfully!"
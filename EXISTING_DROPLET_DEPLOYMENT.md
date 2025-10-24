# 🚀 Deploy to Existing DigitalOcean Droplet

## ✅ Prerequisites

- Existing DigitalOcean droplet
- SSH access to droplet
- Basic knowledge of Linux commands

## 🔧 Step 1: Connect to Your Droplet

```bash
ssh root@YOUR_DROPLET_IP
```

## 📥 Step 2: Clone Repository

```bash
# Clone the repository
git clone https://github.com/boldspace/societies-api.git
cd societies-api
```

## 🚀 Step 3: Quick Deployment

### Option A: Automated Deployment (Recommended)
```bash
# Make script executable and run
chmod +x deploy-existing-droplet.sh
./deploy-existing-droplet.sh
```

### Option B: Manual Deployment

#### 3.1 Check Prerequisites
```bash
# Check Node.js
node --version

# Check PM2
pm2 --version

# Check Git
git --version
```

#### 3.2 Install Missing Dependencies (if needed)
```bash
# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (if not installed)
sudo npm install -g pm2
```

#### 3.3 Deploy Application
```bash
# Install dependencies
npm install --production

# Set environment variables
export NODE_ENV=production
export PORT=3001

# Stop existing process (if any)
pm2 stop societies-api 2>/dev/null || true
pm2 delete societies-api 2>/dev/null || true

# Start application
pm2 start src/api-server.js --name "societies-api"
pm2 save
pm2 startup
```

## 📊 Step 4: Verify Deployment

### 4.1 Check Application Status
```bash
pm2 status
pm2 logs societies-api
```

### 4.2 Test API Endpoints
```bash
# Health check
curl http://localhost:3001/health

# API info
curl http://localhost:3001/api/info

# Test main endpoint
curl -X POST http://localhost:3001/api/societies/test-content \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "Email subject",
    "subjectLines": ["Test subject"],
    "targetAudience": "UK Marketing Leaders",
    "mode": "async"
  }'
```

## 🔄 Step 5: Updates

### 5.1 Update Application
```bash
cd societies-api
git pull origin main
npm install
pm2 restart societies-api
```

### 5.2 Rollback (if needed)
```bash
git log --oneline
git checkout PREVIOUS_COMMIT
pm2 restart societies-api
```

## 🛡️ Step 6: Security (Optional)

### 6.1 Configure Firewall
```bash
# Allow necessary ports
ufw allow ssh
ufw allow 3001
ufw allow 80
ufw allow 443
ufw enable
```

### 6.2 Configure Nginx (Optional)
```bash
# Install Nginx
apt install nginx -y

# Create configuration
nano /etc/nginx/sites-available/societies-api
```

Add Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/societies-api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## 📊 Step 7: Monitoring

### 7.1 PM2 Commands
```bash
# View status
pm2 status

# View logs
pm2 logs societies-api

# Monitor resources
pm2 monit

# Restart application
pm2 restart societies-api

# Stop application
pm2 stop societies-api
```

### 7.2 System Monitoring
```bash
# Check system resources
htop

# Check disk space
df -h

# Check memory usage
free -h
```

## 🎯 Quick Commands Reference

```bash
# Start application
pm2 start src/api-server.js --name "societies-api"

# Check status
pm2 status

# View logs
pm2 logs societies-api

# Restart
pm2 restart societies-api

# Stop
pm2 stop societies-api

# Delete
pm2 delete societies-api

# Save configuration
pm2 save

# Setup auto-start
pm2 startup
```

## 🚨 Troubleshooting

### Application not starting
```bash
# Check logs
pm2 logs societies-api

# Check if port is in use
netstat -tlnp | grep 3001

# Kill process using port
sudo fuser -k 3001/tcp
```

### Permission issues
```bash
# Fix ownership
sudo chown -R $USER:$USER /path/to/societies-api

# Fix permissions
chmod -R 755 /path/to/societies-api
```

### Memory issues
```bash
# Check memory usage
free -h

# Restart application
pm2 restart societies-api
```

## 📝 Notes

- Repository: https://github.com/boldspace/societies-api
- Default port: 3001
- Process manager: PM2
- Auto-start: Enabled with PM2 startup

---
**Status**: ✅ Ready for existing droplet deployment

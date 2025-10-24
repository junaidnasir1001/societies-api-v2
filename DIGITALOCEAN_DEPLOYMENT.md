# 🚀 DigitalOcean Deployment Guide

## 📋 Prerequisites

- DigitalOcean account
- SSH key pair
- Domain name (optional)

## 🖥️ Step 1: Create DigitalOcean Droplet

### 1.1 Create New Droplet
1. **Go to DigitalOcean Dashboard**
   - Visit: https://cloud.digitalocean.com
   - Click "Create" → "Droplets"

2. **Choose Configuration**
   ```
   Image: Ubuntu 22.04 LTS
   Plan: Basic
   CPU: 1 vCPU
   RAM: 1GB
   Storage: 25GB SSD
   ```

3. **Add SSH Key**
   - Upload your SSH public key
   - Or create new SSH key pair

4. **Create Droplet**
   - Choose hostname: `societies-api`
   - Click "Create Droplet"

### 1.2 Connect to Droplet
```bash
ssh root@YOUR_DROPLET_IP
```

## 🔧 Step 2: Server Setup

### 2.1 Update System
```bash
apt update && apt upgrade -y
```

### 2.2 Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2.3 Install PM2
```bash
sudo npm install -g pm2
```

### 2.4 Install Git
```bash
apt install git -y
```

## 📥 Step 3: Deploy Application

### 3.1 Clone Repository
```bash
git clone https://github.com/boldspace/societies-api.git
cd societies-api
```

### 3.2 Install Dependencies
```bash
npm install --production
```

### 3.3 Set Environment Variables
```bash
export NODE_ENV=production
export PORT=3001
```

### 3.4 Start Application
```bash
pm2 start src/api-server.js --name "societies-api"
pm2 save
pm2 startup
```

## 🔄 Step 4: Automated Deployment (Optional)

### 4.1 Use Deployment Script
```bash
chmod +x deploy.sh
./deploy.sh
```

### 4.2 Docker Deployment
```bash
# Build and run with Docker
docker build -t societies-api .
docker run -d -p 3001:3001 --name societies-api societies-api

# Or use Docker Compose
docker-compose up -d
```

## 🌐 Step 5: Configure Domain (Optional)

### 5.1 Install Nginx
```bash
apt install nginx -y
```

### 5.2 Configure Nginx
```bash
nano /etc/nginx/sites-available/societies-api
```

Add configuration:
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

### 5.3 Enable Site
```bash
ln -s /etc/nginx/sites-available/societies-api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 5.4 SSL Certificate (Optional)
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d your-domain.com
```

## 📊 Step 6: Monitoring

### 6.1 Check Application Status
```bash
pm2 status
pm2 logs societies-api
pm2 monit
```

### 6.2 Test API
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/info
```

## 🔄 Step 7: Updates

### 7.1 Update Application
```bash
cd societies-api
git pull origin main
npm install
pm2 restart societies-api
```

### 7.2 Rollback (if needed)
```bash
git log --oneline
git checkout PREVIOUS_COMMIT
pm2 restart societies-api
```

## 🛡️ Step 8: Security (Recommended)

### 8.1 Firewall Setup
```bash
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3001
ufw enable
```

### 8.2 Create Non-root User
```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

## 📝 Environment Variables

Create `.env` file:
```bash
nano .env
```

Add:
```
NODE_ENV=production
PORT=3001
API_KEY=your-secure-api-key
```

## 🎯 Final Checklist

- ✅ Droplet created and accessible
- ✅ Node.js and PM2 installed
- ✅ Application cloned and running
- ✅ PM2 configured for auto-start
- ✅ Domain configured (optional)
- ✅ SSL certificate installed (optional)
- ✅ Firewall configured
- ✅ API responding correctly

## 📞 Support

- **PM2 Commands**: `pm2 --help`
- **Nginx Commands**: `nginx -t`, `systemctl status nginx`
- **Application Logs**: `pm2 logs societies-api`
- **System Logs**: `journalctl -u nginx`

---
**Repository**: https://github.com/boldspace/societies-api
**Status**: ✅ Ready for DigitalOcean deployment

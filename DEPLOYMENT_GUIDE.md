# 🚀 Deployment Guide - GitHub to DigitalOcean

## ✅ Step 1: GitHub Repository Created

Repository successfully pushed to: `https://github.com/boldspace/societies-api.git`

## 🚀 Step 2: DigitalOcean Deployment

### Prerequisites
- DigitalOcean account
- Droplet with Node.js 18+ installed
- Domain name (optional)

### Option A: Manual Deployment

1. **Create DigitalOcean Droplet**
   - Ubuntu 22.04 LTS
   - Minimum 1GB RAM, 1 CPU
   - Add SSH key

2. **Connect to Droplet**
   ```bash
   ssh root@your-droplet-ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install PM2 (Process Manager)**
   ```bash
   sudo npm install -g pm2
   ```

5. **Clone Repository**
   ```bash
   git clone https://github.com/boldspace/societies-api.git
   cd societies-api
   npm install
   ```

6. **Start Application**
   ```bash
   pm2 start src/api-server.js --name "societies-api"
   pm2 save
   pm2 startup
   ```

### Option B: Using Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 3001
   CMD ["node", "src/api-server.js"]
   ```

2. **Build and Run**
   ```bash
   docker build -t societies-api .
   docker run -d -p 3001:3001 --name societies-api societies-api
   ```

## 🔧 Production Configuration

### Environment Variables
```bash
export NODE_ENV=production
export PORT=3001
```

### Nginx Configuration (Optional)
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

## 📊 Monitoring

- **PM2 Monitoring**: `pm2 monit`
- **Logs**: `pm2 logs societies-api`
- **Status**: `pm2 status`

## 🔄 Updates

```bash
# Pull latest changes
git pull origin main
npm install
pm2 restart societies-api
```

## 📝 Notes

- Repository is now live on GitHub
- Ready for DigitalOcean deployment
- All files are clean and optimized
- Documentation is minimal and essential

## 🎯 Next Steps

1. ✅ GitHub repository created
2. 🔄 Deploy to DigitalOcean
3. 🔧 Configure environment variables
4. 🌐 Set up domain and SSL (optional)
5. 📊 Monitor and test

---
*Repository URL: https://github.com/boldspace/societies-api*
*Status: ✅ Ready for DigitalOcean deployment*

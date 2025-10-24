# societies-api-v2

## 🚀 Societies.io Content Testing API v2

Advanced API for testing content with societies.io platform. Supports both Email subject lines and Ad headlines testing with the new UI.

## ✨ Features

- ✅ **New UI Support** - Works with latest societies.io interface
- ✅ **Email Subject Testing** - Test email subject lines
- ✅ **Ad Headline Testing** - Test Meta ad headlines  
- ✅ **Multiple Audiences** - Target specific audience segments
- ✅ **Async Processing** - Non-blocking API calls
- ✅ **Accurate Extraction** - Precise result extraction
- ✅ **Docker Support** - Containerized deployment
- ✅ **DigitalOcean Ready** - Optimized for cloud deployment

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Start API Server
```bash
npm start
```

### Test API
```bash
curl -X POST http://localhost:3001/api/societies/test-content \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "Email subject",
    "subjectLines": ["Get 50% off today!", "Limited time offer"],
    "targetAudience": "UK Marketing Leaders",
    "mode": "async"
  }'
```

## 📋 API Endpoints

- `POST /api/societies/test-content` - Main testing endpoint
- `GET /api/jobs/{jobId}` - Check job status
- `GET /health` - Health check
- `GET /api/info` - API information

## 📝 Content Types

- **Email subject** - Email subject line testing
- **Ad headline** - Meta ad headline testing

## 👥 Audiences

- UK Marketing Leaders
- UK HR Decision-Makers  
- UK Mortgage Advisors
- UK Beauty Lovers
- UK Consumers
- UK Journalists
- UK Enterprise Marketing Leaders

## 🐳 Docker Deployment

```bash
# Build and run with Docker
docker build -t societies-api-v2 .
docker run -d -p 3001:3001 --name societies-api-v2 societies-api-v2

# Or use Docker Compose
docker-compose up -d
```

## 🚀 DigitalOcean Deployment

```bash
# Clone repository
git clone https://github.com/junaidnasir1001/societies-api-v2.git
cd societies-api-v2

# Run deployment script
chmod +x deploy.sh
./deploy.sh
```

## 📊 Response Format

```json
{
  "ok": true,
  "jobId": "societies_1234567890_abc123",
  "status": "done",
  "result": {
    "winner": "Get 50% off today!",
    "impactScore": { "value": "57", "rating": "Average" },
    "averageScore": "50",
    "uplift": "14",
    "insights": "Marketing leaders preferred..."
  }
}
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run api

# Test locally
npm test
```

## 📚 Documentation

- [API Usage Examples](docs/API_USAGE_EXAMPLES.md)
- [Project Overview](docs/PROJECT_OVERVIEW.md)
- [Quick Start Guide](docs/QUICK_START.md)
- [DigitalOcean Deployment](DIGITALOCEAN_DEPLOYMENT.md)

## 🔄 Updates

```bash
# Pull latest changes
git pull origin main
npm install
pm2 restart societies-api-v2
```

## 📄 License

Private repository for Societies.io content testing platform.

---
**Repository**: https://github.com/junaidnasir1001/societies-api-v2
**Status**: ✅ Production Ready
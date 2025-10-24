# Societies.io Content Testing API

Automated API for testing content with societies.io platform. Supports both Email subject lines and Ad headlines testing.

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Start API Server
```bash
npm run api
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

## 📋 Features

- ✅ Email subject line testing
- ✅ Ad headline testing  
- ✅ Multiple audience targeting
- ✅ Async job processing
- ✅ Accurate result extraction
- ✅ New UI support

## 🔧 API Endpoints

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

## 🧪 Testing

Import `Societies_New_UI_Postman_Collection.json` for easy testing with Postman.

## 📚 Documentation

- [API Usage Examples](docs/API_USAGE_EXAMPLES.md)
- [Project Overview](docs/PROJECT_OVERVIEW.md)
- [Quick Start Guide](docs/QUICK_START.md)

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run api

# Test locally
npm test
```

## 📄 License

Private repository for Boldspace/Societies.io
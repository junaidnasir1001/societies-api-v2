# 🚀 Societies API - Usage Examples

**Date:** October 13, 2025  
**Status:** ✅ **Production Ready**

---

## 🎯 Quick Start

### **Start API Server:**
```bash
npm run api
```

**Expected Output:**
```
🚀 Societies API server running on port 3001
📊 Health check: http://localhost:3001/health
📖 API info: http://localhost:3001/api/info
🎯 Main endpoint: POST http://localhost:3001/api/societies/test-content
🔓 API key authentication: DISABLED (set API_KEY env var to enable)
```

---

## 📊 Health Check

### **Check if API is running:**
```bash
curl -X GET http://localhost:3001/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-13T07:44:57.516Z",
  "version": "1.0.0",
  "uptime": 2.763680912
}
```

---

## 📖 API Information

### **Get API details:**
```bash
curl -X GET http://localhost:3001/api/info
```

**Response:**
```json
{
  "name": "Societies.io Content Testing API",
  "version": "1.0.0",
  "description": "Test content with target audiences using societies.io simulation",
  "endpoints": {
    "POST /api/societies/test-content": "Run content simulation",
    "GET /health": "Health check",
    "GET /api/info": "API information"
  },
  "allowedTestTypes": ["Article", "Website Content", "Email", "Tweet", "Post"],
  "normalization": "Automatic normalization of common test type variants (e.g., \"web\" → \"Website Content\")"
}
```

---

## 🎯 Main Endpoint - Content Testing

### **Basic Test:**
```bash
curl -X POST http://localhost:3001/api/societies/test-content \
  -H "Content-Type: application/json" \
  -d '{
    "societyName": "Startup Investors",
    "testType": "Website Content",
    "testString": "AI-powered analytics delivers 10x faster insights and reduces costs by 40%"
  }'
```

### **Article Test:**
```bash
curl -X POST http://localhost:3001/api/societies/test-content \
  -H "Content-Type: application/json" \
  -d '{
    "societyName": "Tech Enthusiasts",
    "testType": "Article",
    "testString": "The future of artificial intelligence in healthcare is promising. With machine learning algorithms, we can now predict diseases before they manifest, leading to earlier interventions and better patient outcomes."
  }'
```

### **Email Test:**
```bash
curl -X POST http://localhost:3001/api/societies/test-content \
  -H "Content-Type: application/json" \
  -d '{
    "societyName": "Healthcare Professionals",
    "testType": "Newsletter",
    "testString": "Subject: New AI Diagnostic Tool Available\n\nDear Colleagues,\n\nWe are excited to announce the launch of our new AI-powered diagnostic tool that can identify early-stage cancer with 95% accuracy. This revolutionary technology could save thousands of lives through early detection."
  }'
```

### **Tweet Test:**
```bash
curl -X POST http://localhost:3001/api/societies/test-content \
  -H "Content-Type: application/json" \
  -d '{
    "societyName": "Startup Investors",
    "testType": "Twitter",
    "testString": "🚀 Just raised $10M Series A to scale our AI platform! Our team is building the future of personalized healthcare. #AI #Healthcare #SeriesA"
  }'
```

### **Social Media Post:**
```bash
curl -X POST http://localhost:3001/api/societies/test-content \
  -H "Content-Type: application/json" \
  -d '{
    "societyName": "LinkedIn Professionals",
    "testType": "LinkedIn",
    "testString": "Excited to share that our AI startup has been selected for the prestigious TechCrunch Disrupt Startup Battlefield! After months of hard work, we are ready to showcase our revolutionary healthcare AI platform to the world. Thank you to our amazing team and investors for believing in our vision."
  }'
```

---

## 🔧 Test Type Normalization Examples

The API automatically normalizes common test type variants:

### **Website Content Variants:**
```bash
# All of these map to "Website Content"
curl -X POST http://localhost:3001/api/societies/test-content \
  -H "Content-Type: application/json" \
  -d '{"societyName": "Users", "testType": "web", "testString": "test"}'

curl -X POST http://localhost:3001/api/societies/test-content \
  -H "Content-Type: application/json" \
  -d '{"societyName": "Users", "testType": "site", "testString": "test"}'

curl -X POST http://localhost:3001/api/societies/test-content \
  -H "Content-Type: application/json" \
  -d '{"societyName": "Users", "testType": "blog", "testString": "test"}'
```

### **Tweet Variants:**
```bash
# All of these map to "Tweet"
curl -X POST http://localhost:3001/api/societies/test-content \
  -H "Content-Type: application/json" \
  -d '{"societyName": "Users", "testType": "x", "testString": "test"}'

curl -X POST http://localhost:3001/api/societies/test-content \
  -H "Content-Type: application/json" \
  -d '{"societyName": "Users", "testType": "twitter", "testString": "test"}'
```

---

## 📊 Expected Response Format

### **Success Response:**
```json
{
  "ok": true,
  "inputs": {
    "societyName": "Startup Investors",
    "testType": "Website Content",
    "testString": "AI-powered analytics delivers 10x faster insights and reduces costs by 40%"
  },
  "results": {
    "impactScore": {
      "value": "64",
      "rating": "Average"
    },
    "attention": {
      "full": 38,
      "partial": 52,
      "ignore": 9,
      "raw": {
        "full": "38%",
        "partial": "52%",
        "ignore": "9%"
      }
    },
    "insights": "The website received average attention, with mixed reactions to its core message.\n\nThe audience values concise and clear communication; they responded well to direct value statements.\n\n\"10x faster insights\" and \"reduces costs by 40%\" resonated strongly with many investors.\n\nConsider highlighting the *how* these benefits are achieved with brief, specific examples.",
    "summaryText": "Impact Score: 64/100. Attention: Full 38%, Partial 52%, Ignore 9%",
    "keyFindings": [
      "Impact score: 64/100 (Average)",
      "Full attention: 38%",
      "Ignored: 9%"
    ],
    "rawHtml": "<div class=\"css-4e1k6r\">...</div>",
    "plainText": "Share Simulation\n\nImpact Score\n\nAverage\n64 / 100\n\nAttention\n\nFull\n\n38%\n\nPartial\n\n52%\n\nIgnore\n\n9%\n\nInsights\n\nThe website received average attention...",
    "url": "https://app.societies.io/"
  },
  "metadata": {
    "timingsMs": {
      "googleLogin": 0,
      "simulate": 192031,
      "total": 192031
    },
    "runId": "api_1760340681121"
  },
  "screenshots": null,
  "error": null
}
```

### **Error Response (Missing Fields):**
```json
{
  "ok": false,
  "error": "Missing required fields: societyName, testType",
  "inputs": {
    "societyName": "",
    "testType": "",
    "testString": ""
  },
  "results": null,
  "screenshots": null
}
```

### **Error Response (Timeout):**
```json
{
  "ok": false,
  "error": "Simulation timeout: Process took longer than 10 minutes",
  "inputs": {
    "societyName": "Startup Investors",
    "testType": "Website Content",
    "testString": "AI-powered analytics delivers 10x faster insights and reduces costs by 40%"
  },
  "results": null,
  "screenshots": null
}
```

---

## 🔐 API Key Authentication (Optional)

### **Enable API Key Authentication:**
```bash
# Add to .env file
echo "API_KEY=your-secret-api-key-here" >> .env
```

### **Using API Key (Header):**
```bash
curl -X POST http://localhost:3001/api/societies/test-content \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-api-key-here" \
  -d '{
    "societyName": "Startup Investors",
    "testType": "Website Content",
    "testString": "AI-powered analytics delivers 10x faster insights and reduces costs by 40%"
  }'
```

### **Using API Key (Query Parameter):**
```bash
curl -X POST "http://localhost:3001/api/societies/test-content?api_key=your-secret-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "societyName": "Startup Investors",
    "testType": "Website Content",
    "testString": "AI-powered analytics delivers 10x faster insights and reduces costs by 40%"
  }'
```

### **API Key Error Response:**
```json
{
  "ok": false,
  "error": "API key required. Provide via X-API-Key header or api_key query parameter.",
  "inputs": null,
  "results": null,
  "screenshots": null
}
```

---

## 🌐 Integration Examples

### **JavaScript/Fetch:**
```javascript
const response = await fetch('http://localhost:3001/api/societies/test-content', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-secret-api-key-here' // Optional
  },
  body: JSON.stringify({
    societyName: 'Startup Investors',
    testType: 'Website Content',
    testString: 'AI-powered analytics delivers 10x faster insights and reduces costs by 40%'
  })
});

const result = await response.json();
console.log(result);
```

### **Python/Requests:**
```python
import requests

url = 'http://localhost:3001/api/societies/test-content'
headers = {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-secret-api-key-here'  # Optional
}
data = {
    'societyName': 'Startup Investors',
    'testType': 'Website Content',
    'testString': 'AI-powered analytics delivers 10x faster insights and reduces costs by 40%'
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
print(result)
```

### **Node.js/Axios:**
```javascript
const axios = require('axios');

const response = await axios.post('http://localhost:3001/api/societies/test-content', {
  societyName: 'Startup Investors',
  testType: 'Website Content',
  testString: 'AI-powered analytics delivers 10x faster insights and reduces costs by 40%'
}, {
  headers: {
    'X-API-Key': 'your-secret-api-key-here' // Optional
  }
});

console.log(response.data);
```

---

## ⚡ Performance Notes

### **Typical Response Times:**
- **Health Check:** ~1ms
- **API Info:** ~1ms  
- **Content Simulation:** ~2-4 minutes (depends on societies.io processing)

### **Timeout Settings:**
- **Request Timeout:** 10 minutes maximum
- **Graceful Shutdown:** SIGTERM/SIGINT handling
- **Error Handling:** Comprehensive error responses

### **Rate Limiting:**
- Currently no rate limiting implemented
- Recommended for production: Add rate limiting middleware

---

## 🚀 Production Deployment

### **Environment Variables:**
```bash
# Required
BROWSERBASE_WS_ENDPOINT=wss://connect.browserbase.com/v1/sessions/your-session-id
GOOGLE_EMAIL=your-email@example.com
GOOGLE_PASSWORD=your-password

# Optional
API_PORT=3001
API_KEY=your-secret-api-key-here
NODE_ENV=production
```

### **Docker Deployment:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY src/ ./src/
EXPOSE 3001
CMD ["npm", "run", "api"]
```

### **PM2 Deployment:**
```bash
npm install -g pm2
pm2 start src/api-server.js --name "societies-api"
pm2 startup
pm2 save
```

---

## 📝 Summary

✅ **Production Ready Features:**
- ✅ Express server with proper middleware
- ✅ CORS enabled for cross-origin requests
- ✅ Request/response logging
- ✅ Comprehensive error handling
- ✅ Health check endpoint
- ✅ API information endpoint
- ✅ Optional API key authentication
- ✅ Request timeout handling (10 minutes)
- ✅ Graceful shutdown handling
- ✅ Input validation
- ✅ Test type normalization
- ✅ Exact societies.io API contract compliance

**Ready for client integration!** 🎉

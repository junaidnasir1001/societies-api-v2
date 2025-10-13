# 🚀 Postman Testing Guide - Societies API

**Date:** October 13, 2025  
**Status:** ✅ **Ready for Postman Testing**

---

## 🎯 Quick Setup

### **1. Start API Server:**
```bash
npm run api
```

**Expected Output:**
```
🚀 Societies API server running on port 3001
📊 Health check: http://localhost:3001/health
📖 API info: http://localhost:3001/api/info
🎯 Main endpoint: POST http://localhost:3001/api/societies/test-content
```

### **2. Open Postman:**
- Download from: https://www.postman.com/downloads/
- Or use Postman Web: https://web.postman.com/

---

## 📊 Test 1: Health Check

### **Request Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:3001/health`
- **Headers:** None needed

### **Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-13T07:44:57.516Z",
  "version": "1.0.0",
  "uptime": 2.763680912
}
```

### **Postman Steps:**
1. Click "New" → "Request"
2. Name: "Health Check"
3. Method: `GET`
4. URL: `http://localhost:3001/health`
5. Click "Send"

---

## 📖 Test 2: API Information

### **Request Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:3001/api/info`
- **Headers:** None needed

### **Expected Response:**
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

### **Postman Steps:**
1. Click "New" → "Request"
2. Name: "API Info"
3. Method: `GET`
4. URL: `http://localhost:3001/api/info`
5. Click "Send"

---

## 🎯 Test 3: Main Endpoint - Website Content

### **Request Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:3001/api/societies/test-content`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "societyName": "Startup Investors",
  "testType": "Website Content",
  "testString": "AI-powered analytics delivers 10x faster insights and reduces costs by 40%"
}
```

### **Postman Steps:**
1. Click "New" → "Request"
2. Name: "Test Website Content"
3. Method: `POST`
4. URL: `http://localhost:3001/api/societies/test-content`
5. Go to "Headers" tab:
   - Key: `Content-Type`
   - Value: `application/json`
6. Go to "Body" tab:
   - Select "raw"
   - Select "JSON" from dropdown
   - Paste the JSON above
7. Click "Send"

### **Expected Response:**
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
    "insights": "The website received average attention, with mixed reactions to its core message...",
    "summaryText": "Impact Score: 64/100. Attention: Full 38%, Partial 52%, Ignore 9%",
    "keyFindings": [
      "Impact score: 64/100 (Average)",
      "Full attention: 38%",
      "Ignored: 9%"
    ],
    "rawHtml": "<div class=\"css-4e1k6r\">...</div>",
    "plainText": "Share Simulation\n\nImpact Score\n\nAverage\n64 / 100...",
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

---

## 📝 Test 4: Article Content

### **Request Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:3001/api/societies/test-content`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "societyName": "Tech Enthusiasts",
  "testType": "Article",
  "testString": "The future of artificial intelligence in healthcare is promising. With machine learning algorithms, we can now predict diseases before they manifest, leading to earlier interventions and better patient outcomes."
}
```

### **Postman Steps:**
1. Click "New" → "Request"
2. Name: "Test Article"
3. Method: `POST`
4. URL: `http://localhost:3001/api/societies/test-content`
5. Headers: `Content-Type: application/json`
6. Body: Raw JSON (paste the JSON above)
7. Click "Send"

---

## 📧 Test 5: Email Content

### **Request Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:3001/api/societies/test-content`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "societyName": "Healthcare Professionals",
  "testType": "Newsletter",
  "testString": "Subject: New AI Diagnostic Tool Available\n\nDear Colleagues,\n\nWe are excited to announce the launch of our new AI-powered diagnostic tool that can identify early-stage cancer with 95% accuracy. This revolutionary technology could save thousands of lives through early detection."
}
```

---

## 🐦 Test 6: Tweet Content

### **Request Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:3001/api/societies/test-content`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "societyName": "Startup Investors",
  "testType": "Twitter",
  "testString": "🚀 Just raised $10M Series A to scale our AI platform! Our team is building the future of personalized healthcare. #AI #Healthcare #SeriesA"
}
```

---

## 🔧 Test 7: Test Type Normalization

### **Request Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:3001/api/societies/test-content`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "societyName": "Users",
  "testType": "web",
  "testString": "Testing normalization - this should map to Website Content"
}
```

**Expected:** `testType` should be normalized to `"Website Content"` in response.

---

## ❌ Test 8: Error Handling - Missing Fields

### **Request Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:3001/api/societies/test-content`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "societyName": "Test",
  "testType": "Article"
  // Missing testString
}
```

### **Expected Response:**
```json
{
  "ok": false,
  "error": "Missing required fields: testString",
  "inputs": {
    "societyName": "Test",
    "testType": "Article",
    "testString": ""
  },
  "results": null,
  "screenshots": null
}
```

---

## ❌ Test 9: Error Handling - Empty Body

### **Request Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:3001/api/societies/test-content`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{}
```

### **Expected Response:**
```json
{
  "ok": false,
  "error": "Missing required fields: societyName, testType, testString",
  "inputs": {
    "societyName": "",
    "testType": "",
    "testString": ""
  },
  "results": null,
  "screenshots": null
}
```

---

## 🔐 Test 10: API Key Authentication (Optional)

### **Enable API Key (if needed):**
```bash
# Add to .env file
echo "API_KEY=test-api-key-123" >> .env
# Restart server: npm run api
```

### **Request Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:3001/api/societies/test-content`
- **Headers:**
  - `Content-Type: application/json`
  - `X-API-Key: test-api-key-123`
- **Body (raw JSON):**
```json
{
  "societyName": "Startup Investors",
  "testType": "Website Content",
  "testString": "Test with API key authentication"
}
```

### **Postman Steps:**
1. In Headers tab, add:
   - Key: `X-API-Key`
   - Value: `test-api-key-123`
2. Send request

---

## 📋 Postman Collection Setup

### **Create Collection:**
1. Click "Collections" in left sidebar
2. Click "New Collection"
3. Name: "Societies API Tests"

### **Add All Tests:**
1. Right-click collection → "Add Request"
2. Name each test as shown above
3. Set up method, URL, headers, body for each

### **Save Environment (Optional):**
1. Click gear icon (⚙️) → "Manage Environments"
2. Click "Add"
3. Name: "Societies API Local"
4. Add variable:
   - Key: `base_url`
   - Value: `http://localhost:3001`

### **Use Environment Variables:**
- In requests, use: `{{base_url}}/health`
- This makes it easy to switch between local/staging/production

---

## ⏱️ Performance Notes

### **Expected Response Times:**
- **Health Check:** ~1ms
- **API Info:** ~1ms
- **Content Simulation:** ~2-4 minutes

### **Postman Tips:**
- ✅ **Set timeout** to 5+ minutes for simulation requests
- ✅ **Save responses** for debugging
- ✅ **Use variables** for base URL
- ✅ **Create collection** for organized testing

---

## 🚨 Troubleshooting

### **Connection Refused:**
```bash
# Make sure API server is running
npm run api
```

### **Timeout Errors:**
- Simulation takes 2-4 minutes
- Increase Postman timeout settings
- Check server logs for errors

### **JSON Parse Errors:**
- Ensure `Content-Type: application/json` header
- Validate JSON syntax in body

### **Missing Fields Errors:**
- Check all required fields are present:
  - `societyName` (string)
  - `testType` (string)
  - `testString` (string)

---

## 🎯 Quick Test Checklist

### **✅ Basic Functionality:**
- [ ] Health check returns 200
- [ ] API info returns endpoint details
- [ ] Main endpoint accepts valid JSON
- [ ] Returns proper response format

### **✅ Error Handling:**
- [ ] Missing fields return 400
- [ ] Empty body returns 400
- [ ] Invalid JSON returns 400

### **✅ Content Types:**
- [ ] Website Content works
- [ ] Article works
- [ ] Email/Newsletter works
- [ ] Tweet/Twitter works
- [ ] Test type normalization works

### **✅ Security (if enabled):**
- [ ] API key authentication works
- [ ] Missing API key returns 401
- [ ] Invalid API key returns 403

---

## 🎉 Ready for Testing!

**Start your API server:**
```bash
npm run api
```

**Open Postman and start testing!** All endpoints are ready and documented above.

**Expected Results:** All tests should pass with proper response formats and error handling.

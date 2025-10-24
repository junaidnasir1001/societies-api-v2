# Local Testing Guide - Societies.io API

## 🚀 **Quick Start (2 minutes)**

### **Step 1: Start the API Server**
```bash
cd /Users/junaidnasir/Herd/Automation/Upwork-Projects/dan-project
npm run api
```

### **Step 2: Run Automated Tests**
```bash
# In a new terminal
node test-local.js
```

### **Step 3: Check Job Status**
```bash
# Replace {jobId} with actual job ID from test output
curl -H "X-API-Key: your_api_key_here" http://localhost:3001/api/jobs/{jobId}
```

## 🧪 **Manual Testing Commands**

### **1. Health Check**
```bash
curl http://localhost:3001/health
```

### **2. API Info**
```bash
curl -H "X-API-Key: your_api_key_here" http://localhost:3001/api/info
```

### **3. Email Subject Test (Single String)**
```bash
curl -X POST http://localhost:3001/api/societies/test-content \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{
    "testType": "email_subject",
    "testString": "Get 50% off today!\nLimited time offer\nSave big this weekend",
    "societyName": "UK Marketing Leaders",
    "mode": "async"
  }'
```

### **4. Meta Ad Test (Multiple Strings)**
```bash
curl -X POST http://localhost:3001/api/societies/test-content \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{
    "testType": "meta_ad",
    "testStrings": [
      "Transform your business today",
      "Unlock your potential",
      "Join thousands of successful entrepreneurs"
    ],
    "societyName": "UK Enterprise Marketing Leaders",
    "mode": "async"
  }'
```

### **5. Check Job Status**
```bash
# Replace {jobId} with actual job ID
curl -H "X-API-Key: your_api_key_here" http://localhost:3001/api/jobs/{jobId}
```

## 📊 **Expected Results**

### **Start Test Response**
```json
{
  "ok": true,
  "jobId": "societies_1761239306536_1t2f40",
  "status": "queued"
}
```

### **Processing Status**
```json
{
  "ok": true,
  "jobId": "societies_1761239306536_1t2f40",
  "status": "running",
  "createdAt": "2025-10-23T17:08:26.537Z",
  "updatedAt": "2025-10-23T17:08:26.537Z"
}
```

### **Completed Results**
```json
{
  "ok": true,
  "jobId": "societies_1761239306536_1t2f40",
  "status": "completed",
  "results": {
    "winner": "Get 50% off today!",
    "impactScore": {
      "value": "67",
      "rating": "Good"
    },
    "averageScore": "52",
    "uplift": "29",
    "insights": "Marketing Leaders engaged most with discount messaging...",
    "attention": {
      "full": 45,
      "partial": 30,
      "ignore": 25
    }
  }
}
```

## 🔧 **Available Scripts**

```bash
# Start API server
npm run api

# Start MCP server
npm run mcp

# Run simulation (CLI)
npm run simulate

# Run demo
npm run dev

# Test API health
npm run test:api

# Test MCP
npm run test:mcp
```

## 🎯 **Test Scenarios**

### **1. Backward Compatibility**
- Single `testString` with newlines
- Existing content types and audiences
- Legacy response format

### **2. New Features**
- `testStrings` array format
- New content types: `email_subject`, `meta_ad`
- New audiences: HR, Mortgage Advisors, Beauty Lovers, etc.
- New result fields: winner, impactScore, uplift, insights

### **3. Error Testing**
- Invalid API key
- Missing required fields
- Invalid job ID

## 📈 **Performance Monitoring**

### **Typical Processing Time**
- **Email Subject Lines**: 2-4 minutes
- **Meta Ad Headlines**: 2-4 minutes
- **Complex Audiences**: 3-5 minutes

### **Status Values**
- `queued` - Job created, waiting to start
- `running` - Currently processing
- `completed` - Finished successfully
- `failed` - Error occurred

## 🚨 **Troubleshooting**

### **Server Not Starting**
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill process if needed
sudo fuser -k 3001/tcp
```

### **Jobs Stuck in Processing**
- Check server logs in terminal
- Verify browser automation is working
- May need to restart server

### **Connection Refused**
- Ensure server is running: `npm run api`
- Check if port 3001 is accessible
- Verify API key is correct

## 📝 **Local Development Tips**

1. **Keep server running** in one terminal
2. **Use separate terminal** for testing
3. **Monitor server logs** for debugging
4. **Test one scenario at a time** initially
5. **Check job status** every 30 seconds

## 🎉 **Success Indicators**

- ✅ Health check returns `{"status":"healthy"}`
- ✅ API info returns server details
- ✅ Jobs start successfully with `jobId`
- ✅ Status progresses: `queued` → `running` → `completed`
- ✅ Results include winner, scores, insights

## 📞 **Next Steps**

1. **Test all content types** (email_subject, meta_ad)
2. **Test all audiences** (8 different options)
3. **Test both formats** (single string, array)
4. **Verify result extraction** (winner, scores, uplift)
5. **Test error scenarios** (invalid inputs)

The local testing environment is now fully set up and working! 🚀

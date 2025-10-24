# Postman Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Import Collection
1. Open Postman
2. Click **Import** → **Upload Files**
3. Select: `Societies_New_UI_Postman_Collection.json`
4. Click **Import**

### Step 2: Set Environment Variables
1. Click **Environments** tab
2. Create new environment: `Societies New UI`
3. Add variables:
   - `base_url`: `http://161.35.34.121:3001`
   - `api_key`: `your_actual_api_key_here`
4. Click **Save**

### Step 3: Select Environment
1. Click environment dropdown (top right)
2. Select **Societies New UI**

## 🧪 Test Sequence

### Quick Test (2 minutes)
1. **Health Check** → Should return server status
2. **Email Subject - Single String** → Should return `jobId`
3. **Check Job Status** → Replace `{{jobId}}` with actual job ID from step 2

### Full Test (10 minutes)
1. **Health Check**
2. **API Info** → Verify API key works
3. **Email Subject - Single String** → Test backward compatibility
4. **Email Subject - Multiple Strings** → Test new array format
5. **Meta Ad - Multiple Headlines** → Test new content type
6. **HR Decision-Makers Audience** → Test audience mapping
7. **Check Job Status** → Monitor progress

## 📋 Pre-request Scripts

The collection includes automatic scripts that:
- Store `jobId` in environment for easy status checking
- Validate responses automatically

## 🔧 Troubleshooting

### Connection Issues
```bash
# Check if server is running
curl http://161.35.34.121:3001/health
```

### API Key Issues
- Verify your API key in the environment
- Check server logs: `pm2 logs api-server`

### Job Status Issues
- Jobs typically take 2-4 minutes to complete
- Check status every 30 seconds
- Look for `status: "completed"` in response

## 📊 Expected Results

### Successful Response Format
```json
{
  "jobId": "job_1234567890",
  "status": "completed",
  "results": {
    "winner": "Transform your business today",
    "impactScore": {
      "value": "67",
      "rating": "Good"
    },
    "averageScore": "52",
    "uplift": "29",
    "insights": "Enterprise Marketing Leaders engaged most...",
    "attention": {
      "full": 45,
      "partial": 30,
      "ignore": 25
    }
  }
}
```

### Status Values
- `processing` - Still running (check again in 30 seconds)
- `completed` - Finished successfully
- `failed` - Error occurred (check server logs)

## 🎯 Key Test Cases

### 1. Backward Compatibility
- Use `testString` (single string with newlines)
- Should work exactly like before

### 2. New Array Format
- Use `testStrings` array
- Should join with newlines automatically

### 3. New Content Types
- `email_subject` - Email subject lines
- `meta_ad` - Meta ad headlines

### 4. New Audiences
- `UK Marketing Leaders` → `marketing_leaders`
- `UK HR Decision-Makers` → `hr`
- `UK Enterprise Marketing Leaders` → `enterprise_marketing_leaders`

### 5. New Result Fields
- `winner` - Which test string won
- `impactScore` - Performance rating
- `averageScore` - Average performance
- `uplift` - Improvement percentage
- `insights` - AI analysis

## 🚨 Common Issues

### 1. "Invalid API key"
- Check environment variable `api_key`
- Verify server has correct API key

### 2. "Job not found"
- Use correct job ID from start response
- Job IDs are case-sensitive

### 3. "Missing required fields"
- Ensure `testType`, `testString`/`testStrings`, `societyName` are provided
- Check JSON format is valid

### 4. Job stuck in "processing"
- Check server logs: `pm2 logs api-server`
- Verify browser automation is working
- May need to restart server

## 📈 Performance Tips

1. **Start with simple tests** (2-3 test strings)
2. **Use appropriate audiences** for your content type
3. **Monitor job status** every 30 seconds
4. **Check server logs** if jobs fail
5. **Test one audience at a time** initially

## 🔄 Automation Scripts

The collection includes these automated scripts:

### Pre-request Script
```javascript
// Automatically stores jobId for status checking
if (pm.response && pm.response.code === 200) {
    const response = pm.response.json();
    if (response.jobId) {
        pm.environment.set('lastJobId', response.jobId);
    }
}
```

### Test Script
```javascript
// Validates response format automatically
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has jobId", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('jobId');
});
```

## 📞 Support

If you encounter issues:
1. Check server status: `pm2 list`
2. Check server logs: `pm2 logs api-server`
3. Verify API key is correct
4. Test with simple requests first

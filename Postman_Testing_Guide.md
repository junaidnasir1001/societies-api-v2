# Postman Testing Guide - Societies.io New UI

## Setup

### 1. Import Postman Collection
Import the collection: `Societies.io Content Testing API.postman_collection.json`

### 2. Set Environment Variables
Create/update environment with:
- `base_url`: `http://161.35.34.121:3001`
- `api_key`: Your API key from server

## Test Cases

### Test 1: Single Test String (Backward Compatible)
**Endpoint**: `POST {{base_url}}/api/societies/test-content`

**Headers**:
```
Content-Type: application/json
X-API-Key: {{api_key}}
```

**Body** (JSON):
```json
{
  "testType": "email_subject",
  "testString": "Get 50% off today!\nLimited time offer\nSave big this weekend",
  "societyName": "UK Marketing Leaders",
  "mode": "async"
}
```

**Expected Response**:
```json
{
  "success": true,
  "jobId": "job_1234567890",
  "message": "Test started successfully"
}
```

### Test 2: Multiple Test Strings (New Format)
**Endpoint**: `POST {{base_url}}/api/societies/test-content`

**Body** (JSON):
```json
{
  "testType": "meta_ad",
  "testStrings": [
    "Transform your business today",
    "Unlock your potential",
    "Join thousands of successful entrepreneurs"
  ],
  "societyName": "UK Enterprise Marketing Leaders",
  "mode": "async"
}
```

### Test 3: Check Job Status
**Endpoint**: `GET {{base_url}}/api/jobs/{{jobId}}`

**Headers**:
```
X-API-Key: {{api_key}}
```

**Expected Response** (Processing):
```json
{
  "jobId": "job_1234567890",
  "status": "processing",
  "progress": 45,
  "message": "Running experiment..."
}
```

**Expected Response** (Completed):
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
    "insights": "Enterprise Marketing Leaders engaged most with transformational messaging...",
    "attention": {
      "full": 45,
      "partial": 30,
      "ignore": 25
    }
  }
}
```

### Test 4: Different Content Types

#### Email Subject Lines
```json
{
  "testType": "email_subject",
  "testStrings": [
    "Your order is ready for pickup",
    "Don't miss out on this deal",
    "Exclusive offer just for you"
  ],
  "societyName": "UK Consumers",
  "mode": "async"
}
```

#### Meta Ad Headlines
```json
{
  "testType": "meta_ad",
  "testStrings": [
    "Boost your ROI by 300%",
    "Increase conversions instantly",
    "Proven strategies that work"
  ],
  "societyName": "UK Marketing Leaders",
  "mode": "async"
}
```

### Test 5: Different Audiences

#### HR Decision-Makers
```json
{
  "testType": "email_subject",
  "testString": "New HR software solution\nStreamline your processes\nReduce admin time by 50%",
  "societyName": "UK HR Decision-Makers",
  "mode": "async"
}
```

#### Mortgage Advisors
```json
{
  "testType": "meta_ad",
  "testString": "Mortgage rates dropping\nBest deals available now\nLock in your rate today",
  "societyName": "UK Mortgage Advisors",
  "mode": "async"
}
```

#### Beauty Lovers
```json
{
  "testType": "email_subject",
  "testString": "New beauty collection\nLimited edition products\nFree shipping on orders over £50",
  "societyName": "UK Beauty Lovers",
  "mode": "async"
}
```

## Testing Workflow

### Step 1: Start Test
1. Send POST request to `/api/societies/test-content`
2. Copy the `jobId` from response
3. Note the `jobId` for status checking

### Step 2: Monitor Progress
1. Send GET request to `/api/jobs/{jobId}`
2. Check `status` field:
   - `"processing"` - Still running
   - `"completed"` - Finished successfully
   - `"failed"` - Error occurred

### Step 3: Analyze Results
When `status: "completed"`, examine:
- `winner` - Which test string won
- `impactScore` - Performance rating
- `averageScore` - Average performance
- `uplift` - Improvement percentage
- `insights` - AI-generated analysis

## Error Testing

### Test 6: Invalid API Key
**Headers**:
```
Content-Type: application/json
X-API-Key: invalid_key
```

**Expected Response**:
```json
{
  "error": "Invalid API key"
}
```

### Test 7: Missing Required Fields
**Body** (JSON):
```json
{
  "testType": "email_subject"
}
```

**Expected Response**:
```json
{
  "error": "Missing required fields: testString, societyName"
}
```

### Test 8: Invalid Job ID
**Endpoint**: `GET {{base_url}}/api/jobs/invalid_job_id`

**Expected Response**:
```json
{
  "error": "Job not found"
}
```

## Performance Testing

### Test 9: Long Test Strings
```json
{
  "testType": "email_subject",
  "testStrings": [
    "This is a very long email subject line that tests the system's ability to handle extended text content and ensure proper processing",
    "Another lengthy subject line with multiple words and phrases to evaluate performance",
    "Third long subject line for comprehensive testing of the automation system"
  ],
  "societyName": "UK Marketing Leaders",
  "mode": "async"
}
```

### Test 10: Maximum Test Strings (10)
```json
{
  "testType": "meta_ad",
  "testStrings": [
    "Headline 1",
    "Headline 2",
    "Headline 3",
    "Headline 4",
    "Headline 5",
    "Headline 6",
    "Headline 7",
    "Headline 8",
    "Headline 9",
    "Headline 10"
  ],
  "societyName": "UK Consumers",
  "mode": "async"
}
```

## Automation Scripts

### Pre-request Script (for jobId tracking)
```javascript
// Store jobId in environment for status checking
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.jobId) {
        pm.environment.set("lastJobId", response.jobId);
    }
}
```

### Test Script (for validation)
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has jobId", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('jobId');
    pm.expect(jsonData.jobId).to.be.a('string');
});

pm.test("Response indicates success", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
});
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if server is running: `pm2 list`
   - Verify API key is correct
   - Check firewall settings

2. **Job Stuck in Processing**
   - Check server logs: `pm2 logs api-server`
   - Verify browser automation is working
   - Check if societies.io is accessible

3. **Invalid Response Format**
   - Verify content type is `application/json`
   - Check request body format
   - Ensure all required fields are present

### Debug Steps

1. **Check Server Status**
   ```bash
   pm2 list
   pm2 logs api-server
   ```

2. **Test Health Endpoint**
   ```
   GET {{base_url}}/health
   ```

3. **Verify API Info**
   ```
   GET {{base_url}}/api/info
   ```

## Expected Results

### Successful Test Flow
1. **Start Test** → Returns `jobId` immediately
2. **Check Status** → Shows `processing` → `completed`
3. **Get Results** → Returns winner, scores, insights

### Typical Processing Time
- **Email Subject Lines**: 2-4 minutes
- **Meta Ad Headlines**: 2-4 minutes
- **Complex Audiences**: 3-5 minutes

### Result Quality Indicators
- **Good Impact Score**: 60+ (Good/Excellent)
- **Positive Uplift**: 10%+ improvement
- **Clear Winner**: One test string significantly outperforms others
- **Actionable Insights**: Specific recommendations provided

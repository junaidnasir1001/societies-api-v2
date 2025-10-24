# Quick Start Guide

## Installation
```bash
npm install
```

## Start API Server
```bash
npm run api
```

## Test API
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

## Check Job Status
```bash
curl http://localhost:3001/api/jobs/{jobId}
```

## Health Check
```bash
curl http://localhost:3001/health
```

## Postman Collection
Import `Societies_New_UI_Postman_Collection.json` for easy testing.

## Content Types
- `Email subject` - For email subject line testing
- `Ad headline` - For Meta ad headline testing

## Audiences
- `UK Marketing Leaders`
- `UK Consumers` 
- `UK HR Decision-Makers`
- And more...

## Response
Returns winner, scores, and insights for your content tests.
# API Usage Examples

## Quick Start

### 1. Start the API Server
```bash
npm run api
```

### 2. Test Email Subject Lines
```bash
curl -X POST http://localhost:3001/api/societies/test-content \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "Email subject",
    "subjectLines": [
      "Get 50% off today!",
      "Limited time offer"
    ],
    "targetAudience": "UK Marketing Leaders",
    "mode": "async"
  }'
```

### 3. Test Ad Headlines
```bash
curl -X POST http://localhost:3001/api/societies/test-content \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "Ad headline",
    "subjectLines": [
      "Save 30% on your first order",
      "Free shipping on orders over $50"
    ],
    "targetAudience": "UK Consumers",
    "mode": "async"
  }'
```

## Available Content Types
- `Email subject` - Email subject lines
- `Ad headline` - Meta ad headlines

## Available Audiences
- `UK Marketing Leaders`
- `UK HR Decision-Makers`
- `UK Mortgage Advisors`
- `UK Beauty Lovers`
- `UK Consumers`
- `UK Journalists`
- `UK Enterprise Marketing Leaders`

## Response Format
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
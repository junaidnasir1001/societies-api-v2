# New UI Update - Societies.io Automation

## Overview
Updated automation to support the new Societies.io UI at `boldspace.societies.io/experiments/new` which removes Google sign-in and uses a simplified experiment creation flow.

## Key Changes

### 1. New UI Flow
- **URL**: `https://boldspace.societies.io/experiments/new` (no Google sign-in required)
- **Content Types**: Email subject, Ad headline (meta_ad)
- **Multiple Test Strings**: Up to 10 subject lines/headlines separated by newlines
- **Audience Selection**: Dropdown with technical values (hr, mortgage_advisors, etc.)

### 2. API Updates

#### New Content Types
- `email_subject` - Email subject lines
- `meta_ad` - Meta ad headlines

#### New Audience Mapping
- "UK National Representative" → `uk_national` (default)
- "UK HR Decision-Makers" → `hr`
- "UK Mortgage Advisors" → `mortgage_advisors`
- "UK Beauty Lovers" → `beauty_lovers`
- "UK Consumers" → `consumers`
- "UK Journalists" → `journalists`
- "UK Marketing Leaders" → `marketing_leaders`
- "UK Enterprise Marketing Leaders" → `enterprise_marketing_leaders`

#### API Input Support
- **Single string**: `testString: "line1\nline2"`
- **Array format**: `testStrings: ["line1", "line2"]` (automatically joined with newlines)

#### New Response Fields
```json
{
  "results": {
    "impactScore": { "value": "57", "rating": "Average" },
    "attention": { "full": 0, "partial": 0, "ignore": 0 },
    "insights": "Enterprise Marketing Leaders engaged...",
    "winner": "line2",
    "averageScore": "50",
    "uplift": "14"
  }
}
```

### 3. Technical Changes

#### Headless Mode
- **Before**: `headless: false` (Google sign-in detection)
- **After**: `headless: true` (no Google sign-in needed)

#### Result Extraction
- Extracts winner text, impact score, average score, uplift percentage
- Maintains backward compatibility with existing attention metrics
- New insights text extraction from results page

### 4. Usage Examples

#### Single Test String
```bash
curl -X POST http://localhost:3001/api/societies/test-content \
  -H "Content-Type: application/json" \
  -d '{
    "testType": "email_subject",
    "testString": "line1\nline2",
    "societyName": "UK Marketing Leaders",
    "mode": "async"
  }'
```

#### Multiple Test Strings
```bash
curl -X POST http://localhost:3001/api/societies/test-content \
  -H "Content-Type: application/json" \
  -d '{
    "testType": "meta_ad",
    "testStrings": ["line1", "line2", "line3"],
    "societyName": "UK Enterprise Marketing Leaders",
    "mode": "async"
  }'
```

### 5. RapidMCP Configuration

#### Tool 1: SocietiesStart
- **Endpoint**: `http://161.35.34.121:3001/api/societies/test-content`
- **Method**: POST
- **Body**: `{"testType": "{{properties.testType}}", "testString": "{{properties.testString}}", "societyName": "{{properties.societyName}}", "mode": "async"}`

#### Tool 2: SocietiesStatus
- **Endpoint**: `http://161.35.34.121:3001/api/jobs/{{properties.jobId}}`
- **Method**: GET

### 6. Benefits
- **No Google Sign-in**: Direct access to new UI
- **Headless Mode**: Faster execution, no display needed
- **Multiple Test Strings**: Support for A/B testing up to 10 variations
- **Rich Results**: Winner, scores, uplift, insights
- **Backward Compatible**: Existing API calls still work

### 7. Migration Notes
- Old Google sign-in flow completely removed
- Modal/popup handling logic removed
- Society selection now uses dropdown mapping
- Result extraction updated for new UI structure
- All existing API endpoints maintained with enhanced functionality

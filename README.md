# Societies.io Browserbase Automation

Automate Google sign-in → SSO into societies.io → run simulation → extract results as JSON.

## Setup

### 1. Environment
Copy `.env.example` to `.env` and configure:
```bash
BROWSERBASE_WS_ENDPOINT=  # Optional: Browserbase WebSocket URL
GOOGLE_EMAIL=             # Your Google email
GOOGLE_PASSWORD=          # Your Google password
```

### 2. Install
```bash
npm install
npx playwright install  # Download browser binaries
```

## Usage

### CLI (Auto-saves to `runs/<timestamp>.json`)
```bash
# Demo mode
npm run dev

# Custom inputs
npm run simulate -- --society="Startup Investors" --test="Article" --text="Your content here"

# Provider-agnostic (inject Browserbase session)
npm run dev -- --wsEndpoint="wss://connect.browserbase.com/..."

# Override output location
npm run dev -- --output="custom-result.json"
```

### HTTP Endpoint
```bash
# Start server
npm run server  # Listens on :3000

# POST request
curl -X POST http://localhost:3000/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "society": "Startup Investors",
    "test": "Article",
    "text": "Your content here",
    "wsEndpoint": "wss://..."  // optional
  }'
```

### Programmatic
```javascript
import { run } from "./src/index.js";

const result = await run({
  society: "Startup Investors",
  test: "Article",
  text: "Your content",
  wsEndpoint: "wss://...",  // optional
  runId: "custom-id"        // optional
});
```

## Output Format

Results are saved to `runs/<timestamp>.json`:

```json
{
  "society": "Startup Investors",
  "test": "Article",
  "text": "Your content",
  "result": {
    "plainText": "...",
    "html": "...",
    "extras": {
      "impactScore": { "value": 44, "max": 100, "rating": "Low" },
      "attention": { "full": 12, "partial": 66, "ignore": 22 },
      "insights": "..."
    }
  },
  "metadata": {
    "timingsMs": {
      "googleLogin": 0,
      "simulate": 218682,
      "total": 221670
    },
    "runId": "run_1760024607875",
    "url": "https://app.societies.io/"
  }
}
```

## Features

✅ **Provider-agnostic**: Accepts `wsEndpoint` param for Browserbase or any CDP provider  
✅ **Auto-save**: Results saved to `runs/<timestamp>.json`  
✅ **Retry logic**: Single retry if results panel timeout  
✅ **Clean logs**: No PII logged  
✅ **Validated output**: JSON schema validation with Ajv  

## How It Works

1. **Google SSO**: Automated login via "Continue with Google"
2. **Society selection**: Clicks society card (e.g., "Startup Investors")
3. **Test creation**: Clicks "Create New Test" → selects template
4. **Input fill**: Enters text content
5. **Simulation**: Clicks "Simulate" button
6. **Results wait**: 
   - ✅ Wait for "Impact Score" heading
   - ✅ Wait for score value (e.g., "44/100")
   - ✅ Wait for "Attention" section
   - ✅ Wait for "Insights" section
   - ✅ Wait for spinner to disappear
   - ✅ Wait for DOM stability (800ms)
7. **Extraction**: Extract plainText, html, and structured extras

## Notes

- **Headless mode**: Google detects headless browsers as bots. Use Browserbase for production or `headless: false` for local testing.
- **No secrets in logs**: PII and credentials are never logged.
- **Retry**: If results panel doesn't stabilize, one automatic retry occurs.
- **Output structure**: `plainText` and `html` are guaranteed. `extras` are optional structured data.


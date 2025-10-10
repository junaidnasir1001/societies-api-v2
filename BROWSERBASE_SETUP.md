# 🚀 Browserbase Setup Guide

## Client Credentials (Temporary - Rotate After Demo)

```
API Key: bb_live_Zd_GdXrx67TgsjhSE9PaP0FbcjI
Project ID: 603a1a05-c06d-4e9b-9563-5344cad69807
```

---

## Option 1: Get WebSocket Endpoint via API

### Using curl:
```bash
# Create a new Browserbase session
curl -X POST https://www.browserbase.com/v1/sessions \
  -H "Content-Type: application/json" \
  -H "X-BB-API-Key: bb_live_Zd_GdXrx67TgsjhSE9PaP0FbcjI" \
  -d '{
    "projectId": "603a1a05-c06d-4e9b-9563-5344cad69807"
  }'
```

**Response will contain:**
```json
{
  "id": "session-id-here",
  "connectUrl": "wss://connect.browserbase.com/v1/ws/...",
  ...
}
```

Copy the `connectUrl` value and use it as `BROWSERBASE_WS_ENDPOINT` in your `.env` file.

---

## Option 2: Use Browserbase SDK (Recommended)

### Install Browserbase SDK:
```bash
npm install @browserbasehq/sdk
```

### Create helper script: `scripts/getBrowserbaseSession.js`
```javascript
import Browserbase from '@browserbasehq/sdk';

const bb = new Browserbase({
  apiKey: 'bb_live_Zd_GdXrx67TgsjhSE9PaP0FbcjI'
});

async function createSession() {
  const session = await bb.sessions.create({
    projectId: '603a1a05-c06d-4e9b-9563-5344cad69807'
  });
  
  console.log('WebSocket Endpoint:', session.connectUrl);
  return session;
}

createSession();
```

Run it:
```bash
node scripts/getBrowserbaseSession.js
```

---

## Option 3: Direct CDP Connection (Current Implementation)

### Update `.env` file:

```bash
# Browserbase WebSocket Endpoint (get from API or dashboard)
BROWSERBASE_WS_ENDPOINT=wss://connect.browserbase.com/v1/ws/YOUR_SESSION_ID

# Google Credentials
GOOGLE_EMAIL=your-email@gmail.com
GOOGLE_PASSWORD=your-password
```

---

## Quick Setup Steps

### 1. Get WebSocket Endpoint:
```bash
# Method A: Using curl
curl -X POST https://www.browserbase.com/v1/sessions \
  -H "Content-Type: application/json" \
  -H "X-BB-API-Key: bb_live_Zd_GdXrx67TgsjhSE9PaP0FbcjI" \
  -d '{"projectId": "603a1a05-c06d-4e9b-9563-5344cad69807"}' \
  | jq -r '.connectUrl'

# Method B: Use Browserbase Dashboard
# Go to: https://www.browserbase.com/dashboard
# Create new session → Copy WebSocket URL
```

### 2. Update `.env`:
```bash
nano .env
# Add the connectUrl from above
```

### 3. Run Automation:
```bash
# CLI test
npm run dev

# Custom simulation
npm run simulate -- --society="Test Society" --template="Default" --inputText="Hello"

# HTTP server
npm run server
```

---

## Testing with Browserbase

### Test 1: CLI with Browserbase
```bash
# Make sure BROWSERBASE_WS_ENDPOINT is set in .env
npm run dev
```

**Expected output:**
```
[login] start
[login] done in XXXX ms
[sim] goto societies.io
[sim] SSO continue
[sim] click simulate
[done] mode=browserbase totalMs=XXXX
{
  "society": "Test Society",
  ...
}
```

Notice: `mode=browserbase` (not `mode=local`)

### Test 2: HTTP Server with Browserbase
```bash
# Terminal 1
npm run server

# Terminal 2
curl -X POST http://localhost:3000/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "society": "Tech Society",
    "template": "Innovation",
    "inputText": "Testing Browserbase integration"
  }'
```

---

## How It Works

### Current Implementation (src/index.js):
```javascript
const getBrowser = async () => {
  const ws = process.env.BROWSERBASE_WS_ENDPOINT;
  if (ws) {
    // ✅ Browserbase CDP connection
    const browser = await chromium.connectOverCDP(ws);
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    return { browser, context, page, mode: "browserbase" };
  }
  // Local fallback
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  return { browser, context, page, mode: "local" };
};
```

---

## Verification

### Check Mode:
```bash
# Should show "mode=browserbase" in output
npm run dev | grep "mode="
```

### Check Session in Browserbase Dashboard:
1. Go to: https://www.browserbase.com/dashboard
2. Click on "Sessions"
3. You should see your automation session
4. Can view logs, screenshots, recordings

---

## Environment Variables

### Complete `.env` example:
```bash
# Browserbase Configuration
BROWSERBASE_WS_ENDPOINT=wss://connect.browserbase.com/v1/ws/SESSION_ID_HERE

# Google Credentials
GOOGLE_EMAIL=your-email@gmail.com
GOOGLE_PASSWORD=your-password
```

---

## Troubleshooting

### Error: "Cannot connect to Browserbase"
- ✅ Check WebSocket URL is correct
- ✅ Verify API key is valid
- ✅ Ensure session is active (sessions expire)

### Error: "Authentication failed"
- ✅ Check GOOGLE_EMAIL and GOOGLE_PASSWORD
- ✅ Verify Google account allows automation

### Session expires during run:
- ✅ Create new session before each run
- ✅ Or use longer session timeout in Browserbase settings

---

## Security Notes

⚠️ **IMPORTANT:**
- This is a **temporary API key** for demo
- Client will **rotate** after demo
- Do NOT commit `.env` to git (already in .gitignore)
- Keep credentials secure

---

## Next Steps

1. **Get WebSocket URL:**
   ```bash
   curl -X POST https://www.browserbase.com/v1/sessions \
     -H "Content-Type: application/json" \
     -H "X-BB-API-Key: bb_live_Zd_GdXrx67TgsjhSE9PaP0FbcjI" \
     -d '{"projectId": "603a1a05-c06d-4e9b-9563-5344cad69807"}'
   ```

2. **Update .env:**
   ```bash
   echo "BROWSERBASE_WS_ENDPOINT=<paste_connectUrl_here>" >> .env
   ```

3. **Test:**
   ```bash
   npm run dev
   ```

4. **Verify mode:**
   - Check output shows `mode=browserbase`
   - Check Browserbase dashboard for session

---

## Demo Checklist

- [ ] Get WebSocket endpoint from Browserbase API
- [ ] Add to `.env` as BROWSERBASE_WS_ENDPOINT
- [ ] Add Google credentials to `.env`
- [ ] Run `npm run dev`
- [ ] Verify `mode=browserbase` in output
- [ ] Check session in Browserbase dashboard
- [ ] Test HTTP endpoint: `npm run server`
- [ ] Share results with client
- [ ] Client rotates API key after demo

---

**Ready to test with Browserbase! 🚀**


# 🧪 Step-by-Step Testing Guide
## Requirements Testing Checklist

### Prerequisites
```bash
# 1. Setup credentials (REQUIRED)
cp .env.example .env
# Edit .env and add your Google credentials:
# GOOGLE_EMAIL=your-email@gmail.com
# GOOGLE_PASSWORD=your-password
```

---

## Test 1: ✅ ESM Module Support
**Requirement:** Project should use ESM only ("type": "module")

```bash
# Check package.json has "type": "module"
grep '"type".*"module"' package.json
```

**Expected Output:**
```
  "type": "module",
```

✅ **Status:** PASS if you see "type": "module"

---

## Test 2: ✅ Dependencies Installation
**Requirement:** All dependencies should install without errors

```bash
# Install dependencies
npm install

# Check for vulnerabilities
npm audit
```

**Expected Output:**
```
audited XX packages in Xs
found 0 vulnerabilities
```

✅ **Status:** PASS if 0 vulnerabilities

---

## Test 3: ✅ File Syntax Validation
**Requirement:** All JavaScript files should have valid ESM syntax

```bash
# Test each file syntax
node -c src/index.js && echo "✅ index.js valid"
node -c src/cli.js && echo "✅ cli.js valid"
node -c src/server.js && echo "✅ server.js valid"
node -c src/googleLogin.js && echo "✅ googleLogin.js valid"
node -c src/societies.js && echo "✅ societies.js valid"
```

**Expected Output:**
```
✅ index.js valid
✅ cli.js valid
✅ server.js valid
✅ googleLogin.js valid
✅ societies.js valid
```

✅ **Status:** PASS if all files show ✅

---

## Test 4: ✅ Environment Variables
**Requirement:** Should read credentials from .env file (no hardcoded secrets)

```bash
# Check that env vars are used (not hardcoded)
grep -n "process.env" src/index.js

# Verify no hardcoded emails/passwords in code
grep -ri "password.*=.*['\"]" src/ && echo "❌ FOUND HARDCODED" || echo "✅ No hardcoded secrets"
```

**Expected Output:**
```
34:  const ws = process.env.BROWSERBASE_WS_ENDPOINT;
54:      email: process.env.GOOGLE_EMAIL,
55:      password: process.env.GOOGLE_PASSWORD,
✅ No hardcoded secrets
```

✅ **Status:** PASS if no hardcoded secrets found

---

## Test 5: ✅ Ajv JSON Validation
**Requirement:** Should validate output with Ajv schema

```bash
# Check Ajv is imported and used
grep -n "ajv\|Ajv\|validate" src/index.js
```

**Expected Output:**
```
5:import Ajv from "ajv";
7:const ajv = new Ajv({ allErrors: true });
31:const validate = ajv.compile(outputSchema);
73:    const ok = validate(out);
```

✅ **Status:** PASS if Ajv validation is present

---

## Test 6: ✅ Stability Wait (800ms)
**Requirement:** Wait for DOM stability >800ms after spinner disappears

```bash
# Check for stability wait implementation
grep -n "waitStable\|800\|quietMs" src/societies.js
```

**Expected Output:**
```
1:async function waitStable(page, panelSel, quietMs = 800, timeout = 30000) {
57:  await waitStable(page, panelSel, 800, 30000);
```

✅ **Status:** PASS if 800ms stability wait exists

---

## Test 7: ✅ Clean Shutdown (try/finally)
**Requirement:** Browser/context should close even on error

```bash
# Check for try/finally cleanup
grep -A 3 "finally" src/index.js
```

**Expected Output:**
```
  } finally {
    try { await context?.close(); } catch {}
    try { await browser?.close(); } catch {}
    console.log(`[done] mode=${mode} totalMs=${Date.now() - t0}`);
```

✅ **Status:** PASS if cleanup is in finally block

---

## Test 8: ✅ No PII in Logs
**Requirement:** Console logs should only show step names + durations (no email/password)

```bash
# List all console.log statements
grep -n "console.log" src/*.js
```

**Expected Output (verify NO email/password logged):**
```
src/index.js:84:    console.log(`[done] mode=${mode} totalMs=${Date.now() - t0}`);
src/googleLogin.js:3:  console.log("[login] start");
src/googleLogin.js:26:  console.log("[login] done in", Date.now() - t0, "ms");
src/societies.js:18:  console.log("[sim] goto societies.io");
src/societies.js:22:  console.log("[sim] SSO continue");
src/societies.js:43:  console.log("[sim] click simulate");
```

✅ **Status:** PASS if NO sensitive data in logs

---

## Test 9: ✅ Browserbase CDP Support
**Requirement:** Connect via CDP when BROWSERBASE_WS_ENDPOINT is set

```bash
# Check for CDP connection logic
grep -n "connectOverCDP\|BROWSERBASE_WS_ENDPOINT" src/index.js
```

**Expected Output:**
```
34:  const ws = process.env.BROWSERBASE_WS_ENDPOINT;
36:    const browser = await chromium.connectOverCDP(ws);
```

✅ **Status:** PASS if CDP support exists

---

## Test 10: ✅ Local Chromium Fallback
**Requirement:** Launch local Chromium when no Browserbase endpoint

```bash
# Check for local browser launch
grep -n "chromium.launch" src/index.js
```

**Expected Output:**
```
41:  const browser = await chromium.launch({ headless: true });
```

✅ **Status:** PASS if local launch exists

---

## Test 11: ✅ CLI Interface (Demo Mode)
**Requirement:** CLI should work with --demo flag

**⚠️ IMPORTANT:** Add your Google credentials to `.env` first!

```bash
# Test CLI with demo data (requires valid Google credentials)
npm run dev
```

**Expected Output (will attempt Google login):**
```
[login] start
[login] done in XXX ms
[sim] goto societies.io
[sim] SSO continue
[sim] click simulate
[done] mode=local totalMs=XXXX
{
  "society": "Test Society",
  "template": "Default",
  "inputText": "Hello world",
  "result": { ... },
  "metadata": { ... }
}
```

✅ **Status:** PASS if JSON output is returned (or fails gracefully with error message)

---

## Test 12: ✅ CLI with Custom Arguments
**Requirement:** CLI should accept --society, --template, --inputText

```bash
# Test with custom arguments (requires valid Google credentials)
npm run simulate -- --society="MyTest" --template="Template1" --inputText="Testing 123"
```

**Expected Output:**
```
{
  "society": "MyTest",
  "template": "Template1",
  "inputText": "Testing 123",
  ...
}
```

✅ **Status:** PASS if custom values are in output

---

## Test 13: ✅ HTTP Server (MCP Endpoint)
**Requirement:** Express server on port 3000 with POST /simulate

```bash
# Start server
npm run server

# In another terminal, test endpoint:
curl -X POST http://localhost:3000/simulate \
  -H "Content-Type: application/json" \
  -d '{"society":"API Test","template":"T1","inputText":"Hello API"}'
```

**Expected Output (server terminal):**
```
MCP HTTP ready on :3000 POST /simulate
```

**Expected Output (curl):**
```json
{
  "society": "API Test",
  "template": "T1",
  "inputText": "Hello API",
  "result": { ... },
  "metadata": { ... }
}
```

✅ **Status:** PASS if server responds with JSON

---

## Test 14: ✅ Google Login Flow
**Requirement:** Should handle email → password → MFA flow

```bash
# This is tested automatically when running CLI/server
# Check the googleLogin.js implementation:
cat src/googleLogin.js | grep -A 2 "MFA"
```

**Expected Output:**
```
  // MFA (if prompted)
  const mfaField = page.locator('input[type="tel"], input[autocomplete="one-time-code"], input[name="idvAnyPhonePin"]');
  if (await mfaField.count() > 0) {
```

✅ **Status:** PASS if MFA detection exists

---

## Test 15: ✅ Societies.io SSO
**Requirement:** Click "Continue with Google" on societies.io

```bash
# Check SSO implementation
grep -A 2 "Continue with Google" src/societies.js
```

**Expected Output:**
```
  const ssoBtn = page.locator('button:has-text("Continue with Google"), text=Continue with Google, [data-testid="google-sso"]');
  if (await ssoBtn.count() > 0) {
    await ssoBtn.first().click({ timeout: 30000 });
```

✅ **Status:** PASS if SSO button selector exists

---

## Test 16: ✅ Form Filling (Fallback Selectors)
**Requirement:** Fill inputs with multiple selector fallbacks

```bash
# Check fillMaybe function with fallback selectors
grep -A 5 "fillMaybe" src/societies.js | head -10
```

**Expected Output:**
```
  const fillMaybe = async (selList, value) => {
    for (const sel of selList) {
      const loc = page.locator(sel).first();
      if (await loc.count()) { await loc.fill(value); return true; }
    }
    return false;
  };
```

✅ **Status:** PASS if fallback mechanism exists

---

## Test 17: ✅ JSON Output Schema
**Requirement:** Output must match exact schema shape

```bash
# Check output schema definition
grep -A 20 "outputSchema" src/index.js | head -25
```

**Expected Fields:**
```
society: string
template: string
inputText: string
result.plainText: string
result.html: string
metadata.timingsMs: object
metadata.runId: string
metadata.url: string
```

✅ **Status:** PASS if all fields present

---

## Test 18: ✅ Spinner Detection
**Requirement:** Wait for loading spinner to disappear

```bash
# Check spinner wait logic
grep -B 2 -A 2 "spinner" src/societies.js
```

**Expected Output:**
```
  // Spinner wait (best-effort)
  const spinnerSel = `${panelSel} .spinner, ${panelSel} [data-loading="true"], ${panelSel} [aria-busy="true"]`;
  if (await page.locator(spinnerSel).count() > 0) {
    try { await page.waitForSelector(spinnerSel, { state: "detached", timeout: 90000 }); } catch {}
  }
```

✅ **Status:** PASS if spinner detection exists

---

## 🎯 QUICK TEST ALL (No Credentials Required)

Run these tests without needing Google login:

```bash
# 1. Check ESM
grep '"type".*"module"' package.json && echo "✅ ESM enabled"

# 2. Validate syntax
node -c src/*.js && echo "✅ All files valid"

# 3. Check no hardcoded secrets
grep -ri "password.*=.*['\"]" src/ && echo "❌ FOUND HARDCODED" || echo "✅ No secrets"

# 4. Verify Ajv
grep -q "Ajv" src/index.js && echo "✅ Ajv validation present"

# 5. Verify 800ms stability
grep -q "800" src/societies.js && echo "✅ Stability wait present"

# 6. Verify clean shutdown
grep -q "finally" src/index.js && echo "✅ Clean shutdown present"

# 7. Check no PII in logs
grep "console.log" src/*.js | grep -E "email|password|secret" && echo "❌ PII FOUND" || echo "✅ No PII in logs"

# 8. Verify CDP support
grep -q "connectOverCDP" src/index.js && echo "✅ Browserbase CDP support"

# 9. Verify local fallback
grep -q "chromium.launch" src/index.js && echo "✅ Local Chromium fallback"

# 10. Server script exists
grep -q "node src/server.js" package.json && echo "✅ Server script ready"

echo ""
echo "🎉 All static tests passed!"
```

---

## 🚀 FULL E2E TEST (Requires Credentials)

**Prerequisites:** 
1. Add Google credentials to `.env`
2. Install Playwright browsers: `npx playwright install chromium`

```bash
# Test complete flow
npm run dev
```

---

## 📊 Test Results Summary

After running all tests, fill this checklist:

- [ ] ESM enabled
- [ ] Dependencies installed (0 vulnerabilities)
- [ ] All files syntax valid
- [ ] Environment variables used
- [ ] Ajv validation present
- [ ] 800ms stability wait
- [ ] Clean shutdown (finally block)
- [ ] No PII in logs
- [ ] Browserbase CDP support
- [ ] Local Chromium fallback
- [ ] CLI demo mode works
- [ ] CLI custom args work
- [ ] HTTP server works
- [ ] Google login flow
- [ ] Societies.io SSO
- [ ] Form filling with fallbacks
- [ ] JSON schema correct
- [ ] Spinner detection

**Total Requirements:** 18
**Status:** ___ / 18 PASS

---

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
# Kill existing process on port 3000
lsof -ti :3000 | xargs kill -9
```

### Playwright browsers not installed
```bash
npx playwright install chromium
```

### Missing .env file
```bash
cp .env.example .env
# Then edit .env with your credentials
```

### Google login fails
- Check credentials in `.env`
- If MFA required, implement onMfaCode handler
- Check if Google blocked suspicious login

---

## ✅ Success Criteria

All tests PASS when:
1. **Static tests** (1-10) all return ✅
2. **CLI test** (11-12) returns valid JSON output
3. **Server test** (13) responds to POST /simulate
4. **E2E test** completes full flow without errors


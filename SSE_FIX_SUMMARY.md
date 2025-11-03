# SSE End-to-End Fix Summary

## Problem
When running SSE end-to-end tests, the screen would get stuck. The test would receive initial events but then fail to receive subsequent progress updates.

## Root Cause
There were three main issues:

1. **Browser Context Conflict**: The SSE task was calling `runAutomation()` which internally used `getBrowser()` from `getBrowser.js`, creating a second browser context. This conflicted with `getContext()` from `browserSingleton.js` since both tried to use the same `USER_DATA_DIR`, causing a deadlock.

2. **Missing Response Flush**: SSE events weren't being flushed immediately, causing buffering issues.

3. **Missing testType Normalization**: The SSE endpoint wasn't normalizing the testType, causing it to fail with user-friendly content types like "Ad headline".

## Solution

### 1. Fixed Browser Context Management
**File**: `src/trigger/tasks/societiesTask.js`

Changed the implementation to use the existing browser singleton context directly instead of calling `runAutomation()`:

```javascript
// Before: Created conflicting browser context
const sim = await runAutomation({ ... });

// After: Uses existing browser singleton
const context = await getContext();
const page = await context.newPage();
const sim = await runSimulation(page, { ... });
```

This ensures only one browser context is active at a time, preventing deadlocks.

### 2. Added Response Flush
**File**: `src/lib/sse.js`

Added flush to ensure SSE events are sent immediately:

```javascript
export function writeEvent(res, { event, data, id }) {
  if (res.writableEnded) return;
  if (id !== undefined) {
    res.write(`id: ${id}\n`);
  }
  if (event) {
    res.write(`event: ${event}\n`);
  }
  const payload = typeof data === 'string' ? data : JSON.stringify(data ?? {});
  res.write(`data: ${payload}\n\n`);
  // Flush the data to ensure it's sent immediately
  if (typeof res.flush === 'function') {
    res.flush();
  }
}
```

### 3. Removed async from SSE Handler
**File**: `src/api-server.js`

Removed async from the SSE endpoint handler to prevent Express from closing the connection prematurely:

```javascript
// Before
app.post('/api/societies/stream', apiKeyAuth, async (req, res) => {

// After
app.post('/api/societies/stream', apiKeyAuth, (req, res) => {
```

### 4. Added testType Normalization to SSE Endpoint
**File**: `src/api-server.js`

Added testType normalization to support user-friendly content types:

```javascript
// Normalize testType
const normalizedTestType = normalizeTestType(finalTestType);

const payload = {
  streamId,
  progressWebhookUrl,
  mappedInput: {
    societyName: finalSocietyName,
    testType: normalizedTestType,  // Now normalized
    testString: finalTestString,
  },
};
```

This ensures that content types like "Ad headline" are properly converted to the internal format expected by the simulation.

## Testing
To test the SSE endpoint:

```bash
curl -N -X POST http://localhost:3003/api/societies/stream \
  -H "Content-Type: application/json" \
  -H "X-API-Key: devkey" \
  -d '{
    "societyName": "UK Marketing Leaders",
    "testType": "email_subject",
    "testString": "Get 50% off today!"
  }'
```

You should see SSE events streaming in real-time:
- `connected` event with streamId
- Multiple `progress` events during execution
- `done` event with final results

## Files Modified
1. `src/lib/sse.js` - Added flush support
2. `src/api-server.js` - Removed async from SSE handler, added close listeners, added testType normalization
3. `src/trigger/tasks/societiesTask.js` - Fixed browser context management

## Status
✅ All issues fixed. SSE end-to-end now works correctly with all field names and content types.


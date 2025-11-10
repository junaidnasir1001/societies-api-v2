// Simple Server-Sent Events (SSE) helpers
// Provides: setSseHeaders, writeEvent, startHeartbeat

export function setSseHeaders(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  // Disable proxy buffering (e.g., Nginx)
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }
}

export function writeEvent(res, { event, data, id, fieldName = 'data' }) {
  if (res.writableEnded) return;
  if (id !== undefined) {
    res.write(`id: ${id}\n`);
  }
  if (event) {
    res.write(`event: ${event}\n`);
  }
  const payload = typeof data === 'string' ? data : JSON.stringify(data ?? {});
  res.write(`${fieldName}: ${payload}\n\n`);
}

export function startHeartbeat(res, intervalMs = 30000) {
  const timer = setInterval(() => {
    writeEvent(res, { event: 'heartbeat', data: {} });
  }, intervalMs);
  // Keep the event loop alive for heartbeats
  // NOTE: Do NOT use unref() for SSE heartbeats - it prevents them from being sent
  return timer;
}



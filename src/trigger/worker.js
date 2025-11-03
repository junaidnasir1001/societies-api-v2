import { configure, task } from '@trigger.dev/sdk/v3';
import { runSocietiesTask } from './tasks/societiesTask.js';

// Configure Trigger.dev SDK
if (process.env.TRIGGER_API_KEY) {
  configure({
    accessToken: process.env.TRIGGER_API_KEY,
    baseURL: process.env.TRIGGER_API_URL || 'https://api.trigger.dev',
  });
} else {
  console.warn('[Trigger.dev] TRIGGER_API_KEY not set, Trigger.dev features will be unavailable');
}

let Sentry = { captureException: () => {} };
if (process.env.SENTRY_DSN) {
  try {
    const mod = await import('@sentry/node');
    Sentry = mod;
    Sentry.init({ dsn: process.env.SENTRY_DSN });
  } catch {}
}

// Define the Trigger.dev task that wraps runSocietiesTask
export const societiesTask = task({
  id: 'societies-task',
  name: 'Societies Simulation Task',
  run: async (payload, io, ctx) => {
    const { streamId, progressWebhookUrl } = payload || {};
    try {
      const result = await runSocietiesTask(payload, console);

      // Post final done event to the existing progress webhook
      if (progressWebhookUrl && streamId) {
        try {
          await fetch(progressWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              streamId,
              type: 'done',
              result: { results: result?.results },
              meta: result?.meta || { streamId },
            }),
          });
        } catch (e) {
          console.error('[societiesTask] Failed to POST done webhook', e?.message);
        }
      }

      return result;
    } catch (error) {
      // Post error to webhook so SSE can forward it
      if (progressWebhookUrl && streamId) {
        try {
          await fetch(progressWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              streamId,
              type: 'error',
              message: error?.message || 'Task failed',
            }),
          });
        } catch {}
      }

      Sentry.captureException?.(error);
      throw error;
    }
  },
});

// Legacy export for backward compatibility
export async function handleSocietiesTask(payload) {
  try {
    return await runSocietiesTask(payload, console);
  } catch (error) {
    Sentry.captureException?.(error);
    throw error;
  }
}

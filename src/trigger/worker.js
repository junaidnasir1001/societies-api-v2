import { runSocietiesTask } from './tasks/societiesTask.js';

// NOTE: This file assumes a Trigger.dev SDK integration will call into
// runSocietiesTask(payload). The exact SDK wiring can be added here.

let Sentry = { captureException: () => {} };
if (process.env.SENTRY_DSN) {
  try {
    const mod = await import('@sentry/node');
    Sentry = mod;
    Sentry.init({ dsn: process.env.SENTRY_DSN });
  } catch {}
}

// Placeholder export for future Trigger.dev SDK wiring
export async function handleSocietiesTask(payload) {
  try {
    return await runSocietiesTask(payload, console);
  } catch (error) {
    Sentry.captureException?.(error);
    throw error;
  }
}



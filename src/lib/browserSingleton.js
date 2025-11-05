import { chromium } from 'playwright';
import { ensureSessionDirs, USER_DATA_DIR } from '../sessionPaths.js';

let context = null;
let launching = false;

async function launchPersistent() {
  ensureSessionDirs();
  const isHeadless = process.env.HEADLESS === 'true' || process.env.HEADLESS === true;
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: isHeadless,
    viewport: { width: 1280, height: 800 },
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure',
    ],
  });
  // Auto relaunch on crash/close
  ctx.on('close', () => {
    context = null;
  });
  return ctx;
}

export async function getContext() {
  while (launching) {
    await new Promise((r) => setTimeout(r, 50));
  }
  if (context) return context;
  launching = true;
  try {
    context = await launchPersistent();
    return context;
  } finally {
    launching = false;
  }
}

export async function ensureAlive() {
  if (!context) {
    context = await getContext();
    return context;
  }
  try {
    const page = await context.newPage();
    await page.close();
    return context;
  } catch {
    context = null;
    return await getContext();
  }
}

let relaunching = false;
export async function relaunchOnCrash() {
  if (relaunching) return;
  relaunching = true;
  try {
    context = null;
    await getContext();
  } finally {
    relaunching = false;
  }
}

async function gracefulClose() {
  try {
    if (context) {
      await context.close();
    }
  } catch {}
}

process.on('SIGINT', async () => {
  await gracefulClose();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await gracefulClose();
  process.exit(0);
});



import { chromium } from "playwright";
import fs from "fs";
import {
  SESSION_HOME,
  USER_DATA_DIR,
  STORAGE_STATE,
  ensureSessionDirs,
} from "./sessionPaths.js";

export async function getBrowser() {
  ensureSessionDirs();

  console.error("[session] cwd=", process.cwd());
  console.error("[session] SESSION_HOME=", SESSION_HOME);
  console.error("[session] USER_DATA_DIR=", USER_DATA_DIR);
  console.error("[session] storageState exists=", fs.existsSync(STORAGE_STATE));

  // One real Chrome profile shared by CLI & Claude Desktop
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,                  // headful mode to see automation in action
    viewport: { width: 1280, height: 800 },
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-features=SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure",
      "--host-resolver-rules=MAP app.societies.io 52.74.6.109,MAP supa.societies.io 104.18.38.10,MAP aaeijppikwalijkoingt.supabase.co 104.18.38.10"
    ],
  });

  // If a storage state file exists, hydrate cookies and localStorage into the persistent context
  try {
    if (fs.existsSync(STORAGE_STATE)) {
      console.error("[session] Loading storage state from", STORAGE_STATE);
      const raw = fs.readFileSync(STORAGE_STATE, "utf-8");
      const state = JSON.parse(raw);

      // Restore cookies
      if (Array.isArray(state.cookies) && state.cookies.length > 0) {
        await context.addCookies(state.cookies);
        console.error(`[session] Restored ${state.cookies.length} cookies`);
      }

      // Restore localStorage per-origin
      if (Array.isArray(state.origins)) {
        for (const origin of state.origins) {
          if (!origin?.origin) continue;
          const temp = await context.newPage();
          try {
            await temp.goto(origin.origin, { waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => {});
            if (Array.isArray(origin.localStorage) && origin.localStorage.length > 0) {
              await temp.evaluate((items) => {
                for (const { name, value } of items) {
                  try { localStorage.setItem(name, value); } catch {}
                }
              }, origin.localStorage);
              console.error(`[session] Restored ${origin.localStorage.length} localStorage items for ${origin.origin}`);
            }
          } finally {
            await temp.close().catch(() => {});
          }
        }
      }
    }
  } catch (e) {
    console.error("[session] ⚠️ Failed to apply storage state:", e.message);
  }

  const page = await context.newPage();
  return { context, page, mode: "local-persistent" };
}

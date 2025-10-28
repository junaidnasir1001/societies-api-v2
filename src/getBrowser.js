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
    headless: true,                  // headful mode to see automation in action
    viewport: { width: 1280, height: 800 },
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--use-gl=swiftshader",
      "--window-size=1280,800",
      "--disable-blink-features=AutomationControlled",
      "--disable-features=SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure",
      "--host-resolver-rules=MAP app.societies.io 52.74.6.109,MAP supa.societies.io 104.18.38.10,MAP aaeijppikwalijkoingt.supabase.co 104.18.38.10"
    ],
  });

  const page = await context.newPage();
  return { context, page, mode: "local-persistent" };
}

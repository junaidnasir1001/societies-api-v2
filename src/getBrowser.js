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

  // Headless mode configurable via env (HEADLESS/PLAYWRIGHT_HEADLESS)
  const headlessEnv = process.env.HEADLESS ?? process.env.PLAYWRIGHT_HEADLESS ?? "true";
  const headless = /^(1|true|yes)$/i.test(String(headlessEnv));
  console.error(`[session] headless=`, headless);

  // One real Chrome profile shared by CLI & Claude Desktop
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless,
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    locale: "en-GB",
    timezoneId: "Europe/London",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--use-gl=swiftshader",
      "--disable-software-rasterizer",
      "--no-zygote",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--disable-features=TranslateUI,site-per-process,SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure",
      "--force-color-profile=srgb",
      "--window-size=1280,800",
      "--disable-blink-features=AutomationControlled",
      "--host-resolver-rules=MAP app.societies.io 52.74.6.109,MAP supa.societies.io 104.18.38.10,MAP aaeijppikwalijkoingt.supabase.co 104.18.38.10"
    ],
  });

  // Anti-bot hardening
  try {
    await context.addInitScript(() => {
      // Pretend navigator.webdriver is false
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      // Mock chrome object
      // @ts-ignore
      window.chrome = window.chrome || {};
      // @ts-ignore
      window.chrome.runtime = window.chrome.runtime || {};
      // Permissions query patch
      const originalQuery = navigator.permissions && navigator.permissions.query;
      if (originalQuery) {
        navigator.permissions.query = (parameters) =>
          parameters.name === 'notifications'
            ? Promise.resolve({ state: Notification.permission })
            : originalQuery(parameters);
      }
      // WebGL fingerprint stability
      try {
        const getParameter = WebGLRenderingContext.prototype.getParameter;
        WebGLRenderingContext.prototype.getParameter = function(parameter) {
          // UNMASKED_VENDOR_WEBGL / UNMASKED_RENDERER_WEBGL
          if (parameter === 37445) return 'Google Inc.';
          if (parameter === 37446) return 'SwiftShader';
          return getParameter.call(this, parameter);
        };
      } catch {}
    });
  } catch {}

  const page = await context.newPage();
  return { context, page, mode: "local-persistent" };
}

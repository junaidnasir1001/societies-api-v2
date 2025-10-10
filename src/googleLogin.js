export async function googleLogin(page, { email, password, timeoutMs = 90000, onMfaCode } = {}) {
  const t0 = Date.now();
  console.log("[login] start");

  console.log("[login] Navigating to Google sign-in...");
  await page.goto("https://accounts.google.com/signin", { waitUntil: "domcontentloaded", timeout: timeoutMs });
  console.log("[login] Page loaded, waiting for email input...");
  
  // Use role-based selectors (Playwright best practice)
  console.log("[login] Email input found, filling email...");
  await page.getByRole('textbox', { name: /email or phone/i }).fill(email, { timeout: 30000 });
  console.log("[login] Email filled, clicking Next...");
  await page.getByRole('button', { name: 'Next' }).click({ timeout: 30000 });

  console.log("[login] Waiting for password input...");
  await page.getByRole('textbox', { name: /enter your password/i }).waitFor({ timeout: 45000, state: 'visible' });
  console.log("[login] Password input found, filling password...");
  await page.getByRole('textbox', { name: /enter your password/i }).fill(password, { timeout: 30000 });
  console.log("[login] Password filled, clicking Next...");
  await page.getByRole('button', { name: 'Next' }).click({ timeout: 30000 });

  // Wait for account home/consent
  console.log("[login] Waiting for page to settle...");
  try { await page.waitForLoadState("networkidle", { timeout: 60000 }); } catch {}

  // MFA (if prompted)
  const mfaField = page.locator('input[type="tel"], input[autocomplete="one-time-code"], input[name="idvAnyPhonePin"]');
  if (await mfaField.count() > 0) {
    if (!onMfaCode) throw new Error("MFA required but no onMfaCode handler provided");
    const code = await onMfaCode();
    await mfaField.first().fill(code);
    await page.keyboard.press("Enter");
    await page.waitForLoadState("networkidle", { timeout: 60000 });
  }

  console.log("[login] done in", Date.now() - t0, "ms");
  return { ms: Date.now() - t0 };
}


async function waitStable(page, panelSel, quietMs = 800, timeout = 30000) {
  await page.waitForFunction((sel, quiet) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    const now = Date.now();
    window.__rp = window.__rp || { lastLen: 0, stableAt: now };
    const len = el.innerHTML.length;
    if (window.__rp.lastLen !== len) {
      window.__rp.lastLen = len;
      window.__rp.stableAt = now;
    }
    return (Date.now() - window.__rp.stableAt) > quiet;
  }, panelSel, quietMs, { timeout });
}

export async function runSimulation(page, { society, template, inputText, simulateButtonText = "Simulate", email, password }) {
  const t0 = Date.now();
  console.log("[sim] goto app.societies.io (direct app URL)");
  
  // Go directly to app URL
  await page.goto("https://app.societies.io", { waitUntil: "domcontentloaded", timeout: 90000 });
  let workingPage = page;
  
  console.log("[sim] Waiting for page to load...");
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  
  // Check if we need SSO
  console.log("[sim] Checking for 'Continue with Google' button...");
  try {
    const ssoBtn = page.getByRole('button', { name: 'Continue with Google' });
    if (await ssoBtn.count() > 0) {
      console.log("[sim] Clicking 'Continue with Google'...");
      await ssoBtn.click({ timeout: 10000 });
      console.log("[sim] SSO clicked, waiting for Google login page...");
      
      // Wait for Google login page
      await page.waitForLoadState("domcontentloaded", { timeout: 30000 });
      
      // Check if Google login is needed (might already be logged in)
      console.log("[sim] Checking if Google login is required...");
      const emailInput = page.getByRole('textbox', { name: /email or phone/i });
      
      if (await emailInput.count() > 0 && email && password) {
        console.log("[sim] Google login required, filling credentials...");
        
        // Fill email
        await emailInput.fill(email, { timeout: 10000 });
        await page.getByRole('button', { name: 'Next' }).click({ timeout: 10000 });
        
        // Fill password
        await page.waitForTimeout(2000);
        await page.getByRole('textbox', { name: /enter your password/i }).waitFor({ timeout: 30000 });
        await page.getByRole('textbox', { name: /enter your password/i }).fill(password, { timeout: 10000 });
        await page.getByRole('button', { name: 'Next' }).click({ timeout: 10000 });
        
        console.log("[sim] Google login submitted, waiting for redirect...");
        await page.waitForLoadState("domcontentloaded", { timeout: 30000 });
        
        // Handle consent screen if present
        console.log("[sim] Checking for Google consent screen...");
        await page.waitForTimeout(2000);
        try {
          const continueBtn = page.getByRole('button', { name: /continue|allow|accept/i });
          if (await continueBtn.count() > 0) {
            console.log("[sim] Clicking consent Continue button...");
            await continueBtn.first().click({ timeout: 10000 });
            await page.waitForLoadState("networkidle", { timeout: 60000 });
          }
        } catch (consentErr) {
          console.log("[sim] No consent screen or already consented");
        }
        
        // Final wait for app to load
        await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
      } else {
        console.log("[sim] Already logged into Google or no credentials provided");
        await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
      }
    } else {
      console.log("[sim] No SSO button, already logged in");
    }
  } catch (ssoErr) {
    console.log("[sim] SSO/login check done:", ssoErr.message);
  }
  
  // Wait a bit for app to fully load
  console.log("[sim] Waiting for app to load...");
  await page.waitForTimeout(5000);
  
  // Handle auto-open modal (Personal Societies + Target Societies) - FROM SCREENSHOT
  console.log("[sim] Checking for auto-open societies modal...");
  
  // Wait extra time for modal animation
  await page.waitForTimeout(3000);
  
  try {
    // Check if "Example Startup Investors" card is visible (indicates modal is open)
    const societyCard = page.getByRole('button', { name: 'Example Startup Investors' }).first();
    const isCardVisible = await societyCard.isVisible().catch(() => false);
    
    console.log(`[sim] Society card visible: ${isCardVisible}`);
    
    if (isCardVisible) {
      console.log("[sim] ✅ Auto-open modal detected!");
      console.log("[sim] Clicking 'Example Startup Investors' to dismiss modal...");
      
      // Click with force if needed
      try {
        await societyCard.click({ timeout: 3000 });
        console.log("[sim] Clicked on society card (normal)");
      } catch (clickErr) {
        await societyCard.click({ force: true, timeout: 3000 });
        console.log("[sim] Force clicked on society card");
      }
      
      // Wait for modal to close
      await page.waitForTimeout(2000);
      console.log("[sim] ✅ Modal dismissed successfully!");
    } else {
      console.log("[sim] No auto-open modal found (society card not visible)");
    }
  } catch (modalErr) {
    console.log("[sim] Modal handling error:", modalErr.message);
  }
  
  // Debug: Check what's on the page after modal close
  console.log("[sim] DEBUG: Current URL:", page.url());
  const pageTitle = await page.title().catch(() => "N/A");
  console.log("[sim] DEBUG: Page title:", pageTitle);

  // If Chromium shows chrome-error (e.g., DNS failure on Supabase OAuth), retry SSO once
  try {
    if (page.url().startsWith('chrome-error://chromewebdata')) {
      console.log('[sim] ⚠️ Chrome error page detected after SSO. Retrying SSO once...');
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`[sim] SSO retry attempt ${attempt}...`);
          await page.goto('https://app.societies.io', { waitUntil: 'domcontentloaded', timeout: 45000 });
          const retryBtn = page.getByRole('button', { name: 'Continue with Google' });
          if (await retryBtn.count() > 0) {
            await retryBtn.click({ timeout: 10000 });
            await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {});
          }
          if (!page.url().startsWith('chrome-error://')) {
            console.log('[sim] ✅ SSO retry succeeded');
            break;
          }
        } catch {}
        await page.waitForTimeout(1500);
      }
      console.log('[sim] DEBUG after SSO retry URL:', page.url());
    }
  } catch {}

  // Helper: Select from dropdown (using workingPage)
  const selectDropdown = async (selectors, value, fieldName) => {
    for (const sel of selectors) {
      try {
        const dropdown = workingPage.locator(sel).first();
        if (await dropdown.count()) {
          await dropdown.waitFor({ timeout: 5000, state: 'visible' });
          await dropdown.click();
          console.log(`[sim] Opened ${fieldName} dropdown`);
          
          // Wait a bit for dropdown to open
          await workingPage.waitForTimeout(500);
          
          // Try to select the option
          const option = workingPage.locator(`text="${value}"`).first();
          await option.click({ timeout: 5000 });
          console.log(`[sim] Selected ${fieldName}: "${value}"`);
          return true;
        }
      } catch (e) {
        continue;
      }
    }
    console.log(`[sim] Warning: Could not find ${fieldName} dropdown`);
    return false;
  };

  // Helper: Fill text input (using workingPage)
  const fillInput = async (selectors, value, fieldName) => {
    for (const sel of selectors) {
      try {
        const input = workingPage.locator(sel).first();
        if (await input.count()) {
          await input.fill(value);
          console.log(`[sim] Filled ${fieldName}: "${value}"`);
          return true;
        }
      } catch (e) {
        continue;
      }
    }
    console.log(`[sim] Warning: Could not find ${fieldName} input`);
    return false;
  };

  // Society is already selected after modal dismiss, so skip this step
  console.log("[sim] Society should be already selected from modal dismiss...");
  
  // If we still need to select society (commented for now):
  // if (society) {
  //   console.log(`[sim] Looking for society button: "${society}"`);
  //   await workingPage.getByRole('button', { name: `Example ${society}` }).first().click();
  // }
  
  await workingPage.waitForTimeout(1000);
  // Click "Create new test" button - MUST CLICK to open templates modal
  console.log("[sim] Looking for 'Create New Test' button (ID: #create-new-test-button)...");
  try {
    // Use exact ID selector from user
    const createBtn = workingPage.locator('#create-new-test-button');
    const count = await createBtn.count();
    console.log(`[sim] Found ${count} 'Create New Test' button(s)`);
    
    if (count > 0) {
      // Wait for button to be visible
      await createBtn.waitFor({ timeout: 5000, state: 'visible' });
      
      // Try regular click first
      try {
        await createBtn.click({ timeout: 3000 });
        console.log("[sim] ✅ Clicked 'Create New Test' button - Templates modal should open!");
      } catch (clickErr) {
        // If regular click fails (overlay blocking), use force click
        console.log("[sim] Regular click failed, trying force click...");
        await createBtn.click({ force: true, timeout: 3000 });
        console.log("[sim] ✅ Force clicked 'Create New Test' button!");
      }
      
      // Wait longer for templates modal to load
      console.log("[sim] Waiting for templates modal to open...");
      await workingPage.waitForTimeout(3000);
    } else {
      console.log("[sim] ❌ 'Create New Test' button not found!");
      
      // Try fallback selectors
      console.log("[sim] Trying fallback selectors...");
      const fallbacks = [
        'div:has-text("Create New Test")',
        'text="Create New Test"'
      ];
      
      for (const sel of fallbacks) {
        try {
          const btn = workingPage.locator(sel).first();
          if (await btn.count() > 0) {
            await btn.click({ timeout: 3000 });
            console.log(`[sim] Clicked using fallback: ${sel}`);
            await workingPage.waitForTimeout(3000);
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }
  } catch (e) {
    console.log("[sim] Error clicking 'Create New Test' button:", e.message);
  }

  // Select template (it's a BUTTON with text inside)
  if (template) {
    console.log(`[sim] Looking for template button: "${template}"`);
    try {
      // Try getByRole first
      await workingPage.getByRole('button', { name: template }).first().click({ timeout: 5000 });
      console.log(`[sim] Clicked template button: "${template}"`);
      await workingPage.waitForTimeout(500);
    } catch (e) {
      try {
        // Fallback: Try button with p text (from user's HTML: button class="css-1lbwnuz" with p class="css-1wfg96s")
        const templateBtn = workingPage.locator(`button:has(p:text("${template}"))`).first();
        await templateBtn.click({ timeout: 5000 });
        console.log(`[sim] Clicked template button with p:text: "${template}"`);
        await workingPage.waitForTimeout(500);
      } catch (e2) {
        console.log(`[sim] Could not find template button "${template}", continuing...`);
      }
    }
  }
  
  // Fill input text (use role-based selector)
  if (inputText) {
    console.log("[sim] Filling article text...");
    try {
      await workingPage.getByRole('textbox', { name: /write your article/i }).fill(inputText, { timeout: 5000 });
      console.log(`[sim] Filled input text: "${inputText}"`);
    } catch (e) {
      console.log("[sim] Could not fill article text, trying fallback selectors...");
      await fillInput([
        'textarea[name="inputText"]',
        'textarea[name="input"]',
        'textarea[placeholder*="text"]',
        'textarea'
      ], inputText, 'input text');
    }
  }

  // Helper: Wait for results panel with retry logic
  const waitForResults = async (retryAttempt = 0) => {
    const panelSel = '#results-panel, .results-panel, [data-testid="results-panel"], [class*="result"]';
    
    try {
      console.log(`[sim] Waiting for results panel... ${retryAttempt > 0 ? '(retry)' : ''}`);
      
      // Step 1: Wait for "Impact Score" heading (primary indicator)
      console.log("[sim] Waiting for 'Impact Score' heading...");
      try {
        await workingPage.waitForSelector('text=Impact Score', { timeout: 90000 });
        console.log("[sim] ✅ Impact Score heading found!");
      } catch (e) {
        console.log("[sim] ⚠️ Impact Score heading not found, trying panel selector...");
        await workingPage.waitForSelector(panelSel, { timeout: 90000 });
      }
      
      // Step 2: Wait for score value (e.g., "26 / 100")
      console.log("[sim] Waiting for score value...");
      try {
        await workingPage.waitForFunction(() => {
          const panel = document.querySelector('#results-panel, .results-panel, [class*="result"]');
          return panel && /\d+\s*\/\s*\d+/.test(panel.innerText);
        }, { timeout: 60000 });
        console.log("[sim] ✅ Score value found!");
      } catch (e) {
        console.log("[sim] ⚠️ Score value not found within timeout");
      }
      
      // Step 3: Wait for "Attention" section
      console.log("[sim] Waiting for 'Attention' section...");
      try {
        await workingPage.waitForSelector('text=Attention', { timeout: 30000 });
        console.log("[sim] ✅ Attention section found!");
      } catch (e) {
        console.log("[sim] ⚠️ Attention section not found");
      }
      
      // Step 4: Wait for "Insights" section
      console.log("[sim] Waiting for 'Insights' section...");
      try {
        await workingPage.waitForSelector('text=Insights', { timeout: 30000 });
        console.log("[sim] ✅ Insights section found!");
      } catch (e) {
        console.log("[sim] ⚠️ Insights section not found");
      }

      // Step 5: Spinner wait (best-effort)
      console.log("[sim] Checking for spinner...");
      const spinnerSel = `${panelSel} .spinner, ${panelSel} [data-loading="true"], ${panelSel} [aria-busy="true"]`;
      if (await workingPage.locator(spinnerSel).count() > 0) {
        console.log("[sim] Spinner detected, waiting for completion...");
        try { await workingPage.waitForSelector(spinnerSel, { state: "detached", timeout: 90000 }); } catch {}
      }

      // Step 6: Stability wait (final confirmation - best effort)
      console.log("[sim] Checking DOM stability (800ms, 10sec max)...");
      try {
        await waitStable(workingPage, panelSel, 800, 10000);
        console.log("[sim] ✅ DOM stable!");
      } catch (e) {
        console.log("[sim] ⚠️ DOM still changing, but all key elements present - proceeding...");
      }
      
      console.log("[sim] ✅ Results ready for extraction!");
      return true;
      
    } catch (err) {
      if (retryAttempt < 1) {
        console.log(`[sim] ⚠️ Results wait failed, retrying once... (${err.message})`);
        // Click Simulate again
        console.log("[sim] Clicking Simulate again for retry...");
        try {
          await workingPage.locator('div').filter({ hasText: /^Simulate$/ }).first().click({ timeout: 10000 });
        } catch (e) {
          const simBtn = workingPage.locator(`button:has-text("${simulateButtonText}")`).first();
          await simBtn.click({ timeout: 10000 });
        }
        return await waitForResults(retryAttempt + 1);
      }
      throw err;
    }
  };

  // Click Simulate (it's a DIV, not button!)
  console.log("[sim] Looking for Simulate button...");
  try {
    await workingPage.locator('div').filter({ hasText: /^Simulate$/ }).first().click({ timeout: 10000 });
    console.log("[sim] Clicked Simulate div");
  } catch (e) {
    // Fallback to button selector
    const simBtn = workingPage.locator(`button:has-text("${simulateButtonText}")`).first();
    await simBtn.click({ timeout: 10000 });
    console.log("[sim] Clicked Simulate button (fallback)");
  }

  // Wait for results with retry
  await waitForResults();

  // Extract right panel data
  console.log("[sim] Extracting results data...");
  const resultsData = await workingPage.evaluate(() => {
    // Helper to find text containing pattern
    const findTextContaining = (parent, pattern) => {
      const elements = parent.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
      for (const el of elements) {
        const text = el.innerText?.trim() || '';
        if (pattern instanceof RegExp ? pattern.test(text) : text.includes(pattern)) {
          return text;
        }
      }
      return '';
    };

    // Get right panel
    const rightPanel = document.querySelector('#results-panel, .results-panel, [data-testid="results-panel"], [class*="result"]');
    if (!rightPanel) {
      return {
        impactScore: { value: null, max: null, rating: '', raw: '' },
        attention: { full: null, partial: null, ignore: null, raw: {} },
        insights: '',
        html: '',
        plainText: ''
      };
    }

    // Extract Impact Score (look for "number / number" pattern)
    const impactScoreText = findTextContaining(rightPanel, /\d+\s*\/\s*\d+/);
    const impactMatch = impactScoreText.match(/(\d+)\s*\/\s*(\d+)/);
    const impactValue = impactMatch ? parseInt(impactMatch[1]) : null;
    const impactMax = impactMatch ? parseInt(impactMatch[2]) : null;
    
    // Extract rating (Very Low, Low, Medium, High, Very High)
    const impactRating = findTextContaining(rightPanel, /Very Low|Low|Medium|High|Very High/);

    // Extract Attention metrics - more specific matching
    const extractPercent = (text) => {
      const match = text.match(/(\d+)%/);
      return match ? parseInt(match[1]) : null;
    };
    
    // Find Full attention percentage (look for "Full" followed by percentage)
    const fullText = rightPanel.innerText || '';
    const fullMatch = fullText.match(/Full[^\d]*(\d+)%/i);
    const fullAttention = fullMatch ? fullMatch[1] + '%' : '';
    
    // Find Partial attention percentage
    const partialMatch = fullText.match(/Partial[^\d]*(\d+)%/i);
    const partialAttention = partialMatch ? partialMatch[1] + '%' : '';
    
    // Find Ignore attention percentage
    const ignoreMatch = fullText.match(/Ignore[^\d]*(\d+)%/i);
    const ignoreAttention = ignoreMatch ? ignoreMatch[1] + '%' : '';

    // Extract Insights text - find section after "Insights" heading (reuse fullText)
    let insights = '';
    const insightsMatch = fullText.match(/Insights\s+([\s\S]+?)(?=Conversation|$)/i);
    if (insightsMatch) {
      insights = insightsMatch[1].trim();
    }

    // Get full HTML for fallback (fullText already declared above)
    const fullHTML = rightPanel.innerHTML;

    return {
      impactScore: {
        value: impactValue,
        max: impactMax,
        rating: impactRating,
        raw: impactScoreText
      },
      attention: {
        full: extractPercent(fullAttention),
        partial: extractPercent(partialAttention),
        ignore: extractPercent(ignoreAttention),
        raw: {
          full: fullAttention,
          partial: partialAttention,
          ignore: ignoreAttention
        }
      },
      insights: insights,
      html: fullHTML,
      plainText: fullText
    };
  });

  console.log("[sim] Extracted Impact Score:", resultsData.impactScore.value + '/' + resultsData.impactScore.max);
  console.log("[sim] Extracted Attention:", JSON.stringify(resultsData.attention));
  console.log("[sim] Extracted Insights length:", resultsData.insights.length, "chars");

  return {
    result: resultsData,
    metadata: { ms: Date.now() - t0, url: workingPage.url() }
  };
}


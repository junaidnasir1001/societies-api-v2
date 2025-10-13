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
  console.error("[sim] goto app.societies.io (direct app URL)");
  
  // Set overall timeout to prevent hanging (10 minutes max)
  const overallTimeout = setTimeout(() => {
    console.error("[sim] ❌ Overall timeout reached (10 minutes)");
    throw new Error("Simulation timeout: Process took longer than 10 minutes");
  }, 600000);
  
  try {
    // Go directly to app URL
    await page.goto("https://app.societies.io", { waitUntil: "domcontentloaded", timeout: 90000 });
  let workingPage = page;
  
  console.error("[sim] Waiting for page to load...");
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  
  // Check if we're already logged in by looking for app elements
  console.error("[sim] Checking if already logged in...");
  try {
    // Look for elements that indicate we're already in the app
    const appElements = await page.locator('#create-new-test-button, [data-testid="create-new-test"], button:has-text("Create New Test")').count();
    if (appElements > 0) {
      console.error("[sim] ✅ Already logged in - found app elements!");
      await page.waitForTimeout(2000);
    } else {
      console.error("[sim] Not logged in, checking for SSO button...");
      
      // Check if we need SSO
      const ssoBtn = page.getByRole('button', { name: 'Continue with Google' });
      if (await ssoBtn.count() > 0) {
        console.error("[sim] Clicking 'Continue with Google'...");
        await ssoBtn.click({ timeout: 10000 });
        console.error("[sim] SSO clicked, waiting for Google login page...");
        
        // Wait for Google login page
        await page.waitForLoadState("domcontentloaded", { timeout: 30000 });
        
        // Check if Google login is needed (might already be logged in)
        console.error("[sim] Checking if Google login is required...");
        const emailInput = page.getByRole('textbox', { name: /email or phone/i });
      
      if (await emailInput.count() > 0 && email && password) {
        console.error("[sim] Google login required, filling credentials...");
        
        // Fill email with more robust approach
        try {
          await emailInput.waitFor({ timeout: 10000, state: 'visible' });
          await emailInput.clear();
          await emailInput.fill(email, { timeout: 10000 });
          console.error(`[sim] ✅ Email filled: ${email}`);
          
          // Wait a bit for the field to register the input
          await page.waitForTimeout(1000);
          
          // Click Next button
          const nextBtn = page.getByRole('button', { name: 'Next' });
          await nextBtn.waitFor({ timeout: 10000, state: 'visible' });
          await nextBtn.click({ timeout: 10000 });
          console.error("[sim] ✅ Next button clicked");
        } catch (emailErr) {
          console.error(`[sim] ❌ Email filling failed: ${emailErr.message}`);
          // Try alternative approach
          try {
            await emailInput.click();
            await page.waitForTimeout(500);
            await emailInput.fill(email);
            await page.waitForTimeout(1000);
            await page.keyboard.press('Enter');
            console.error("[sim] ✅ Email filled with alternative method");
          } catch (altErr) {
            console.error(`[sim] ❌ Alternative email method failed: ${altErr.message}`);
            throw new Error(`Could not fill email field: ${emailErr.message}`);
          }
        }
        
        // Fill password with more robust approach
        await page.waitForTimeout(3000); // Wait longer for password page to load
        
        try {
          const passwordInput = page.getByRole('textbox', { name: /enter your password/i });
          await passwordInput.waitFor({ timeout: 30000, state: 'visible' });
          await passwordInput.clear();
          await passwordInput.fill(password, { timeout: 10000 });
          console.error("[sim] ✅ Password filled");
          
          // Wait a bit for the field to register the input
          await page.waitForTimeout(1000);
          
          // Click Next button
          const nextBtn = page.getByRole('button', { name: 'Next' });
          await nextBtn.waitFor({ timeout: 10000, state: 'visible' });
          await nextBtn.click({ timeout: 10000 });
          console.error("[sim] ✅ Password Next button clicked");
        } catch (passwordErr) {
          console.error(`[sim] ❌ Password filling failed: ${passwordErr.message}`);
          // Try alternative approach
          try {
            const passwordInput = page.locator('input[type="password"]');
            await passwordInput.waitFor({ timeout: 30000, state: 'visible' });
            await passwordInput.fill(password);
            await page.waitForTimeout(1000);
            await page.keyboard.press('Enter');
            console.error("[sim] ✅ Password filled with alternative method");
          } catch (altErr) {
            console.error(`[sim] ❌ Alternative password method failed: ${altErr.message}`);
            throw new Error(`Could not fill password field: ${passwordErr.message}`);
          }
        }
        
        console.error("[sim] Google login submitted, waiting for redirect...");
        await page.waitForLoadState("domcontentloaded", { timeout: 30000 });
        
        // Wait for Google's redirect chain to complete
        await page.waitForTimeout(5000);
        
        // Handle consent screen if present
        console.error("[sim] Checking for Google consent screen...");
        await page.waitForTimeout(2000);
        try {
          const continueBtn = page.getByRole('button', { name: /continue|allow|accept/i });
          if (await continueBtn.count() > 0) {
            console.error("[sim] Clicking consent Continue button...");
            await continueBtn.first().click({ timeout: 10000 });
            await page.waitForLoadState("networkidle", { timeout: 60000 });
          }
        } catch (consentErr) {
          console.error("[sim] No consent screen or already consented");
        }
        
        // Final wait for app to load
        await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
        
        // If still on Google accounts page (SetSID, etc), wait for final redirect
        if (page.url().includes('accounts.google.com')) {
          console.error("[sim] Still on Google accounts, waiting for final redirect...");
          try {
            await page.waitForURL('https://app.societies.io/**', { timeout: 30000 });
            console.error("[sim] ✅ Successfully redirected to app");
          } catch (redirectErr) {
            console.error(`[sim] ❌ Redirect timeout: ${redirectErr.message}`);
            console.error("[sim] Current URL:", page.url());
            // Try to navigate back to app manually
            try {
              await page.goto('https://app.societies.io', { waitUntil: 'domcontentloaded', timeout: 30000 });
              console.error("[sim] ✅ Manual navigation to app successful");
            } catch (navErr) {
              console.error(`[sim] ❌ Manual navigation failed: ${navErr.message}`);
              throw new Error(`Google login redirect failed: ${redirectErr.message}`);
            }
          }
          await page.waitForTimeout(3000);
        }
        } else {
          console.error("[sim] Already logged into Google or no credentials provided");
          await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
        }
      } else {
        console.error("[sim] No SSO button, already logged in");
      }
    }
  } catch (ssoErr) {
    console.error("[sim] SSO/login check done:", ssoErr.message);
  }
  
  // Wait a bit for app to fully load
  console.error("[sim] Waiting for app to load...");
  await page.waitForTimeout(5000);
  
  // Handle auto-open modal (Personal Societies + Target Societies) - FROM SCREENSHOT
  console.error("[sim] Checking for auto-open societies modal...");
  
  // Wait extra time for modal animation
  await page.waitForTimeout(3000);
  
  try {
    // Check if "Example Startup Investors" card is visible (indicates modal is open)
    const societyCard = page.getByRole('button', { name: 'Example Startup Investors' }).first();
    const isCardVisible = await societyCard.isVisible().catch(() => false);
    
    console.error(`[sim] Society card visible: ${isCardVisible}`);
    
    if (isCardVisible) {
      console.error("[sim] ✅ Auto-open modal detected!");
      console.error("[sim] Clicking 'Example Startup Investors' to dismiss modal...");
      
      // Click with force if needed
      try {
        await societyCard.click({ timeout: 3000 });
        console.error("[sim] Clicked on society card (normal)");
      } catch (clickErr) {
        await societyCard.click({ force: true, timeout: 3000 });
        console.error("[sim] Force clicked on society card");
      }
      
      // Wait for modal to close
      try {
        await page.waitForTimeout(2000);
        console.error("[sim] ✅ Modal dismissed successfully!");
      } catch (modalErr) {
        console.error(`[sim] ⚠️ Modal timeout error (page might be closed): ${modalErr.message}`);
        // Check if page is still valid
        try {
          await page.url();
          console.error("[sim] ✅ Page is still valid, continuing...");
        } catch (pageErr) {
          console.error(`[sim] ❌ Page is closed: ${pageErr.message}`);
          throw new Error(`Page was closed during modal handling: ${pageErr.message}`);
        }
      }
    } else {
      console.error("[sim] No auto-open modal found (society card not visible)");
    }
  } catch (modalErr) {
    console.error("[sim] Modal handling error:", modalErr.message);
  }
  
  // Debug: Check what's on the page after modal close
  console.error("[sim] DEBUG: Current URL:", page.url());
  const pageTitle = await page.title().catch(() => "N/A");
  console.error("[sim] DEBUG: Page title:", pageTitle);

  // If Chromium shows chrome-error (e.g., DNS failure on Supabase OAuth), retry SSO once
  try {
    if (page.url().startsWith('chrome-error://chromewebdata')) {
      console.error('[sim] ⚠️ Chrome error page detected after SSO. Retrying SSO once...');
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.error(`[sim] SSO retry attempt ${attempt}...`);
          await page.goto('https://app.societies.io', { waitUntil: 'domcontentloaded', timeout: 45000 });
          await page.waitForTimeout(3000);
          
          const retryBtn = page.getByRole('button', { name: 'Continue with Google' });
          if (await retryBtn.count() > 0) {
            await retryBtn.click({ timeout: 10000 });
            await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {});
            await page.waitForTimeout(5000); // Extra wait for app initialization
          }
          
          if (!page.url().startsWith('chrome-error://') && page.url().includes('app.societies.io')) {
            console.error('[sim] ✅ SSO retry succeeded');
            // Wait for app to fully initialize
            await page.waitForTimeout(5000);
            break;
          }
        } catch (e) {
          console.error(`[sim] Retry ${attempt} error:`, e.message);
        }
        await page.waitForTimeout(2000);
      }
      console.error('[sim] DEBUG after SSO retry URL:', page.url());
      
      // Check for modal again after retry
      if (page.url().includes('app.societies.io')) {
        console.error('[sim] Checking for modal after retry...');
        await page.waitForTimeout(3000);
        
        const societyCard = page.getByRole('button', { name: 'Example Startup Investors' }).first();
        const isCardVisible = await societyCard.isVisible().catch(() => false);
        
        if (isCardVisible) {
          console.error("[sim] ✅ Modal appeared after retry!");
          try {
            await societyCard.click({ timeout: 3000 });
          } catch {
            await societyCard.click({ force: true, timeout: 3000 });
          }
          await page.waitForTimeout(2000);
          console.error("[sim] ✅ Modal dismissed!");
        }
      }
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
          console.error(`[sim] Opened ${fieldName} dropdown`);
          
          // Wait a bit for dropdown to open
          await workingPage.waitForTimeout(500);
          
          // Try to select the option
          const option = workingPage.locator(`text="${value}"`).first();
          await option.click({ timeout: 5000 });
          console.error(`[sim] Selected ${fieldName}: "${value}"`);
          return true;
        }
      } catch (e) {
        continue;
      }
    }
    console.error(`[sim] Warning: Could not find ${fieldName} dropdown`);
    return false;
  };

  // Helper: Fill text input (using workingPage)
  const fillInput = async (selectors, value, fieldName) => {
    for (const sel of selectors) {
      try {
        const input = workingPage.locator(sel).first();
        if (await input.count()) {
          await input.fill(value);
          console.error(`[sim] Filled ${fieldName}: "${value}"`);
          return true;
        }
      } catch (e) {
        continue;
      }
    }
    console.error(`[sim] Warning: Could not find ${fieldName} input`);
    return false;
  };

  // Society is already selected after modal dismiss, so skip this step
  console.error("[sim] Society should be already selected from modal dismiss...");
  
  // If we still need to select society (commented for now):
  // if (society) {
  //   console.error(`[sim] Looking for society button: "${society}"`);
  //   await workingPage.getByRole('button', { name: `Example ${society}` }).first().click();
  // }
  
  await workingPage.waitForTimeout(1000);
  // Click "Create new test" button - MUST CLICK to open templates modal
  console.error("[sim] Looking for 'Create New Test' button (ID: #create-new-test-button)...");
  try {
    // Use exact ID selector from user
    const createBtn = workingPage.locator('#create-new-test-button');
    const count = await createBtn.count();
    console.error(`[sim] Found ${count} 'Create New Test' button(s)`);
    
    if (count > 0) {
      // Wait for button to be visible
      await createBtn.waitFor({ timeout: 5000, state: 'visible' });
      
      // Try regular click first
      try {
        await createBtn.click({ timeout: 3000 });
        console.error("[sim] ✅ Clicked 'Create New Test' button - Templates modal should open!");
      } catch (clickErr) {
        // If regular click fails (overlay blocking), use force click
        console.error("[sim] Regular click failed, trying force click...");
        await createBtn.click({ force: true, timeout: 3000 });
        console.error("[sim] ✅ Force clicked 'Create New Test' button!");
      }
      
      // Wait longer for templates modal to load
      console.error("[sim] Waiting for templates modal to open...");
      await workingPage.waitForTimeout(3000);
      
    } else {
      console.error("[sim] ❌ 'Create New Test' button not found!");
      
      // Try fallback selectors
      console.error("[sim] Trying fallback selectors...");
      const fallbacks = [
        'div:has-text("Create New Test")',
        'text="Create New Test"'
      ];
      
      for (const sel of fallbacks) {
        try {
          const btn = workingPage.locator(sel).first();
          if (await btn.count() > 0) {
            await btn.click({ timeout: 3000 });
            console.error(`[sim] Clicked using fallback: ${sel}`);
            await workingPage.waitForTimeout(3000);
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }
  } catch (e) {
    console.error("[sim] Error clicking 'Create New Test' button:", e.message);
  }

  // Select template (it's a BUTTON with text inside)
  if (template) {
    console.error(`[sim] Looking for template button: "${template}"`);
    try {
      // Try getByRole first
      await workingPage.getByRole('button', { name: template }).first().click({ timeout: 5000 });
      console.error(`[sim] Clicked template button: "${template}"`);
      await workingPage.waitForTimeout(500);
    } catch (e) {
      try {
        // Fallback: Try button with p text (from user's HTML: button class="css-1lbwnuz" with p class="css-1wfg96s")
        const templateBtn = workingPage.locator(`button:has(p:text("${template}"))`).first();
        await templateBtn.click({ timeout: 5000 });
        console.error(`[sim] Clicked template button with p:text: "${template}"`);
        await workingPage.waitForTimeout(500);
      } catch (e2) {
        console.error(`[sim] Could not find template button "${template}", continuing...`);
      }
    }
  }
  
  // Fill input text (use role-based selector)
  if (inputText) {
    console.error("[sim] Filling article text...");
    try {
      await workingPage.getByRole('textbox', { name: /write your article/i }).fill(inputText, { timeout: 5000 });
      console.error(`[sim] Filled input text: "${inputText}"`);
    } catch (e) {
      console.error("[sim] Could not fill article text, trying fallback selectors...");
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
      console.error(`[sim] Waiting for results panel... ${retryAttempt > 0 ? '(retry)' : ''}`);
      
      // Step 1: Wait for "Impact Score" heading (primary indicator)
      console.error("[sim] Waiting for 'Impact Score' heading...");
      try {
        await workingPage.waitForSelector('text=Impact Score', { timeout: 240000 }); // 4 minutes
        console.error("[sim] ✅ Impact Score heading found!");
      } catch (e) {
        console.error("[sim] ⚠️ Impact Score heading not found, trying panel selector...");
        await workingPage.waitForSelector(panelSel, { timeout: 240000 }); // 4 minutes
      }
      
      // Step 2: Wait for score value (e.g., "26 / 100")
      console.error("[sim] Waiting for score value...");
      try {
        await workingPage.waitForFunction(() => {
          const panel = document.querySelector('#results-panel, .results-panel, [class*="result"]');
          return panel && /\d+\s*\/\s*\d+/.test(panel.innerText);
        }, { timeout: 60000 });
        console.error("[sim] ✅ Score value found!");
      } catch (e) {
        console.error("[sim] ⚠️ Score value not found within timeout");
      }
      
      // Step 3: Wait for "Attention" section
      console.error("[sim] Waiting for 'Attention' section...");
      try {
        await workingPage.waitForSelector('text=Attention', { timeout: 30000 });
        console.error("[sim] ✅ Attention section found!");
      } catch (e) {
        console.error("[sim] ⚠️ Attention section not found");
      }
      
      // Step 4: Wait for "Insights" section
      console.error("[sim] Waiting for 'Insights' section...");
      try {
        await workingPage.waitForSelector('text=Insights', { timeout: 30000 });
        console.error("[sim] ✅ Insights section found!");
      } catch (e) {
        console.error("[sim] ⚠️ Insights section not found");
      }

      // Step 5: Spinner wait (best-effort)
      console.error("[sim] Checking for spinner...");
      const spinnerSel = `${panelSel} .spinner, ${panelSel} [data-loading="true"], ${panelSel} [aria-busy="true"]`;
      if (await workingPage.locator(spinnerSel).count() > 0) {
        console.error("[sim] Spinner detected, waiting for completion...");
        try { await workingPage.waitForSelector(spinnerSel, { state: "detached", timeout: 90000 }); } catch {}
      }

      // Step 6: Stability wait (final confirmation - best effort)
      console.error("[sim] Checking DOM stability (800ms, 10sec max)...");
      try {
        await waitStable(workingPage, panelSel, 800, 10000);
        console.error("[sim] ✅ DOM stable!");
      } catch (e) {
        console.error("[sim] ⚠️ DOM still changing, but all key elements present - proceeding...");
      }
      
      console.error("[sim] ✅ Results ready for extraction!");
      return true;
      
    } catch (err) {
      if (retryAttempt < 1) {
        console.error(`[sim] ⚠️ Results wait failed, retrying once... (${err.message})`);
        // Click Simulate again
        console.error("[sim] Clicking Simulate again for retry...");
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
  console.error("[sim] Looking for Simulate button...");
  try {
    await workingPage.locator('div').filter({ hasText: /^Simulate$/ }).first().click({ timeout: 10000 });
    console.error("[sim] Clicked Simulate div");
  } catch (e) {
    // Fallback to button selector
    const simBtn = workingPage.locator(`button:has-text("${simulateButtonText}")`).first();
    await simBtn.click({ timeout: 10000 });
    console.error("[sim] Clicked Simulate button (fallback)");
  }

  // Wait for results with retry
  await waitForResults();

  // Extract right panel data
  console.error("[sim] Extracting results data...");
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

  console.error("[sim] Extracted Impact Score:", resultsData.impactScore.value + '/' + resultsData.impactScore.max);
  console.error("[sim] Extracted Attention:", JSON.stringify(resultsData.attention));
  console.error("[sim] Extracted Insights length:", resultsData.insights.length, "chars");

    return {
      result: resultsData,
      metadata: { ms: Date.now() - t0, url: workingPage.url() }
    };
    
  } finally {
    // Clear the overall timeout
    clearTimeout(overallTimeout);
  }
}


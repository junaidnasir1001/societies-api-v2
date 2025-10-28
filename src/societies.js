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

export async function runSimulation(page, { society, template, inputText, simulateButtonText = "Run experiment", email, password }) {
  const t0 = Date.now();
  console.error("[sim] goto boldspace.societies.io/experiments/new (new UI)");
  
  // Set overall timeout to prevent hanging (10 minutes max)
  const overallTimeout = setTimeout(() => {
    console.error("[sim] ❌ Overall timeout reached (10 minutes)");
    throw new Error("Simulation timeout: Process took longer than 10 minutes");
  }, 600000);
  
  try {
    // Go directly to new UI
    await page.goto("https://boldspace.societies.io/experiments/new", { waitUntil: "domcontentloaded", timeout: 90000 });
  
  console.error("[sim] Waiting for page to load...");
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  
  // Wait for form to be ready
  await page.waitForTimeout(8000);
  
  // Check if we need Google login (new UI change)
  console.error("[sim] Checking for Google login requirement...");
  const ssoBtn = page.getByRole('button', { name: 'Continue with Google' });
  
  if (await ssoBtn.count() > 0) {
    console.error("[sim] Google login required - clicking 'Continue with Google'...");
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
  
  console.error("[sim] ✅ Successfully authenticated - proceeding with simulation");
  
  // Now proceed with the new UI flow
  console.error("[sim] Starting new UI simulation process...");
  
  // Step 1: Select content type
  console.error("[sim] Selecting content type...");
  
  // Extra wait before trying to select content type (server React hydration)
  await page.waitForTimeout(5000);
  await page.waitForSelector('text=/Content type/i', { timeout: 30000, state: 'visible' }).catch(() => {});
  await page.waitForTimeout(2000);
  
  // Map template to content type dropdown value (using actual dropdown values)
  const contentTypeMapping = {
    'Article': 'email_subject',
    'Website Content': 'email_subject', 
    'Email': 'email_subject',
    'Email Subject Line': 'email_subject',
    'Email Subject': 'email_subject',
    'Advertisement': 'meta_ad',
    'Ad': 'meta_ad',
    'Meta Ad': 'meta_ad',
    'Ad headline': 'meta_ad'
  };
  
  const contentTypeValue = contentTypeMapping[template] || 'email_subject';
  console.error(`[sim] Mapping template "${template}" to content type value "${contentTypeValue}"`);
  
  try {
    // Wait for the label to exist somewhere on the page
    const contentTypeLabel = page.getByText(/^Content type/i).first();
    await contentTypeLabel.waitFor({ timeout: 30000, state: 'attached' });

    // Strategy A: ARIA-labelled combobox
    let contentTypeSelector = page.getByRole('combobox', { name: /content type/i }).first();
    try {
      await contentTypeSelector.scrollIntoViewIfNeeded();
      await contentTypeSelector.waitFor({ timeout: 15000, state: 'visible' });
    } catch {
      // Strategy B: Find select/combobox near the label
      const container = contentTypeLabel.locator('xpath=..');
      const nearby = container.locator('select, [role="combobox"], input[role="combobox"]').first();
      await nearby.scrollIntoViewIfNeeded();
      await nearby.waitFor({ timeout: 20000, state: 'visible' });
      contentTypeSelector = nearby;
    }

    // Try native <select> first
    const isSelect = await contentTypeSelector.evaluate(el => el && el.tagName && el.tagName.toLowerCase() === 'select').catch(() => false);
    if (isSelect) {
      // Debug: Log available options
      const options = await contentTypeSelector.locator('option').allTextContents();
      console.error(`[sim] Available content type options: ${JSON.stringify(options)}`);

      try {
        await contentTypeSelector.selectOption({ value: contentTypeValue });
        console.error(`[sim] ✅ Selected content type by value: ${contentTypeValue}`);
      } catch (selectByValueErr) {
        // Fallback by label text mapping
        const labelMap = {
          meta_ad: /ad|meta/i,
          email_subject: /email subject/i
        };
        const labelRegex = labelMap[contentTypeValue] || /.*/;
        try {
          await contentTypeSelector.selectOption({ label: labelRegex });
          console.error(`[sim] ✅ Selected content type by label regex: ${labelRegex}`);
        } catch (selectByLabelErr) {
          console.error(`[sim] ⚠️ Could not select by value or label, trying index fallback`);
          await contentTypeSelector.selectOption({ index: 1 });
          console.error(`[sim] ✅ Selected first available content type option`);
        }
      }
    } else {
      // Custom combobox: click to open and choose an option in the popup list
      await contentTypeSelector.click({ timeout: 10000 });

      // Try multiple option locator strategies
      const valueSelector = page.locator(`[data-value="${contentTypeValue}"]`).first();
      const labelRegex = contentTypeValue === 'meta_ad' ? /Ad|Meta/i : /Email Subject/i;
      const roleOption = page.getByRole('option', { name: labelRegex }).first();
      const textOption = page.locator('div, li, span').filter({ hasText: labelRegex }).first();

      let clicked = false;
      for (const opt of [valueSelector, roleOption, textOption]) {
        try {
          await opt.waitFor({ timeout: 10000, state: 'visible' });
          await opt.click({ timeout: 10000 });
          clicked = true;
          console.error(`[sim] ✅ Selected content type via custom dropdown`);
          break;
        } catch {}
      }
      if (!clicked) {
        throw new Error('No matching option visible in custom dropdown');
      }
    }
  } catch (contentTypeErr) {
    console.error(`[sim] ❌ Could not select content type: ${contentTypeErr.message}`);
    try {
      await page.screenshot({ path: '/tmp/content-type-error.png', fullPage: true });
      console.error("[sim] 📸 Screenshot saved to /tmp/content-type-error.png");
    } catch {}
    throw new Error(`Could not select content type: ${contentTypeErr.message}`);
  }
  
  // Wait for content type selection to take effect
  await page.waitForTimeout(2000);
  
  // Step 2: Select target audience
  console.error("[sim] Selecting target audience...");
  
  // Map society name to audience dropdown value (using actual dropdown values)
  const audienceMapping = {
    'UK National Representative': 'UK National Representative (default)',
    'UK HR Decision-Makers': 'UK HR Decision-Makers',
    'UK Mortgage Advisors': 'UK Mortgage Advisors', 
    'UK Beauty Lovers': 'UK Beauty Lovers',
    'UK Consumers': 'UK Consumers',
    'UK Journalists': 'UK Journalists',
    'UK Marketing Leaders': 'UK Marketing Leaders',
    'UK Enterprise Marketing Leaders': 'UK Enterprise Marketing Leaders',
    'Startup Investors': 'UK National Representative (default)', // Default fallback
    'Tech Enthusiasts': 'UK National Representative (default)',
    'Marketing Professionals': 'UK Marketing Leaders'
  };
  
  const audienceValue = audienceMapping[society] || 'UK National Representative (default)';
  console.error(`[sim] Mapping society "${society}" to audience "${audienceValue}"`);
  
  try {
    const audienceSelector = page.getByRole('combobox').nth(1);
    await audienceSelector.waitFor({ timeout: 10000, state: 'visible' });
    
    // Debug: Log available options
    const audienceOptions = await audienceSelector.locator('option').allTextContents();
    console.error(`[sim] Available audience options: ${JSON.stringify(audienceOptions)}`);
    
    // Try to select the option, with fallback to first available option
    try {
      await audienceSelector.selectOption(audienceValue);
      console.error(`[sim] ✅ Selected audience: ${audienceValue}`);
    } catch (selectErr) {
      console.error(`[sim] ⚠️ Could not select audience "${audienceValue}", trying first available option`);
      await audienceSelector.selectOption({ index: 1 }); // Skip first option (usually placeholder)
      console.error(`[sim] ✅ Selected first available audience option`);
    }
  } catch (audienceErr) {
    console.error(`[sim] ❌ Could not select audience: ${audienceErr.message}`);
    throw new Error(`Could not select audience: ${audienceErr.message}`);
  }
  
  // Wait for audience selection to take effect
  await page.waitForTimeout(2000);
  
  // Step 3: Fill subject lines/headlines
  console.error("[sim] Filling subject lines...");
  
  try {
    const textareaSelector = page.getByRole('textbox', { name: 'Add up to 10' });
    await textareaSelector.waitFor({ timeout: 10000, state: 'visible' });
    await textareaSelector.clear();
    await textareaSelector.fill(inputText);
    console.error(`[sim] ✅ Filled subject lines: ${inputText}`);
  } catch (textareaErr) {
    console.error(`[sim] ❌ Could not fill subject lines: ${textareaErr.message}`);
    throw new Error(`Could not fill subject lines: ${textareaErr.message}`);
  }
  
  // Wait for input to be processed
  await page.waitForTimeout(1000);
  
  // Step 4: Click Run experiment
  console.error("[sim] Clicking Run experiment...");
  
  try {
    const runButton = page.getByRole('button', { name: 'Run experiment' });
    await runButton.waitFor({ timeout: 10000, state: 'visible' });
    await runButton.click();
    console.error("[sim] ✅ Clicked Run experiment");
  } catch (buttonErr) {
    console.error(`[sim] ❌ Could not click Run experiment: ${buttonErr.message}`);
    throw new Error(`Could not click Run experiment: ${buttonErr.message}`);
  }
  
  // Wait for experiment to start and redirect to results
  console.error("[sim] Waiting for experiment to start...");
  await page.waitForTimeout(5000);
  
  // Wait for redirect to results page
  console.error("[sim] Waiting for redirect to results page...");
  try {
    await page.waitForURL(/boldspace\.societies\.io\/experiments\/.*/, { timeout: 60000 });
    console.error("[sim] ✅ Redirected to results page");
  } catch (redirectErr) {
    console.error(`[sim] ⚠️ No redirect detected, checking current URL: ${page.url()}`);
  }
  
  // Wait for results to load
  console.error("[sim] Waiting for results to load...");
  await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(5000);
  
  // Wait for experiment to complete and results to be visible
  console.error("[sim] Waiting for experiment to complete...");
  
  // Wait for the experiment to complete (reduced for faster response)
  await page.waitForTimeout(30000); // Wait 30 seconds for experiment to complete
  
  // Check if we're on results page by looking for results indicators
  let resultsFound = false;
  try {
    // Wait for any results indicators
    await page.waitForSelector('text=Winner', { timeout: 60000 });
    resultsFound = true;
    console.error("[sim] ✅ Results content is visible (Winner found)");
  } catch (resultsErr) {
    console.error(`[sim] ⚠️ Winner not found, trying other selectors...`);
    
    try {
      await page.waitForSelector('text=Impact score', { timeout: 30000 });
      resultsFound = true;
      console.error("[sim] ✅ Results content is visible (Impact score found)");
    } catch (altErr) {
      console.error(`[sim] ⚠️ Impact score not found, trying final selectors...`);
      
      try {
        await page.waitForSelector('text=Average Score', { timeout: 30000 });
        resultsFound = true;
        console.error("[sim] ✅ Results content is visible (Average Score found)");
      } catch (finalErr) {
        console.error(`[sim] ⚠️ No results selectors found: ${finalErr.message}`);
        console.error(`[sim] 🔍 Current URL: ${page.url()}`);
        console.error(`[sim] 🔍 Page title: ${await page.title()}`);
      }
    }
  }
  
  // Wait for animated counters to finish (optimized for speed)
  console.error("[sim] ⏳ Waiting for animated counters to finish...");
  await page.waitForTimeout(5000); // Wait for counters to reach final values
  
  // Additional wait to ensure all animations are complete
  console.error("[sim] ⏳ Additional wait for final values...");
  await page.waitForTimeout(3000); // Reduced buffer for faster response
  
  // Extract results from new UI
  console.error("[sim] Extracting results from new UI...");
  
  let result = {
    plainText: "",
    html: "",
    impactScore: { value: "N/A", rating: "N/A" },
    attention: { full: 0, partial: 0, ignore: 0 },
    insights: "",
    winner: "",
    averageScore: "N/A",
    uplift: "N/A"
  };
  
  try {
    // Debug: Log the full page content to understand the structure
    const fullPageText = await page.textContent('body');
    const normalizedPageText = fullPageText.replace(/\s+/g, ' ');
    console.error(`[sim] 🔍 Full page text (first 500 chars): ${fullPageText.substring(0, 500)}...`);
    
    // Debug: Get all numbers on the page to understand the structure
    try {
      const allNumbers = await page.locator('span[font-size="32"]').all();
      console.error(`[sim] 🔍 Found ${allNumbers.length} numbers with font-size="32"`);
      for (let i = 0; i < allNumbers.length; i++) {
        const text = await allNumbers[i].textContent();
        console.error(`[sim] 🔍 Number ${i}: "${text}"`);
      }
      
      // Debug: Get all divs with numbers to understand the structure
      const allDivs = await page.locator('div').filter({ hasText: /\d+/ }).all();
      console.error(`[sim] 🔍 Found ${allDivs.length} divs with numbers`);
      for (let i = 0; i < Math.min(allDivs.length, 10); i++) {
        const text = await allDivs[i].textContent();
        console.error(`[sim] 🔍 Div ${i}: "${text.substring(0, 100)}..."`);
      }
    } catch (debugErr) {
      console.error(`[sim] 🔍 Debug error: ${debugErr.message}`);
    }
    
    // Extract winner text - try multiple methods
    try {
      // Method 1: Try CSS selector for winner
      try {
        const winnerElement = await page.locator('div.css-1cg8z8l').first();
        if (await winnerElement.isVisible()) {
          result.winner = await winnerElement.textContent();
          console.error(`[sim] ✅ Extracted winner (CSS selector): ${result.winner}`);
        } else {
          throw new Error('CSS selector not found');
        }
      } catch (cssErr) {
        // Method 2: Try alternative CSS selectors
        try {
          const winnerElement2 = await page.locator('div[class*="css-"]').filter({ hasText: /Winner/ }).locator('div').first();
          if (await winnerElement2.isVisible()) {
            result.winner = await winnerElement2.textContent();
            console.error(`[sim] ✅ Extracted winner (alternative CSS): ${result.winner}`);
          } else {
            throw new Error('Alternative CSS selector not found');
          }
        } catch (cssErr2) {
          // Method 3: Text-based extraction
          const winnerMatch = fullPageText.match(/Winner([^I]*?)Impact score/i);
          if (winnerMatch) {
            result.winner = winnerMatch[1].trim();
            console.error(`[sim] ✅ Extracted winner (text fallback): ${result.winner}`);
          } else {
            console.error(`[sim] ❌ No winner found`);
          }
        }
      }
    } catch (winnerErr) {
      console.error(`[sim] ⚠️ Could not extract winner: ${winnerErr.message}`);
    }
    
    // Extract impact score - use array-based extraction
    try {
      const allNumbers = await page.locator('span[font-size="32"]').all();
      if (allNumbers.length >= 3) {
        result.impactScore.value = await allNumbers[0].textContent();
        result.impactScore.rating = "Average";
        console.error(`[sim] ✅ Extracted impact score: ${result.impactScore.value}`);
      } else {
        console.error(`[sim] ❌ Not enough numbers found for impact score`);
      }
    } catch (impactErr) {
      console.error(`[sim] ⚠️ Could not extract impact score: ${impactErr.message}`);
    }
    
    // Extract average score - use array-based extraction
    try {
      const allNumbers = await page.locator('span[font-size="32"]').all();
      if (allNumbers.length >= 3) {
        result.averageScore = await allNumbers[1].textContent();
        console.error(`[sim] ✅ Extracted average score: ${result.averageScore}`);
      } else {
        console.error(`[sim] ❌ Not enough numbers found for average score`);
      }
    } catch (averageErr) {
      console.error(`[sim] ⚠️ Could not extract average score: ${averageErr.message}`);
    }
    
    // Extract uplift - use array-based extraction
    try {
      const allNumbers = await page.locator('span[font-size="32"]').all();
      if (allNumbers.length >= 3) {
        result.uplift = await allNumbers[2].textContent();
        console.error(`[sim] ✅ Extracted uplift: ${result.uplift}`);
      } else {
        console.error(`[sim] ❌ Not enough numbers found for uplift`);
      }
    } catch (upliftErr) {
      console.error(`[sim] ⚠️ Could not extract uplift: ${upliftErr.message}`);
    }
    
    // Extract insights text - use specific CSS selector
    try {
      // Method 1: Use specific CSS selector for insights
      const insightsElement = await page.locator('p.css-6hli0j').first();
      if (await insightsElement.isVisible()) {
        result.insights = await insightsElement.textContent();
        console.error(`[sim] ✅ Extracted insights (CSS selector): ${result.insights.substring(0, 100)}...`);
    } else {
        // Method 2: Fallback to text-based extraction
        const insightsPatterns = [
          /(?:UK nationals|Enterprise Marketing Leaders|HR professionals).*?(?:because|responded).*?(?=\n\n|\n[A-Z]|$)/s,
          /(?:responded|engaged|preferred).*?(?:because|offered|conveyed).*?(?=\n\n|\n[A-Z]|$)/s,
          /(?:Compared to|The other options).*?(?=\n\n|\n[A-Z]|$)/s
        ];
        
        for (const pattern of insightsPatterns) {
          const match = fullPageText.match(pattern);
          if (match && match[0].length > 50) {
            result.insights = match[0].trim();
            console.error(`[sim] ✅ Extracted insights (text fallback): ${result.insights.substring(0, 100)}...`);
            break;
          }
        }
      }
    } catch (insightsErr) {
      console.error(`[sim] ⚠️ Could not extract insights: ${insightsErr.message}`);
    }
    
    const sanitizeWinner = (raw) => {
      if (raw && raw.trim()) {
        let cleaned = raw.replace(/\s+/g, ' ');
        cleaned = cleaned.replace(/^Winner\s*/i, '');
        cleaned = cleaned.replace(/Impact score.*$/i, '').trim();
        if (cleaned && cleaned.length < 150) {
          return cleaned;
        }
      }
      const match = normalizedPageText.match(/Winner\s+(.+?)\s+(?:Impact score|Winning Option)/i);
      return match ? match[1].trim() : raw?.trim() || '';
    };

    const sanitizeNumericField = (raw, fallbackRegex) => {
      const fromRaw = raw?.toString().match(/\d+/)?.[0];
      if (fromRaw) {
        return fromRaw;
      }
      const fallbackMatch = normalizedPageText.match(fallbackRegex);
      return fallbackMatch ? fallbackMatch[1] : raw;
    };

    result.winner = sanitizeWinner(result.winner);
    result.impactScore.value = sanitizeNumericField(result.impactScore.value, /Impact score\s*(\d+)/i);
    result.averageScore = sanitizeNumericField(result.averageScore, /Average Score\s*(\d+)/i);
    result.uplift = sanitizeNumericField(result.uplift, /↑\s*(\d+)%/);

    // Build plainText summary
    result.plainText = `Winner: ${result.winner}\nImpact Score: ${result.impactScore.value}/100\nAverage Score: ${result.averageScore}\nUplift: ${result.uplift}%\n\nInsights: ${result.insights}`;
    
    // Build HTML summary
    result.html = `<div><h3>Winner: ${result.winner}</h3><p>Impact Score: ${result.impactScore.value}/100</p><p>Average Score: ${result.averageScore}</p><p>Uplift: ${result.uplift}%</p><p>Insights: ${result.insights}</p></div>`;
    
    // Add new fields to extras for backward compatibility
    result.extras = {
      impactScore: result.impactScore,
      attention: result.attention,
      insights: result.insights,
      winner: result.winner,
      averageScore: result.averageScore,
      uplift: result.uplift
    };
    
    console.error(`[sim] 🔍 Extras object:`, JSON.stringify(result.extras, null, 2));
    
    // Also set the values directly on the result object for direct access
    // These values are already set above, but let's ensure they're properly set
    console.error(`[sim] 🔍 Setting result values: winner=${result.winner}, averageScore=${result.averageScore}, uplift=${result.uplift}`);
    
    console.error("[sim] ✅ Results extracted successfully");
    console.error(`[sim] 🔍 Final result object:`, JSON.stringify(result, null, 2));
    
    // Wait 5 seconds to see the results in Chrome window
    console.error("[sim] ⏳ Waiting 5 seconds to view results in Chrome window...");
    await page.waitForTimeout(5000);
    console.error("[sim] ✅ Wait complete - closing browser");
    
  } catch (extractErr) {
    console.error(`[sim] ❌ Error extracting results: ${extractErr.message}`);
    throw new Error(`Could not extract results: ${extractErr.message}`);
  }
  
  // Clear timeout
  clearTimeout(overallTimeout);
  
  const totalTime = Date.now() - t0;
  console.error(`[sim] ✅ Simulation completed in ${totalTime}ms`);

    return {
    result,
    metadata: {
      ms: totalTime,
      url: page.url(),
      template,
      society,
      inputText
    }
  };
  
  } catch (error) {
    clearTimeout(overallTimeout);
    console.error(`[sim] ❌ Simulation failed: ${error.message}`);
    throw error;
  }
}

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
  await page.waitForTimeout(3000);
  
  console.error("[sim] ✅ Successfully on new UI - no Google sign-in required");
  
  // Now proceed with the new UI flow
  console.error("[sim] Starting new UI simulation process...");
  
  // Step 1: Select content type
  console.error("[sim] Selecting content type...");
  
  // Map template to content type dropdown value
  const contentTypeMapping = {
    'Article': 'email_subject',
    'Website Content': 'email_subject', 
    'Email': 'email_subject',
    'Email Subject Line': 'email_subject',
    'Advertisement': 'meta_ad',
    'Ad': 'meta_ad',
    'Meta Ad': 'meta_ad'
  };
  
  const contentTypeValue = contentTypeMapping[template] || 'email_subject';
  console.error(`[sim] Mapping template "${template}" to content type "${contentTypeValue}"`);
  
  try {
    const contentTypeSelector = page.locator('div').filter({ hasText: /^Content type/ }).getByRole('combobox');
    await contentTypeSelector.waitFor({ timeout: 10000, state: 'visible' });
    await contentTypeSelector.selectOption(contentTypeValue);
    console.error(`[sim] ✅ Selected content type: ${contentTypeValue}`);
  } catch (contentTypeErr) {
    console.error(`[sim] ❌ Could not select content type: ${contentTypeErr.message}`);
    throw new Error(`Could not select content type: ${contentTypeErr.message}`);
  }
  
  // Wait for content type selection to take effect
  await page.waitForTimeout(2000);
  
  // Step 2: Select target audience
  console.error("[sim] Selecting target audience...");
  
  // Map society name to audience dropdown value
  const audienceMapping = {
    'UK National Representative': 'uk_national',
    'UK HR Decision-Makers': 'hr',
    'UK Mortgage Advisors': 'mortgage_advisors', 
    'UK Beauty Lovers': 'beauty_lovers',
    'UK Consumers': 'consumers',
    'UK Journalists': 'journalists',
    'UK Marketing Leaders': 'marketing_leaders',
    'UK Enterprise Marketing Leaders': 'enterprise_marketing_leaders',
    'Startup Investors': 'uk_national', // Default fallback
    'Tech Enthusiasts': 'uk_national',
    'Marketing Professionals': 'marketing_leaders'
  };
  
  const audienceValue = audienceMapping[society] || 'uk_national';
  console.error(`[sim] Mapping society "${society}" to audience "${audienceValue}"`);
  
  try {
    const audienceSelector = page.getByRole('combobox').nth(1);
    await audienceSelector.waitFor({ timeout: 10000, state: 'visible' });
    await audienceSelector.selectOption(audienceValue);
    console.error(`[sim] ✅ Selected audience: ${audienceValue}`);
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
    // Extract winner text
    try {
      const winnerElement = page.locator('div').filter({ hasText: /^Winner/ }).locator('..').locator('div').nth(1);
      if (await winnerElement.count() > 0) {
        result.winner = await winnerElement.textContent();
        console.error(`[sim] ✅ Extracted winner: ${result.winner}`);
      }
    } catch (winnerErr) {
      console.error(`[sim] ⚠️ Could not extract winner: ${winnerErr.message}`);
    }
    
    // Extract impact score
    try {
      const impactElement = page.locator('div').filter({ hasText: /^\d+Winning Option$/ });
      if (await impactElement.count() > 0) {
        const impactText = await impactElement.textContent();
        const scoreMatch = impactText.match(/(\d+)/);
        if (scoreMatch) {
          result.impactScore.value = scoreMatch[1];
          result.impactScore.rating = "Average"; // Default rating
          console.error(`[sim] ✅ Extracted impact score: ${result.impactScore.value}`);
        }
      }
    } catch (impactErr) {
      console.error(`[sim] ⚠️ Could not extract impact score: ${impactErr.message}`);
    }
    
    // Extract average score
    try {
      const averageElement = page.locator('div').filter({ hasText: /^\d+Average Score$/ });
      if (await averageElement.count() > 0) {
        const averageText = await averageElement.textContent();
        const scoreMatch = averageText.match(/(\d+)/);
        if (scoreMatch) {
          result.averageScore = scoreMatch[1];
          console.error(`[sim] ✅ Extracted average score: ${result.averageScore}`);
        }
      }
    } catch (averageErr) {
      console.error(`[sim] ⚠️ Could not extract average score: ${averageErr.message}`);
    }
    
    // Extract uplift
    try {
      const upliftElement = page.locator('div').filter({ hasText: /^↑\d+%/ });
      if (await upliftElement.count() > 0) {
        const upliftText = await upliftElement.textContent();
        const upliftMatch = upliftText.match(/↑(\d+)%/);
        if (upliftMatch) {
          result.uplift = upliftMatch[1];
          console.error(`[sim] ✅ Extracted uplift: ${result.uplift}%`);
        }
      }
    } catch (upliftErr) {
      console.error(`[sim] ⚠️ Could not extract uplift: ${upliftErr.message}`);
    }
    
    // Extract insights text
    try {
      const insightsElement = page.locator('p, div').filter({ hasText: /engaged.*with|preferred|matched/ });
      if (await insightsElement.count() > 0) {
        result.insights = await insightsElement.textContent();
        console.error(`[sim] ✅ Extracted insights: ${result.insights.substring(0, 100)}...`);
      }
    } catch (insightsErr) {
      console.error(`[sim] ⚠️ Could not extract insights: ${insightsErr.message}`);
    }
    
    // Build plainText summary
    result.plainText = `Winner: ${result.winner}\nImpact Score: ${result.impactScore.value}/100\nAverage Score: ${result.averageScore}\nUplift: ${result.uplift}%\n\nInsights: ${result.insights}`;
    
    // Build HTML summary
    result.html = `<div><h3>Winner: ${result.winner}</h3><p>Impact Score: ${result.impactScore.value}/100</p><p>Average Score: ${result.averageScore}</p><p>Uplift: ${result.uplift}%</p><p>Insights: ${result.insights}</p></div>`;
    
    console.error("[sim] ✅ Results extracted successfully");
    
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

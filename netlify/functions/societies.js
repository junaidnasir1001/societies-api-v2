const { chromium } = require('playwright');

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Health check
    if (event.path === '/health' && event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          service: 'Societies.io Content Testing API - Full Automation'
        })
      };
    }

    // Main API endpoint
    if (event.path === '/api/societies/test-content' && event.httpMethod === 'POST') {
      const { contentType, subjectLines, targetAudience } = JSON.parse(event.body || '{}');
      
      if (!contentType || !subjectLines || !targetAudience) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Missing required fields: contentType, subjectLines, targetAudience'
          })
        };
      }

      // Convert array to string if needed
      const testString = Array.isArray(subjectLines) 
        ? subjectLines.join('\n') 
        : subjectLines;

      console.log(`[API] Starting full automation: ${contentType} for ${targetAudience}`);

      // Launch browser with optimized settings for Netlify
      const browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });

      try {
        const page = await browser.newPage();
        
        // Set timeout for the entire operation
        await page.setDefaultTimeout(300000); // 5 minutes
        
        console.log("[API] Navigating to new UI...");
        // Go to new UI (no Google sign-in required)
        await page.goto("https://boldspace.societies.io/experiments/new", { 
          waitUntil: "domcontentloaded", 
          timeout: 90000 
        });
        
        console.log("[API] Waiting for page to load...");
        await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
        await page.waitForTimeout(3000);
        
        console.log("[API] ✅ Successfully on new UI - no Google sign-in required");
        
        // Step 1: Select content type
        console.log("[API] Selecting content type...");
        
        const contentTypeMapping = {
          'Email subject': 'email_subject',
          'Ad headline': 'meta_ad'
        };
        
        const contentTypeValue = contentTypeMapping[contentType] || 'email_subject';
        
        const contentTypeSelector = page.locator('div').filter({ hasText: /^Content type/ }).getByRole('combobox').first();
        await contentTypeSelector.waitFor({ timeout: 10000, state: 'visible' });
        await contentTypeSelector.selectOption({ value: contentTypeValue });
        
        console.log(`[API] ✅ Selected content type: ${contentTypeValue}`);
        
        // Step 2: Select target audience
        console.log("[API] Selecting target audience...");
        
        const audienceMapping = {
          'UK Marketing Leaders': 'UK Marketing Leaders',
          'UK HR Decision-Makers': 'UK HR Decision-Makers',
          'UK Mortgage Advisors': 'UK Mortgage Advisors',
          'UK Beauty Lovers': 'UK Beauty Lovers',
          'UK Consumers': 'UK Consumers',
          'UK Journalists': 'UK Journalists',
          'UK Enterprise Marketing Leaders': 'UK Enterprise Marketing Leaders'
        };
        
        const audienceValue = audienceMapping[targetAudience] || targetAudience;
        
        const audienceSelector = page.getByRole('combobox').nth(1);
        await audienceSelector.waitFor({ timeout: 10000, state: 'visible' });
        await audienceSelector.selectOption(audienceValue);
        
        console.log(`[API] ✅ Selected audience: ${audienceValue}`);
        
        // Step 3: Fill subject lines
        console.log("[API] Filling subject lines...");
        
        const textarea = page.getByRole('textbox', { name: 'Add up to 10' });
        await textarea.waitFor({ timeout: 10000, state: 'visible' });
        await textarea.fill(testString);
        
        console.log(`[API] ✅ Filled subject lines: ${testString}`);
        
        // Step 4: Click Run experiment
        console.log("[API] Clicking Run experiment...");
        
        const runButton = page.getByRole('button', { name: 'Run experiment' });
        await runButton.waitFor({ timeout: 10000, state: 'visible' });
        await runButton.click();
        
        console.log("[API] ✅ Clicked Run experiment");
        
        // Step 5: Wait for experiment to start and redirect to results
        console.log("[API] Waiting for experiment to start...");
        await page.waitForTimeout(5000);
        
        console.log("[API] Waiting for redirect to results page...");
        await page.waitForURL('**/results/**', { timeout: 120000 });
        console.log("[API] ✅ Redirected to results page");
        
        // Step 6: Wait for results to load
        console.log("[API] Waiting for results to load...");
        await page.waitForTimeout(5000);
        
        // Step 7: Wait for animated counters to finish
        console.log("[API] ⏳ Waiting for animated counters to finish...");
        await page.waitForTimeout(10000); // Wait for counters to reach final values
        
        console.log("[API] ⏳ Additional wait for final values...");
        await page.waitForTimeout(5000); // Extra buffer for slow animations
        
        // Step 8: Extract results from new UI
        console.log("[API] Extracting results from new UI...");
        
        // Extract all numbers with font-size="32"
        const allNumbers = await page.locator('span[font-size="32"]').all();
        console.log(`[API] 🔍 Found ${allNumbers.length} numbers with font-size="32"`);
        
        let impactScore = "0";
        let averageScore = "0";
        let uplift = "0";
        let winner = "N/A";
        
        if (allNumbers.length >= 3) {
          impactScore = await allNumbers[0].textContent();
          averageScore = await allNumbers[1].textContent();
          uplift = await allNumbers[2].textContent();
          console.log(`[API] 🔍 Number 0: "${impactScore}"`);
          console.log(`[API] 🔍 Number 1: "${averageScore}"`);
          console.log(`[API] 🔍 Number 2: "${uplift}"`);
        }
        
        // Extract winner
        try {
          const winnerElement = page.locator('div').filter({ hasText: /Winner/ }).locator('span[font-size="32"]').first();
          if (await winnerElement.isVisible()) {
            winner = await winnerElement.textContent();
            console.log(`[API] ✅ Extracted winner: ${winner}`);
          }
        } catch (e) {
          console.log("[API] Could not extract winner, trying alternative method");
          // Alternative method to extract winner
          try {
            const winnerText = await page.textContent('body');
            const winnerMatch = winnerText.match(/Winner\s*([^\n]+)/i);
            if (winnerMatch) {
              winner = winnerMatch[1].trim();
              console.log(`[API] ✅ Extracted winner (text method): ${winner}`);
            }
          } catch (e2) {
            console.log("[API] Could not extract winner with alternative method");
          }
        }
        
        // Extract insights
        let insights = "No insights available";
        try {
          const insightsElement = page.locator('div').filter({ hasText: /preferred/ }).first();
          if (await insightsElement.isVisible()) {
            insights = await insightsElement.textContent();
            console.log(`[API] ✅ Extracted insights: ${insights.substring(0, 100)}...`);
          }
        } catch (e) {
          console.log("[API] Could not extract insights");
        }
        
        console.log(`[API] ✅ Results extracted: winner=${winner}, impact=${impactScore}, average=${averageScore}, uplift=${uplift}`);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            ok: true,
            result: {
              winner: winner,
              impactScore: { 
                value: impactScore, 
                rating: parseInt(impactScore) > 60 ? "Good" : parseInt(impactScore) > 40 ? "Average" : "Below Average" 
              },
              averageScore: averageScore,
              uplift: uplift,
              insights: insights
            }
          })
        };
        
      } finally {
        await browser.close();
      }
    }

    // 404 for other paths
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: 'Not found',
        message: 'API endpoint not found'
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
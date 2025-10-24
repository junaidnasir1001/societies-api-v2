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
          service: 'Societies.io Content Testing API'
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

      console.log(`[API] Testing: ${contentType} for ${targetAudience}`);

      // Launch browser
      const browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

      try {
        const page = await browser.newPage();
        
        // Set timeout for the entire operation
        await page.setDefaultTimeout(300000); // 5 minutes
        
        // Go to new UI
        await page.goto("https://boldspace.societies.io/experiments/new", { 
          waitUntil: "domcontentloaded", 
          timeout: 90000 
        });
        
        console.log("[API] Page loaded, waiting for form...");
        await page.waitForTimeout(3000);
        
        // Select content type
        const contentTypeMapping = {
          'Email subject': 'email_subject',
          'Ad headline': 'meta_ad'
        };
        
        const contentTypeValue = contentTypeMapping[contentType] || 'email_subject';
        
        const contentTypeSelector = page.locator('div').filter({ hasText: /^Content type/ }).getByRole('combobox').first();
        await contentTypeSelector.waitFor({ timeout: 10000, state: 'visible' });
        await contentTypeSelector.selectOption({ value: contentTypeValue });
        
        console.log(`[API] Selected content type: ${contentTypeValue}`);
        
        // Select target audience
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
        
        console.log(`[API] Selected audience: ${audienceValue}`);
        
        // Fill subject lines
        const textarea = page.getByRole('textbox', { name: 'Add up to 10' });
        await textarea.waitFor({ timeout: 10000, state: 'visible' });
        await textarea.fill(testString);
        
        console.log(`[API] Filled subject lines: ${testString}`);
        
        // Click Run experiment
        const runButton = page.getByRole('button', { name: 'Run experiment' });
        await runButton.waitFor({ timeout: 10000, state: 'visible' });
        await runButton.click();
        
        console.log("[API] Clicked Run experiment");
        
        // Wait for redirect to results
        await page.waitForURL('**/results/**', { timeout: 120000 });
        console.log("[API] Redirected to results page");
        
        // Wait for results to load
        await page.waitForTimeout(5000);
        
        // Wait for animated counters to finish
        await page.waitForTimeout(10000);
        
        // Extract results
        const allNumbers = await page.locator('span[font-size="32"]').all();
        
        let impactScore = "0";
        let averageScore = "0";
        let uplift = "0";
        let winner = "N/A";
        
        if (allNumbers.length >= 3) {
          impactScore = await allNumbers[0].textContent();
          averageScore = await allNumbers[1].textContent();
          uplift = await allNumbers[2].textContent();
        }
        
        // Extract winner
        try {
          const winnerElement = page.locator('div').filter({ hasText: /Winner/ }).locator('span[font-size="32"]').first();
          if (await winnerElement.isVisible()) {
            winner = await winnerElement.textContent();
          }
        } catch (e) {
          console.log("[API] Could not extract winner");
        }
        
        // Extract insights
        let insights = "No insights available";
        try {
          const insightsElement = page.locator('div').filter({ hasText: /preferred/ }).first();
          if (await insightsElement.isVisible()) {
            insights = await insightsElement.textContent();
          }
        } catch (e) {
          console.log("[API] Could not extract insights");
        }
        
        console.log(`[API] Results: winner=${winner}, impact=${impactScore}, average=${averageScore}, uplift=${uplift}`);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            ok: true,
            result: {
              winner: winner,
              impactScore: { value: impactScore, rating: "Average" },
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
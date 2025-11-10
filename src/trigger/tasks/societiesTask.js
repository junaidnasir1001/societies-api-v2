// Societies task implementation used by Trigger.dev worker
// Uses the existing persistent browser from getBrowser()

import { getBrowser } from '../../getBrowser.js';
import { runSimulation } from '../../societies.js';

async function postProgress(progressWebhookUrl, body) {
  try {
    if (!progressWebhookUrl) {
      console.error('[postProgress] No webhook URL provided');
      return;
    }
    
    const response = await fetch(progressWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(`[postProgress] Error: ${response.status} ${response.statusText}`, {
        url: progressWebhookUrl,
        bodyType: body.type,
        errorText: errorText.substring(0, 200)
      });
    } else {
      // Log success for done events
      if (body.type === 'done') {
        console.log(`[postProgress] Successfully sent done event to webhook`, {
          url: progressWebhookUrl,
          hasResult: !!body.result,
          hasResults: !!body.result?.results
        });
      }
    }
  } catch (error) {
    console.error('[postProgress] Fetch error:', {
      message: error.message,
      url: progressWebhookUrl,
      bodyType: body.type,
      stack: error.stack
    });
  }
}

export async function runSocietiesTask(payload, logger = console) {
  const { streamId, progressWebhookUrl, mappedInput } = payload;
  // Initial progress
  await postProgress(progressWebhookUrl, { streamId, type: 'progress', percent: 1, message: 'Starting task' });

  // Reuse the single persistent browser context
  const { context } = await getBrowser();
  const page = await context.newPage();
  
  try {
    await postProgress(progressWebhookUrl, { streamId, type: 'progress', percent: 10, message: 'Launching browser' });

    // Run simulation directly using the existing browser context
    await postProgress(progressWebhookUrl, { streamId, type: 'progress', percent: 30, message: 'Running simulation' });
    const sim = await runSimulation(page, {
      society: mappedInput.societyName,
      template: mappedInput.testType,
      inputText: mappedInput.testString,
      email: process.env.GOOGLE_EMAIL,
      password: process.env.GOOGLE_PASSWORD,
    });

    await postProgress(progressWebhookUrl, { streamId, type: 'progress', percent: 70, message: 'Parsing results' });

    const extras = sim?.result?.extras || {};
    const parsedImpact = extras.impactScore?.value ?? (sim?.result?.plainText?.match(/(\d+)\s*\/\s*100/)?.[1] ? parseInt(sim.result.plainText.match(/(\d+)\s*\/\s*100/)?.[1]) : undefined);
    const impactValueStr = (parsedImpact ?? 'N/A').toString();
    const impactRating = extras.impactScore?.rating || sim?.result?.plainText?.match(/(Very Low|Low|Medium|High|Very High|Average)/)?.[1] || 'N/A';

    const att = extras.attention || {};
    const attFull = typeof att.full === 'number' ? att.full : (Number.isFinite(parseInt(att.full)) ? parseInt(att.full) : 0);
    const attPartial = typeof att.partial === 'number' ? att.partial : (Number.isFinite(parseInt(att.partial)) ? parseInt(att.partial) : 0);
    const attIgnore = typeof att.ignore === 'number' ? att.ignore : (Number.isFinite(parseInt(att.ignore)) ? parseInt(att.ignore) : 0);

    const insights = extras.insights || sim?.result?.plainText?.match(/Insights\s+([\s\S]+?)(?:\n\n|Ask a Follow-up|Conversation|$)/)?.[1]?.trim() || '';

    const summaryText = `Impact Score: ${impactValueStr}/100. Attention: Full ${attFull}%, Partial ${attPartial}%, Ignore ${attIgnore}%`;

    const results = {
      impactScore: { value: impactValueStr, rating: impactRating },
      attention: { full: attFull, partial: attPartial, ignore: attIgnore },
      insights,
      summaryText,
      winner: extras.winner || 'N/A',
      averageScore: extras.averageScore || 'N/A',
      uplift: extras.uplift || 'N/A',
      keyFindings: [
        `Impact score: ${impactValueStr}/100 (${impactRating})`,
        `Full attention: ${attFull}%`,
        `Ignored: ${attIgnore}%`,
      ],
    };

    await postProgress(progressWebhookUrl, { streamId, type: 'progress', percent: 90, message: 'Finalizing' });

    // Send done event directly from task using postProgress to ensure it's sent
    // This ensures the done event is sent immediately after results are ready
    const donePayload = {
      streamId,
      type: 'done',
      result: { results: results },
      meta: { streamId }
    };
    
    console.log(`[societiesTask] Preparing done event for stream ${streamId}`, {
      hasResults: !!results,
      resultKeys: Object.keys(results),
      impactScore: results.impactScore,
      attention: results.attention,
      webhookUrl: progressWebhookUrl
    });
    
    // Use postProgress to send done event (it has better error handling)
    await postProgress(progressWebhookUrl, donePayload);

    return { results, meta: { streamId } };
  } catch (error) {
    logger.error?.('[societiesTask] error', error);
    throw error;
  } finally {
    // Close the page but keep the context alive for reuse
    await page.close().catch(() => {});
  }
}



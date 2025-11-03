#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { run } from './index.js';
import dotenv from 'dotenv';
import { setSseHeaders, writeEvent, startHeartbeat } from './lib/sse.js';
import { configure, tasks } from '@trigger.dev/sdk/v3';
import { runSocietiesTask } from './trigger/tasks/societiesTask.js';

// Load environment variables
dotenv.config();
// Configure Trigger.dev for triggering tasks by id
if (process.env.TRIGGER_API_KEY) {
  try {
    configure({ accessToken: process.env.TRIGGER_API_KEY, baseURL: process.env.TRIGGER_API_URL || 'https://api.trigger.dev' });
  } catch {}
}

const app = express();
const PORT = process.env.API_PORT || 3001;

// In-memory job store for async flow
// NOTE: For production, replace with Redis/DB. This is sufficient for MCP polling.
const jobs = new Map();

// Global flag to prevent concurrent browser sessions
let isProcessing = false;

function generateJobId(prefix = 'job') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sentry init (optional, lazily import if DSN provided)
let Sentry = { Handlers: { requestHandler: () => (req, res, next) => next() }, init: () => {}, captureException: () => {} };
if (process.env.SENTRY_DSN) {
  try {
    const mod = await import('@sentry/node');
    Sentry = mod;
    Sentry.init({ dsn: process.env.SENTRY_DSN });
    app.use(Sentry.Handlers.requestHandler());
  } catch {}
}

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// In-memory SSE streams map (Phase 1)
const streams = new Map(); // streamId -> { res, heartbeat }

function generateStreamId() {
  return `stream_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Normalize testType - supports ALL societies.io UI types + custom types
function normalizeTestType(testType) {
  if (!testType) return 'Article'; // Default fallback
  
  // Handle case where testType might be an object with enum property
  let actualTestType = testType;
  if (typeof testType === 'object' && testType.enum && Array.isArray(testType.enum)) {
    actualTestType = testType.enum[0]; // Use first enum value
  }
  
  // Ensure it's a string
  if (typeof actualTestType !== 'string') {
    actualTestType = String(actualTestType);
  }
  
  const normalized = actualTestType.toLowerCase().trim();
  
  // Official societies.io test types (from UI)
  const officialTypes = {
    'survey': 'Survey',
    'article': 'Article',
    'website content': 'Website Content',
    'advertisement': 'Advertisement',
    'linkedin post': 'LinkedIn Post',
    'instagram post': 'Instagram Post',
    'x post': 'X Post',
    'tiktok script': 'TikTok Script',
    'email subject line': 'Email Subject Line',
    'email': 'Email',
    'product proposition': 'Product Proposition',
    // New UI content types
    'email_subject': 'Email Subject Line',
    'meta_ad': 'Ad headline',
    'ad headline': 'Ad headline',
  };
  
  // Check if it's an official type (case-insensitive)
  if (officialTypes[normalized]) {
    return officialTypes[normalized];
  }
  
  // Map common variants to official types
  const variantMappings = {
    // Website Content variants
    'web': 'Website Content',
    'site': 'Website Content',
    'site content': 'Website Content',
    'page': 'Website Content',
    'website': 'Website Content',
    'webpage': 'Website Content',
    'landing page': 'Website Content',
    'homepage': 'Website Content',
    
    // Social Media variants
    'tweet': 'X Post',
    'twitter': 'X Post',
    'twitter post': 'X Post',
    'x': 'X Post',
    'linkedin': 'LinkedIn Post',
    'instagram': 'Instagram Post',
    'insta': 'Instagram Post',
    'tiktok': 'TikTok Script',
    
    // Email variants
    'mail': 'Email',
    'newsletter': 'Email',
    'email campaign': 'Email',
    
    // Article variants
    'blog': 'Article',
    'blog post': 'Article',
    'blog article': 'Article',
    'news': 'Article',
    'news article': 'Article',
    'story': 'Article',
    
    // Advertisement variants
    'ad': 'Advertisement',
    'ads': 'Advertisement',
    'advert': 'Advertisement',
    'meta ad': 'Advertisement',
    'meta_ad': 'Advertisement',
    
    // Product variants
    'product': 'Product Proposition',
    'proposition': 'Product Proposition',
  };
  
  // Check if it's a known variant
  if (variantMappings[normalized]) {
    return variantMappings[normalized];
  }
  
  // If not found in mappings, return the original testType with proper capitalization
  // This allows custom test types created by users
  return testType.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Optional API key middleware
function apiKeyAuth(req, res, next) {
  const apiKey = process.env.API_KEY;
  
  // If no API key is set, skip auth
  if (!apiKey) {
    return next();
  }
  
  // Accept API key via X-API-Key header, api_key query, or Authorization: Bearer <key>
  let providedKey = req.headers['x-api-key'] || req.query.api_key;
  if (!providedKey && req.headers['authorization']) {
    const auth = String(req.headers['authorization']);
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (m) providedKey = m[1];
  }
  
  if (!providedKey) {
    return res.status(401).json({
      ok: false,
      error: 'API key required. Provide via X-API-Key header or api_key query parameter.',
      inputs: null,
      results: null,
      screenshots: null,
    });
  }
  
  if (providedKey !== apiKey) {
    return res.status(403).json({
      ok: false,
      error: 'Invalid API key.',
      inputs: null,
      results: null,
      screenshots: null,
    });
  }
  
  next();
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
  });
});

// SSE Streaming endpoint (core)
app.post('/api/societies/stream', apiKeyAuth, (req, res) => {
  try {
    // Prepare SSE
    setSseHeaders(res);
    const streamId = generateStreamId();
    const heartbeat = startHeartbeat(res, 30000);
    streams.set(streamId, { res, heartbeat });

    // Connected event
    writeEvent(res, { event: 'connected', data: { streamId } });

    // Build input mapping consistent with legacy endpoint
    const {
      societyName, testType, testString, testStrings,
      contentType, subjectLines, adHeadlines, targetAudience,
    } = req.body || {};

    const finalSocietyName = targetAudience || societyName;
    const finalTestType = contentType || testType;
    let finalTestString = testString;
    if (testString && Array.isArray(testString)) finalTestString = testString.join('\n');
    else if (testStrings && Array.isArray(testStrings)) finalTestString = testStrings.join('\n');
    else if (subjectLines && Array.isArray(subjectLines)) finalTestString = subjectLines.join('\n');
    else if (adHeadlines && Array.isArray(adHeadlines)) finalTestString = adHeadlines.join('\n');

    if (!finalSocietyName || !finalTestType || !finalTestString) {
      writeEvent(res, { event: 'error', data: { code: 'bad_request', message: 'Missing required fields' } });
      res.end();
      clearInterval(heartbeat);
      streams.delete(streamId);
      return;
    }

    // Normalize testType
    const normalizedTestType = normalizeTestType(finalTestType);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const progressWebhookUrl = `${baseUrl}/api/streams/${streamId}/progress`;

    // Kick off task locally (can be replaced later with Trigger.dev invocation)
    writeEvent(res, { event: 'progress', data: { percent: 1, message: 'Task started' } });

    // Notify worker via any mechanism available. In this minimal scaffold we rely on Trigger.dev to invoke the task externally.
    // Expected payload shape for the worker task implementation
    const payload = {
      streamId,
      progressWebhookUrl,
      mappedInput: {
        societyName: finalSocietyName,
        testType: normalizedTestType,
        testString: finalTestString,
      },
    };

    // Expose payload for logs (optional)
    console.log('[SSE] Started stream', streamId);
    console.log('[SSE] Progress webhook', progressWebhookUrl);

    // Client disconnect cleanup: do not delete stream immediately
    // Keep the stream entry so webhooks don't 404; just stop heartbeats
    req.on('close', () => {
      const entry = streams.get(streamId);
      if (entry) {
        try { clearInterval(entry.heartbeat); } catch {}
        streams.set(streamId, { ...entry, disconnected: true });
      }
    });

    // Trigger the task via Trigger.dev; the worker posts progress/done to the webhook
    tasks.trigger('societies-task', payload).catch(async (err) => {
      // If triggering fails, surface error to the SSE client immediately
      if (!res.writableEnded) {
        try { writeEvent(res, { event: 'error', data: { code: 'trigger_failed', message: err?.message || 'Failed to trigger task' } }); } catch {}
        try { res.end(); } catch {}
      }
      try { clearInterval(heartbeat); } catch {}
      streams.delete(streamId);
    });

  } catch (error) {
    Sentry.captureException?.(error);
    try {
      writeEvent(res, { event: 'error', data: { code: 'internal', message: error.message } });
    } catch {}
    try { res.end(); } catch {}
  }
});

// Inbound progress webhook from worker/task
app.post('/api/streams/:streamId/progress', express.json({ limit: '1mb' }), (req, res) => {
  const { streamId } = req.params;
  const entry = streams.get(streamId);
  if (!entry) {
    return res.status(404).json({ ok: false, error: 'stream_not_found' });
  }
  const { res: sse } = entry;
  const { type, percent, message, data, result, meta } = req.body || {};

  if (type === 'progress') {
    // Only attempt to write if stream is still open
    if (!sse.writableEnded) {
      writeEvent(sse, { event: 'progress', data: { percent, message, data } });
    }
  } else if (type === 'error') {
    if (!sse.writableEnded) {
      writeEvent(sse, { event: 'error', data: { code: 'task_error', message: message || 'Task error' } });
      try { sse.end(); } catch {}
    }
    try { clearInterval(entry.heartbeat); } catch {}
    streams.delete(streamId);
  } else if (type === 'done') {
    if (!sse.writableEnded) {
      writeEvent(sse, { event: 'done', data: { results: result?.results ?? result, meta } });
      try { sse.end(); } catch {}
    }
    try { clearInterval(entry.heartbeat); } catch {}
    streams.delete(streamId);
  } else {
    // default passthrough as log
    if (!sse.writableEnded) {
      writeEvent(sse, { event: 'log', data: { level: 'info', message: message || 'update' } });
    }
  }
  res.json({ ok: true });
});

// API info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Societies.io Content Testing API',
    version: '1.0.0',
    description: 'Test content with target audiences using societies.io simulation',
    endpoints: {
      'POST /api/societies/test-content': 'Run content simulation (sync by default; set mode="async" for async)',
      'GET /api/jobs/:jobId': 'Get async job status/result',
      'POST /api/societies/test-content-batch': 'Run multiple content simulations',
      'GET /api/test-types': 'Get available test type choices',
      'GET /health': 'Health check',
      'GET /api/info': 'API information'
    },
    officialTestTypes: [
      'Survey', 'Article', 'Website Content', 'Advertisement',
      'LinkedIn Post', 'Instagram Post', 'X Post', 'TikTok Script',
      'Email Subject Line', 'Email', 'Product Proposition'
    ],
    customTypesSupported: true,
    normalization: 'Automatic normalization of common test type variants (e.g., "web" → "Website Content", "tweet" → "X Post")',
    features: [
      'All societies.io UI test types supported',
      'Custom test types accepted',
      'Batch testing (up to 5 tests)',
      'Intelligent test type normalization',
      'Flexible API for any content type'
    ]
  });
});

// Get available test type choices endpoint
app.get('/api/test-types', (req, res) => {
  res.json({
    ok: true,
    testTypes: [
      {
        value: 'Survey',
        label: 'Survey',
        category: 'Survey',
        description: 'Survey questions and forms for gathering feedback'
      },
      {
        value: 'Article',
        label: 'Article',
        category: 'Marketing Content',
        description: 'Long-form content like blog posts, news articles, editorial pieces'
      },
      {
        value: 'Website Content',
        label: 'Website Content',
        category: 'Marketing Content',
        description: 'Web pages, landing pages, homepage content, product descriptions'
      },
      {
        value: 'Advertisement',
        label: 'Advertisement',
        category: 'Marketing Content',
        description: 'Ad copy for digital or print advertisements'
      },
      {
        value: 'LinkedIn Post',
        label: 'LinkedIn Post',
        category: 'Social Media Posts',
        description: 'Professional posts for LinkedIn audience'
      },
      {
        value: 'Instagram Post',
        label: 'Instagram Post',
        category: 'Social Media Posts',
        description: 'Visual social media posts for Instagram'
      },
      {
        value: 'X Post',
        label: 'X Post',
        category: 'Social Media Posts',
        description: 'Twitter/X posts, microblogging content, short social updates'
      },
      {
        value: 'TikTok Script',
        label: 'TikTok Script',
        category: 'Social Media Posts',
        description: 'Short-form video scripts for TikTok'
      },
      {
        value: 'Email Subject Line',
        label: 'Email Subject Line',
        category: 'Communication',
        description: 'Email subject lines for campaigns and newsletters'
      },
      {
        value: 'Email',
        label: 'Email',
        category: 'Communication',
        description: 'Full email content for campaigns, newsletters, and communications'
      },
      {
        value: 'Product Proposition',
        label: 'Product Proposition',
        category: 'Product',
        description: 'Product value propositions and positioning statements'
      }
    ],
    aliases: {
      // Website Content
      'web': 'Website Content',
      'site': 'Website Content',
      'website': 'Website Content',
      'page': 'Website Content',
      'landing page': 'Website Content',
      
      // Social Media
      'tweet': 'X Post',
      'twitter': 'X Post',
      'x': 'X Post',
      'linkedin': 'LinkedIn Post',
      'instagram': 'Instagram Post',
      'insta': 'Instagram Post',
      'tiktok': 'TikTok Script',
      
      // Email
      'mail': 'Email',
      'newsletter': 'Email',
      'email campaign': 'Email',
      
      // Article
      'blog': 'Article',
      'blog post': 'Article',
      'news': 'Article',
      'story': 'Article',
      
      // Advertisement
      'ad': 'Advertisement',
      'ads': 'Advertisement',
      'advert': 'Advertisement',
      
      // Product
      'product': 'Product Proposition',
      'proposition': 'Product Proposition'
    },
    customTypesSupported: true,
    note: 'API supports all official test types from societies.io UI. Custom test types created by users are also accepted and will be passed through to the simulation.'
  });
});

// Main societies test endpoint
app.post('/api/societies/test-content', apiKeyAuth, async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Extract and validate request body - support both old and new field names
    const { 
      // Old field names (for backward compatibility)
      societyName, testType, testString, testStrings, mode,
      // New field names (matching new UI)
      contentType, subjectLines, adHeadlines, targetAudience
    } = req.body;
    
    // Map new field names to old field names for internal processing
    const finalSocietyName = targetAudience || societyName;
    const finalTestType = contentType || testType;
    
    // Handle both single testString and testStrings array, plus new subjectLines/adHeadlines
    let finalTestString = testString;
    
    // Support testString as array (new format)
    if (testString && Array.isArray(testString)) {
      finalTestString = testString.join('\n');
    }
    // Support testStrings array (existing format)
    else if (testStrings && Array.isArray(testStrings)) {
      finalTestString = testStrings.join('\n');
    }
    // Support subjectLines array (new format)
    else if (subjectLines && Array.isArray(subjectLines)) {
      finalTestString = subjectLines.join('\n');
    }
    // Support adHeadlines array (new format)
    else if (adHeadlines && Array.isArray(adHeadlines)) {
      finalTestString = adHeadlines.join('\n');
    }
    
    // Validate required fields
    if (!finalSocietyName || !finalTestType || !finalTestString) {
      const missingFields = [];
      if (!finalSocietyName) missingFields.push('societyName/targetAudience');
      if (!finalTestType) missingFields.push('testType/contentType');
      if (!finalTestString) missingFields.push('testString/testStrings/subjectLines/adHeadlines');
      
      return res.status(400).json({
        ok: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        inputs: {
          societyName: finalSocietyName || '',
          testType: finalTestType || '',
          testString: finalTestString || '',
        },
        results: null,
        screenshots: null,
      });
    }
    
    // Check if another simulation is currently processing
    if (isProcessing) {
      return res.status(503).json({
        ok: false,
        error: 'Another simulation is in progress. Please retry in 30 seconds.',
        message: 'Only one simulation can run at a time due to browser session limits.',
        retryAfter: 30,
        inputs: {
          societyName: finalSocietyName,
          testType: finalTestType,
          testString: finalTestString
        },
        results: null,
        screenshots: null,
      });
    }
    
    // Set processing flag
    isProcessing = true;
    
    // Async mode: immediately return jobId and process in background
    if (mode === 'async') {
      const normalizedTestTypeForAsync = normalizeTestType(finalTestType);
      const jobId = generateJobId('societies');

      jobs.set(jobId, {
        id: jobId,
        status: 'queued',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        inputs: { societyName: finalSocietyName, testType: normalizedTestTypeForAsync, testString: finalTestString },
        result: null,
        error: null,
      });

      // Kick off background work
      (async () => {
        try {
          jobs.set(jobId, { ...jobs.get(jobId), status: 'running', updatedAt: new Date().toISOString() });

          // Hard upper bound of 10 minutes, same as sync path
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Simulation timeout: Process took longer than 10 minutes')), 600000));

          const simulationPromise = run({
            society: finalSocietyName,
            test: normalizedTestTypeForAsync,
            text: finalTestString,
            runId: `api_async_${Date.now()}`,
          });

          const result = await Promise.race([simulationPromise, timeoutPromise]);

          // Build the same response structure as sync path
          const extras = result.result.extras || {};
          console.error(`[API] 🔍 Extras object:`, JSON.stringify(extras, null, 2));
          console.error(`[API] 🔍 Result object keys:`, Object.keys(result.result));
          console.error(`[API] 🔍 Direct result values:`, {
            winner: result.result.winner,
            averageScore: result.result.averageScore,
            uplift: result.result.uplift
          });
          const parsedImpact = extras.impactScore?.value ?? (result.result.plainText.match(/(\d+)\s*\/\s*100/)?.[1] ? parseInt(result.result.plainText.match(/(\d+)\s*\/\s*100/)?.[1]) : undefined);
          const impactValueStr = (parsedImpact ?? 'N/A').toString();
          const impactRating = extras.impactScore?.rating || result.result.plainText.match(/(Very Low|Low|Medium|High|Very High|Average)/)?.[1] || 'N/A';

          const att = extras.attention || {};
          const attFull = typeof att.full === 'number' ? att.full : (Number.isFinite(parseInt(att.full)) ? parseInt(att.full) : 0);
          const attPartial = typeof att.partial === 'number' ? att.partial : (Number.isFinite(parseInt(att.partial)) ? parseInt(att.partial) : 0);
          const attIgnore = typeof att.ignore === 'number' ? att.ignore : (Number.isFinite(parseInt(att.ignore)) ? parseInt(att.ignore) : 0);

          const insights = extras.insights || result.result.plainText.match(/Insights\s+([\s\S]+?)(?:\n\n|Ask a Follow-up|Conversation|$)/)?.[1]?.trim() || '';

          const summaryText = `Impact Score: ${impactValueStr}/100. Attention: Full ${attFull}%, Partial ${attPartial}%, Ignore ${attIgnore}%`;

          const response = {
            ok: true,
            inputs: { societyName, testType: normalizedTestTypeForAsync, testString: finalTestString },
            results: {
              impactScore: { value: impactValueStr, rating: impactRating },
              attention: { full: attFull, partial: attPartial, ignore: attIgnore },
              insights,
              summaryText,
        // New UI fields - use extras values directly with fallbacks
        winner: extras.winner || "N/A",
        averageScore: extras.averageScore || "N/A", 
        uplift: extras.uplift || "N/A",
              keyFindings: [
                `Impact score: ${impactValueStr}/100 (${impactRating})`,
                `Full attention: ${attFull}%`,
                `Ignored: ${attIgnore}%`
              ]
            }
          };

          jobs.set(jobId, { ...jobs.get(jobId), status: 'done', updatedAt: new Date().toISOString(), result: response });
        } catch (err) {
          jobs.set(jobId, { ...jobs.get(jobId), status: 'failed', updatedAt: new Date().toISOString(), error: err.message });
        } finally {
          isProcessing = false;
        }
      })();

      res.status(202)
        .set('Location', `/api/jobs/${jobId}`)
        .json({ ok: true, jobId, status: 'queued' });
      return;
    }

    // Normalize testType (sync path)
    const normalizedTestType = normalizeTestType(finalTestType);
    
    console.log(`[API] Running societies test: society="${finalSocietyName}", test="${normalizedTestType}", text="${finalTestString.substring(0, 50)}..."`);
    
    // Set timeout for the simulation (10 minutes max)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Simulation timeout: Process took longer than 10 minutes'));
      }, 600000); // 10 minutes
    });
    
    // Call the automation with timeout
    const simulationPromise = run({
      society: finalSocietyName,
      test: normalizedTestType,
      text: finalTestString,
      runId: `api_${Date.now()}`,
    });
    
    const result = await Promise.race([simulationPromise, timeoutPromise]);
    
    // Build minimal response matching client's requested structure
    const extras = result.result.extras || {};
    const parsedImpact = extras.impactScore?.value ?? (result.result.plainText.match(/(\d+)\s*\/\s*100/)?.[1] ? parseInt(result.result.plainText.match(/(\d+)\s*\/\s*100/)?.[1]) : undefined);
    const impactValueStr = (parsedImpact ?? "N/A").toString();
    const impactRating = extras.impactScore?.rating || result.result.plainText.match(/(Very Low|Low|Medium|High|Very High|Average)/)?.[1] || "N/A";

    const att = extras.attention || {};
    const attFull = typeof att.full === 'number' ? att.full : (Number.isFinite(parseInt(att.full)) ? parseInt(att.full) : 0);
    const attPartial = typeof att.partial === 'number' ? att.partial : (Number.isFinite(parseInt(att.partial)) ? parseInt(att.partial) : 0);
    const attIgnore = typeof att.ignore === 'number' ? att.ignore : (Number.isFinite(parseInt(att.ignore)) ? parseInt(att.ignore) : 0);

    const insights = extras.insights || result.result.plainText.match(/Insights\s+([\s\S]+?)(?:\n\n|Ask a Follow-up|Conversation|$)/)?.[1]?.trim() || "";

    const summaryText = `Impact Score: ${impactValueStr}/100. Attention: Full ${attFull}%, Partial ${attPartial}%, Ignore ${attIgnore}%`;

    const response = {
      ok: true,
      inputs: {
        societyName,
        testType: normalizedTestType,
        testString: finalTestString,
      },
      results: {
        impactScore: { value: impactValueStr, rating: impactRating },
        attention: { full: attFull, partial: attPartial, ignore: attIgnore },
        insights,
        summaryText,
        // New UI fields - use extras values directly with fallbacks
        winner: extras.winner || "N/A",
        averageScore: extras.averageScore || "N/A", 
        uplift: extras.uplift || "N/A",
        keyFindings: [
          `Impact score: ${impactValueStr}/100 (${impactRating})`,
          `Full attention: ${attFull}%`,
          `Ignored: ${attIgnore}%`
        ]
      }
    };
    
    const totalTime = Date.now() - startTime;
    console.log(`[API] ✅ Test completed successfully in ${totalTime}ms`);
    
    res.json(response);
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[API] ❌ Error:`, error.message);
    
    const errorResponse = {
      ok: false,
      error: error.message,
      inputs: req.body || {},
      results: null,
      screenshots: null,
    };
    
    // Return appropriate HTTP status based on error type
    const statusCode = error.message.includes('timeout') ? 408 : 500;
    res.status(statusCode).json(errorResponse);
  } finally {
    isProcessing = false;
  }
});

// Batch societies test endpoint (multiple test strings)
app.post('/api/societies/test-content-batch', apiKeyAuth, async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Extract and validate request body
    const { societyName, testType, testStrings } = req.body;
    
    // Validate required fields
    if (!societyName || !testType || !testStrings) {
      const missingFields = [];
      if (!societyName) missingFields.push('societyName');
      if (!testType) missingFields.push('testType');
      if (!testStrings) missingFields.push('testStrings');
      
      return res.status(400).json({
        ok: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        inputs: {
          societyName: societyName || '',
          testType: testType || '',
          testStrings: testStrings || [],
        },
        results: null,
      });
    }
    
    // Validate testStrings is an array
    if (!Array.isArray(testStrings) || testStrings.length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'testStrings must be a non-empty array',
        inputs: {
          societyName,
          testType,
          testStrings: testStrings || [],
        },
        results: null,
      });
    }
    
    // Limit to maximum 5 test strings to prevent overload
    if (testStrings.length > 5) {
      return res.status(400).json({
        ok: false,
        error: 'Maximum 5 test strings allowed per batch request',
        inputs: {
          societyName,
          testType,
          testStrings: testStrings.slice(0, 5),
        },
        results: null,
      });
    }
    
    // Check if another simulation is currently processing
    if (isProcessing) {
      return res.status(503).json({
        ok: false,
        error: 'Another simulation is in progress. Please retry in 30 seconds.',
        message: 'Only one simulation can run at a time due to browser session limits.',
        retryAfter: 30,
        inputs: {
          societyName,
          testType,
          testStrings: testStrings.length
        },
        results: null,
      });
    }
    
    // Set processing flag
    isProcessing = true;
    
    // Normalize testType
    const normalizedTestType = normalizeTestType(testType);
    
    console.log(`[API] Running batch societies test: society="${societyName}", test="${normalizedTestType}", count=${testStrings.length}`);
    
    // Set timeout for the batch simulation (15 minutes max)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Batch simulation timeout: Process took longer than 15 minutes'));
      }, 900000); // 15 minutes
    });
    
    // Process each test string sequentially
    const batchResults = [];
    const batchErrors = [];
    
    for (let i = 0; i < testStrings.length; i++) {
      const testString = testStrings[i];
      console.log(`[API] Processing test ${i + 1}/${testStrings.length}: "${testString.substring(0, 50)}..."`);
      
      try {
        // Call the automation for each test string
        const simulationPromise = run({
          society: societyName,
          test: normalizedTestType,
          text: testString,
          runId: `api_batch_${Date.now()}_${i}`,
        });
        
        const result = await Promise.race([simulationPromise, timeoutPromise]);
        
        // Build minimal response matching client's requested structure
        const extras = result.result.extras || {};
        const parsedImpact = extras.impactScore?.value ?? (result.result.plainText.match(/(\d+)\s*\/\s*100/)?.[1] ? parseInt(result.result.plainText.match(/(\d+)\s*\/\s*100/)?.[1]) : undefined);
        const impactValueStr = (parsedImpact ?? "N/A").toString();
        const impactRating = extras.impactScore?.rating || result.result.plainText.match(/(Very Low|Low|Medium|High|Very High|Average)/)?.[1] || "N/A";

        const att = extras.attention || {};
        const attFull = typeof att.full === 'number' ? att.full : (Number.isFinite(parseInt(att.full)) ? parseInt(att.full) : 0);
        const attPartial = typeof att.partial === 'number' ? att.partial : (Number.isFinite(parseInt(att.partial)) ? parseInt(att.partial) : 0);
        const attIgnore = typeof att.ignore === 'number' ? att.ignore : (Number.isFinite(parseInt(att.ignore)) ? parseInt(att.ignore) : 0);

        const insights = extras.insights || result.result.plainText.match(/Insights\s+([\s\S]+?)(?:\n\n|Ask a Follow-up|Conversation|$)/)?.[1]?.trim() || "";

        const summaryText = `Impact Score: ${impactValueStr}/100. Attention: Full ${attFull}%, Partial ${attPartial}%, Ignore ${attIgnore}%`;

        const testResult = {
          index: i,
          testString: testString.substring(0, 100) + (testString.length > 100 ? '...' : ''),
          fullTestString: testString,
          results: {
            impactScore: { value: impactValueStr, rating: impactRating },
            attention: { full: attFull, partial: attPartial, ignore: attIgnore },
            insights,
            summaryText,
            keyFindings: [
              `Impact score: ${impactValueStr}/100 (${impactRating})`,
              `Full attention: ${attFull}%`,
              `Ignored: ${attIgnore}%`
            ]
          }
        };
        
        batchResults.push(testResult);
        console.log(`[API] ✅ Test ${i + 1} completed successfully`);
        
      } catch (error) {
        console.error(`[API] ❌ Test ${i + 1} failed:`, error.message);
        batchErrors.push({
          index: i,
          testString: testString.substring(0, 100) + (testString.length > 100 ? '...' : ''),
          error: error.message
        });
      }
    }
    
    const response = {
      ok: true,
      inputs: {
        societyName,
        testType: normalizedTestType,
        testStrings: testStrings.map((ts, i) => ({
          index: i,
          preview: ts.substring(0, 100) + (ts.length > 100 ? '...' : ''),
          length: ts.length
        })),
      },
      results: {
        totalTests: testStrings.length,
        successfulTests: batchResults.length,
        failedTests: batchErrors.length,
        batchResults,
        errors: batchErrors.length > 0 ? batchErrors : undefined
      }
    };
    
    const totalTime = Date.now() - startTime;
    console.log(`[API] ✅ Batch test completed: ${batchResults.length}/${testStrings.length} successful in ${totalTime}ms`);
    
    res.json(response);
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[API] ❌ Batch Error:`, error.message);
    
    const errorResponse = {
      ok: false,
      error: error.message,
      inputs: req.body || {},
      results: null,
    };
    
    // Return appropriate HTTP status based on error type
    const statusCode = error.message.includes('timeout') ? 408 : 500;
    res.status(statusCode).json(errorResponse);
  } finally {
    isProcessing = false;
  }
});

// 404 handler
app.get('/api/jobs/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);
  if (!job) {
    return res.status(404).json({ ok: false, error: `Job not found: ${jobId}` });
  }

  const payload = {
    ok: true,
    jobId: job.id,
    status: job.status,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };

  if (job.status === 'done') {
    payload.result = job.result;
  }
  if (job.status === 'failed') {
    payload.error = job.error || 'Unknown error';
  }

  res.json(payload);
});

// Long polling endpoint for job status - waits until job completes
app.get('/api/jobs/:jobId/wait', (req, res) => {
  const { jobId } = req.params;
  const timeout = parseInt(req.query.timeout) || 300000; // 5 minutes default
  const pollInterval = parseInt(req.query.interval) || 5000; // 5 seconds
  const initialDelay = parseInt(req.query.delay) || 0; // 60 seconds initial delay
  
  console.log(`[API] 🔄 Long polling started for job ${jobId} (timeout: ${timeout}ms, interval: ${pollInterval}ms, initial delay: ${initialDelay}ms)`);
  
  const startTime = Date.now();
  let pollCount = 0;
  
  const poll = async () => {
    pollCount++;
    const job = jobs.get(jobId);
    
    if (!job) {
      console.log(`[API] ❌ Job ${jobId} not found`);
      return res.status(404).json({ 
        ok: false, 
        error: `Job not found: ${jobId}`,
        jobId,
        status: 'not_found'
      });
    }
    
    console.log(`[API] 🔍 Poll ${pollCount}: Job ${jobId} status = ${job.status}`);
    
    // Check if job is complete
    if (job.status === 'done') {
      console.log(`[API] ✅ Job ${jobId} completed successfully after ${pollCount} polls`);
      return res.json({
        ok: true,
        jobId: job.id,
        status: 'done',
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        result: job.result,
        pollCount,
        totalTime: Date.now() - startTime
      });
    }
    
    if (job.status === 'failed') {
      console.log(`[API] ❌ Job ${jobId} failed after ${pollCount} polls`);
      return res.status(500).json({
        ok: false,
        jobId: job.id,
        status: 'failed',
        error: job.error || 'Unknown error',
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        pollCount,
        totalTime: Date.now() - startTime
      });
    }
    
    // Check if timeout reached
    if (Date.now() - startTime > timeout) {
      console.log(`[API] ⏰ Job ${jobId} polling timeout after ${pollCount} polls (${timeout}ms)`);
      return res.status(408).json({
        ok: false,
        jobId: job.id,
        status: 'timeout',
        error: `Job polling timeout after ${timeout}ms`,
        currentStatus: job.status,
        pollCount,
        totalTime: Date.now() - startTime
      });
    }
    
    // Wait and poll again
    setTimeout(poll, pollInterval);
  };
  
  // Start polling after initial delay
  setTimeout(poll, initialDelay);
});

app.use('*', (req, res) => {
  res.status(404).json({
    ok: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    inputs: null,
    results: null,
    screenshots: null,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('[API] Unhandled error:', error);
  
  res.status(500).json({
    ok: false,
    error: 'Internal server error',
    inputs: null,
    results: null,
    screenshots: null,
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Societies API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📖 API info: http://localhost:${PORT}/api/info`);
  console.log(`🎯 Main endpoint: POST http://localhost:${PORT}/api/societies/test-content`);
  
  if (process.env.API_KEY) {
    console.log(`🔐 API key authentication: ENABLED`);
  } else {
    console.log(`🔓 API key authentication: DISABLED (set API_KEY env var to enable)`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[API] SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('[API] Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[API] SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('[API] Server closed');
    process.exit(0);
  });
});

export default app;

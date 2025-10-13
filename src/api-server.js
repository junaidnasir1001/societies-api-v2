#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { run } from './index.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Normalize testType to allowed values (reused from MCP server)
function normalizeTestType(testType) {
  const normalized = testType.toLowerCase().trim();
  
  // Map common variants to the 5 allowed types: Article, Website Content, Email, Tweet, Post
  const mappings = {
    // Website Content variants
    'web': 'Website Content',
    'site': 'Website Content',
    'site content': 'Website Content',
    'page': 'Website Content',
    'website': 'Website Content',
    'website content': 'Website Content',
    'webpage': 'Website Content',
    'landing page': 'Website Content',
    'homepage': 'Website Content',
    'blog post': 'Website Content',
    'blog': 'Website Content',
    
    // Tweet variants
    'x': 'Tweet',
    'tweet': 'Tweet',
    'x post': 'Tweet',
    'twitter': 'Tweet',
    'twitter post': 'Tweet',
    'microblog': 'Tweet',
    'short post': 'Tweet',
    
    // Email variants
    'email': 'Email',
    'newsletter': 'Email',
    'mail': 'Email',
    'email campaign': 'Email',
    'email marketing': 'Email',
    'promotional email': 'Email',
    
    // Post variants (Social Media)
    'post': 'Post',
    'linkedin post': 'Post',
    'linkedin': 'Post',
    'instagram post': 'Post',
    'instagram': 'Post',
    'facebook post': 'Post',
    'facebook': 'Post',
    'social media': 'Post',
    'social media post': 'Post',
    'social post': 'Post',
    'content': 'Post',
    'social content': 'Post',
    
    // Article variants
    'article': 'Article',
    'blog article': 'Article',
    'news article': 'Article',
    'long form': 'Article',
    'long-form': 'Article',
    'editorial': 'Article',
    'piece': 'Article',
    'story': 'Article',
    'text': 'Article',
    'copy': 'Article',
    'content piece': 'Article',
  };
  
  return mappings[normalized] || 'Article'; // Default to Article
}

// Optional API key middleware
function apiKeyAuth(req, res, next) {
  const apiKey = process.env.API_KEY;
  
  // If no API key is set, skip auth
  if (!apiKey) {
    return next();
  }
  
  const providedKey = req.headers['x-api-key'] || req.query.api_key;
  
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

// API info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Societies.io Content Testing API',
    version: '1.0.0',
    description: 'Test content with target audiences using societies.io simulation',
    endpoints: {
      'POST /api/societies/test-content': 'Run content simulation',
      'GET /health': 'Health check',
      'GET /api/info': 'API information'
    },
    allowedTestTypes: ['Article', 'Website Content', 'Email', 'Tweet', 'Post'],
    normalization: 'Automatic normalization of common test type variants (e.g., "web" → "Website Content")'
  });
});

// Main societies test endpoint
app.post('/api/societies/test-content', apiKeyAuth, async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Extract and validate request body
    const { societyName, testType, testString } = req.body;
    
    // Validate required fields
    if (!societyName || !testType || !testString) {
      const missingFields = [];
      if (!societyName) missingFields.push('societyName');
      if (!testType) missingFields.push('testType');
      if (!testString) missingFields.push('testString');
      
      return res.status(400).json({
        ok: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        inputs: {
          societyName: societyName || '',
          testType: testType || '',
          testString: testString || '',
        },
        results: null,
        screenshots: null,
      });
    }
    
    // Normalize testType
    const normalizedTestType = normalizeTestType(testType);
    
    console.log(`[API] Running societies test: society="${societyName}", test="${normalizedTestType}", text="${testString.substring(0, 50)}..."`);
    
    // Set timeout for the simulation (10 minutes max)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Simulation timeout: Process took longer than 10 minutes'));
      }, 600000); // 10 minutes
    });
    
    // Call the automation with timeout
    const simulationPromise = run({
      society: societyName,
      test: normalizedTestType,
      text: testString,
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
        testString,
      },
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
  }
});

// 404 handler
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

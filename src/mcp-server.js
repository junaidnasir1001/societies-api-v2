#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { run } from "./index.js";

// Create MCP server instance
const server = new Server(
  {
    name: "societies-automation",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Normalize testType to allowed values
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

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "societies_test_content",
        description: "Run a societies.io simulation to test content with a target audience. The LLM should gather these variables from the user: 1) audience/society name (e.g., 'Startup Investors'), 2) test type (e.g., 'Article', 'Website Content'), 3) string to test (e.g., 'cowboys vs pirates'). Returns impact score, attention metrics, and insights.",
        inputSchema: {
          type: "object",
          properties: {
            societyName: {
              type: "string",
              description: "The audience/society name that the LLM should gather from user (e.g., 'Startup Investors', 'Tech Enthusiasts', 'Healthcare Professionals')",
            },
            testType: {
              type: "string",
              description: "The test type that the LLM should gather from user. One of: 'Article', 'Website Content', 'Email', 'Tweet', 'Post'. Common variants like 'web', 'site' are normalized automatically.",
            },
            testString: {
              type: "string",
              description: "The string to test that the LLM should gather from user (e.g., 'cowboys vs pirates', 'our new product launch announcement')",
            },
          },
          required: ["societyName", "testType", "testString"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "societies_test_content") {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  const { societyName, testType, testString } = request.params.arguments;

  // Validate required fields
  if (!societyName || !testType || !testString) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            ok: false,
            error: "Missing required fields. Need: societyName, testType, testString",
            inputs: { societyName, testType, testString },
            results: null,
            screenshots: null,
          }, null, 2),
        },
      ],
    };
  }

  // Normalize testType
  const normalizedTestType = normalizeTestType(testType);

  try {
    console.error(`[MCP] Running societies test: society="${societyName}", test="${normalizedTestType}", text="${testString.substring(0, 50)}..."`);
    
    // Call the automation
    const result = await run({
      society: societyName,
      test: normalizedTestType,
      text: testString,
      runId: `mcp_${Date.now()}`,
    });

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

    console.error(`[MCP] ✅ Test completed successfully in ${result.metadata.timingsMs.total}ms`);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error(`[MCP] ❌ Error:`, error.message);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            ok: false,
            error: error.message,
            inputs: {
              societyName,
              testType: normalizedTestType,
              testString,
            },
            results: null,
            screenshots: null,
          }, null, 2),
        },
      ],
    };
  }
});

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Societies MCP server running on stdio");
  } catch (error) {
    console.error("Error starting MCP server:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});


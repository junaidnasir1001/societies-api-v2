# MCP Server Setup for Societies Automation

This guide explains how to set up the Societies.io automation as an MCP (Model Context Protocol) server that can be used with Cursor AI, Claude Desktop, or any MCP-compatible client.

## What is MCP?

MCP (Model Context Protocol) allows AI assistants to use external tools. In this case, it exposes the societies.io automation as a tool that can be called directly from your AI assistant.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Test the MCP Server Locally

```bash
npm run mcp
```

The server will start and wait for MCP requests on stdin/stdout.

## Setup for Cursor AI

### Option A: Using Cursor's MCP Support (Recommended)

1. Open Cursor Settings (Cmd/Ctrl + ,)
2. Navigate to "Features" → "MCP Servers"
3. Click "Add MCP Server"
4. Enter the following configuration:

```json
{
  "name": "societies",
  "command": "node",
  "args": [
    "/Users/junaidnasir/Herd/Automation/Upwork-Projects/dan-project/src/mcp-server.js"
  ]
}
```

5. Save and restart Cursor

### Option B: Manual Configuration

Add this to your Cursor configuration file (`~/Library/Application Support/Cursor/User/settings.json` on macOS):

```json
{
  "mcp.servers": {
    "societies": {
      "command": "node",
      "args": [
        "/Users/junaidnasir/Herd/Automation/Upwork-Projects/dan-project/src/mcp-server.js"
      ]
    }
  }
}
```

## Setup for Claude Desktop

1. Open Claude Desktop settings
2. Find the MCP servers configuration file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

3. Add the societies server:

```json
{
  "mcpServers": {
    "societies": {
      "command": "node",
      "args": [
        "/Users/junaidnasir/Herd/Automation/Upwork-Projects/dan-project/src/mcp-server.js"
      ]
    }
  }
}
```

4. Restart Claude Desktop

## Using the Tool

### Cursor Agent System Prompt

Paste this into your Cursor Agent system prompt:

```
You are an assistant that drives a local browser automation via MCP.
Your single responsibility: collect 3 inputs, call the MCP tool societies.run, and return the structured JSON result to the user.

Tool contract:
- tool name: societies.run
- args (all required):
  - societyName (string) — audience/society, e.g. "Startup Investors"
  - testType (string) — one of: "Article" | "Website Content" | "Email" | "Tweet" | "Post"
    Normalize common variants:
    - "web", "site", "page" → "Website Content"
    - "x", "tweet" → "Tweet"
    If unsure, default to "Article".
  - testString (string) — the text to test, e.g. "cowboys vs pirates"

Output contract (from the tool):
Expect a JSON object with (at minimum):
{
  "ok": true,
  "inputs": { "societyName": "...", "testType": "...", "testString": "..." },
  "results": {
    "summaryText": "...", 
    "keyFindings": ["..."],
    "rawHtml": "<div>...</div>",
    "url": "https://..."
  },
  "error": null
}

Flow:
1. Collect inputs - If any of the 3 fields is missing, ask one concise question to get it.
2. Normalize testType to the allowed set.
3. Call the tool: Invoke societies.run with { societyName, testType, testString }.
4. Validate & Retry (once) - If the response has ok: true, proceed. If ok is false or error is present, check the message. Perform one retry if it looks transient.
5. Return result - Respond with a brief human summary (2–3 lines) and then include the raw JSON in a fenced code block.

Rules:
- Use only societies.run. Don't fabricate data if the tool fails.
- Keep responses short and practical.
- Never reveal secrets.
- If the MCP tool is unavailable, say so clearly and stop.
```

### Example Usage

**User prompt:**
```
Run a societies test with:
- societyName: Startup Investors
- testType: Article
- testString: cowboys vs pirates
```

**Agent will:**
1. Normalize the testType (if needed)
2. Call `societies.run` with the parameters
3. Return a summary and the full JSON response

### Sample Output

```json
{
  "ok": true,
  "inputs": {
    "societyName": "Startup Investors",
    "testType": "Article",
    "testString": "cowboys vs pirates"
  },
  "results": {
    "impactScore": {
      "value": "15",
      "rating": "Very Low"
    },
    "attention": {
      "full": 3,
      "partial": 22,
      "ignore": 75
    },
    "insights": "The article performed poorly with the target audience...",
    "summaryText": "Impact Score: 15/100. Attention: Full 3%, Partial 22%, Ignore 75%",
    "keyFindings": [
      "Impact score: 15/100 (Very Low)",
      "Full attention: 3%",
      "Ignored: 75%"
    ],
    "rawHtml": "<div>...</div>",
    "plainText": "...",
    "url": "https://app.societies.io/"
  },
  "metadata": {
    "timingsMs": {
      "googleLogin": 0,
      "simulate": 251234,
      "total": 251678
    },
    "runId": "mcp_1728567890123"
  },
  "error": null
}
```

## Quick Test Templates

### Test 1: Simple Article
```
Run a societies test with:
- societyName: Startup Investors
- testType: Article
- testString: AI is revolutionizing everything
```

### Test 2: Website Content
```
Run a societies test with:
- societyName: Tech Enthusiasts
- testType: Website Content
- testString: Discover the future of technology
```

### Test 3: Tweet/X Post
```
Run a societies test with:
- societyName: Marketing Professionals
- testType: Tweet
- testString: Just launched our new product! 🚀
```

## Troubleshooting

### Server doesn't start
- Check that Node.js is installed: `node --version`
- Verify dependencies are installed: `npm install`
- Check the path in the configuration matches your project location

### Tool not showing up in Cursor/Claude
- Restart the application after adding configuration
- Check the logs/console for MCP connection errors
- Verify the absolute path to `mcp-server.js` is correct

### Browser automation fails
- Make sure `.env` file is configured with Google credentials
- Check that DNS mapping is working (see main README)
- Ensure no other browser automation is running

### DNS Issues
The script uses hardcoded DNS mappings for societies.io domains. If you see DNS errors, the mappings in `src/index.js` may need updating.

## Advanced: Environment Variables

You can pass environment variables through the MCP configuration:

```json
{
  "mcpServers": {
    "societies": {
      "command": "node",
      "args": ["/path/to/mcp-server.js"],
      "env": {
        "GOOGLE_EMAIL": "your-email@example.com",
        "GOOGLE_PASSWORD": "your-password",
        "NODE_ENV": "production"
      }
    }
  }
}
```

⚠️ **Security Note**: Be careful with credentials in config files. It's better to keep them in the `.env` file.

## Development

### Test the server manually

```bash
# Start the server
npm run mcp

# In another terminal, send a test request (requires jq)
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npm run mcp
```

### Debug mode

Add debug logging:
```bash
NODE_ENV=development npm run mcp
```

## Support

For issues specific to:
- **MCP protocol**: Check https://modelcontextprotocol.io
- **Societies.io automation**: See the main project README
- **Cursor integration**: Check Cursor documentation

---

Made with ❤️ for automated content testing


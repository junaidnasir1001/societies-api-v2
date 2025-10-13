# Claude Desktop Setup Guide

## Prerequisites

1. **Claude Desktop App** installed
2. **Node.js** (v18 or higher)
3. **Project dependencies** installed (`npm install`)

## Setup Steps

### Step 1: Locate Claude Desktop Config File

The config file location depends on your OS:

**macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```bash
~/.config/Claude/claude_desktop_config.json
```

### Step 2: Create/Edit Configuration

1. **Create the config directory** (if it doesn't exist):

**macOS/Linux:**
```bash
mkdir -p ~/Library/Application\ Support/Claude
```

**Windows:**
```bash
mkdir %APPDATA%\Claude
```

2. **Copy the sample config** to Claude Desktop config location:

**macOS:**
```bash
cp /Users/junaidnasir/Herd/Automation/Upwork-Projects/dan-project/claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

Or manually create the file with this content:

```json
{
  "mcpServers": {
    "societies": {
      "command": "node",
      "args": [
        "/Users/junaidnasir/Herd/Automation/Upwork-Projects/dan-project/src/mcp-server.js"
      ],
      "env": {}
    }
  }
}
```

**⚠️ Important**: Replace the path with your actual project path!

### Step 3: Verify the Path

Make sure the path in `args` is correct:

```bash
# Check if the file exists
ls -la /Users/junaidnasir/Herd/Automation/Upwork-Projects/dan-project/src/mcp-server.js

# Should show the file with execute permissions (x)
```

If the file doesn't exist or path is wrong, update it:

```bash
# Get the correct absolute path
pwd
# Then use: YOUR_PWD/src/mcp-server.js
```

### Step 4: Restart Claude Desktop

1. **Quit Claude Desktop completely** (not just close the window)
   - macOS: Right-click on dock icon → Quit
   - Windows: Right-click on system tray → Exit
   - Linux: Use your system's quit method

2. **Restart Claude Desktop**

3. **Check for the tool**
   - Open a new conversation
   - Look for a 🔧 (tools) icon or menu
   - You should see "societies" tool listed

### Step 5: Test the Integration

**Simple Test:**

Ask Claude:
```
Use the societies tool to test this content:
- societyName: Startup Investors
- testType: Article  
- testString: AI is revolutionizing everything
```

**Expected Response:**

Claude will:
1. Recognize the societies tool
2. Call it with the parameters
3. Wait for ~5 minutes (browser automation)
4. Return the results with impact score and insights

## Usage in Claude Desktop

### Natural Language Usage

You don't need to use exact syntax. Claude understands natural language:

**Example 1:**
```
Can you test "Blockchain is the future" as an article for Startup Investors using the societies tool?
```

**Example 2:**
```
I want to test my website headline "Transform your business with AI" for Tech Enthusiasts
```

**Example 3:**
```
Test this tweet for Marketing Professionals: "Just launched our new product! 🚀"
```

### Tool Response Format

Claude will show:

1. **Tool Call Indicator** - Shows that it's using the societies tool
2. **Parameters** - The normalized inputs
3. **Loading** - "Running automation..." (takes ~5 minutes)
4. **Results Summary** - Human-readable summary
5. **Full JSON** - Complete structured data

Example response:
```
I'll test that content for you using the societies automation tool.

[Tool: societies.run]
{
  "societyName": "Startup Investors",
  "testType": "Article",
  "testString": "AI is revolutionizing everything"
}

⏳ Running automation... (this takes about 4-5 minutes)

✅ Results are in!

The content scored 18/100 (Very Low) with Startup Investors. Only 4% of readers 
gave it full attention, while 72% ignored it completely. 

Key insights:
- The statement is too vague and lacks concrete data
- Investors want specific use cases and ROI metrics
- Consider adding statistics or real-world examples
- Make it more relevant to investment decisions

Full results:
{
  "ok": true,
  "results": {
    "impactScore": { "value": "18", "rating": "Very Low" },
    "attention": { "full": 4, "partial": 24, "ignore": 72 },
    ...
  }
}
```

## Troubleshooting

### Tool Not Showing Up

**Check 1: Config File Location**
```bash
# macOS - verify file exists
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Check 2: JSON Syntax**
- Make sure the JSON is valid (no trailing commas, proper quotes)
- Use a JSON validator if needed

**Check 3: Path is Absolute**
- Path must be absolute (starting with `/` on macOS/Linux or `C:\` on Windows)
- No `~` or relative paths

**Check 4: Restart Properly**
- Completely quit Claude Desktop (not just close window)
- Restart the app
- Check Developer Tools for errors (if available)

### Tool Fails to Execute

**Check 1: Node.js is Accessible**
```bash
which node
# Should show: /usr/local/bin/node or similar
```

**Check 2: Dependencies Installed**
```bash
cd /Users/junaidnasir/Herd/Automation/Upwork-Projects/dan-project
npm install
```

**Check 3: File is Executable**
```bash
chmod +x /Users/junaidnasir/Herd/Automation/Upwork-Projects/dan-project/src/mcp-server.js
```

**Check 4: Test Manually**
```bash
npm run mcp
# Should start without errors
```

### Automation Fails

**Check 1: Environment Variables**
Make sure `.env` file exists with Google credentials:
```bash
cat /Users/junaidnasir/Herd/Automation/Upwork-Projects/dan-project/.env
```

**Check 2: Test Standalone**
```bash
npm run dev
# Should work without MCP
```

**Check 3: DNS Issues**
Already fixed in the code, but if you see DNS errors:
- Check `src/index.js` has DNS mappings
- Verify internet connection

### Slow Responses

This is **normal**:
- Browser automation takes 4-5 minutes
- Google login + SSO + simulation + results extraction
- Be patient!

Progress indicators:
- "Running automation..." - Started
- Browser window opens - Automating
- No response yet - Still working
- JSON response - Complete!

## Advanced Configuration

### Add Environment Variables

If you want to override `.env` file:

```json
{
  "mcpServers": {
    "societies": {
      "command": "node",
      "args": [
        "/Users/junaidnasir/Herd/Automation/Upwork-Projects/dan-project/src/mcp-server.js"
      ],
      "env": {
        "GOOGLE_EMAIL": "your-email@example.com",
        "GOOGLE_PASSWORD": "your-password",
        "NODE_ENV": "production"
      }
    }
  }
}
```

⚠️ **Security Warning**: Only do this if you understand the security implications.

### Multiple MCP Servers

You can add other MCP servers too:

```json
{
  "mcpServers": {
    "societies": {
      "command": "node",
      "args": ["/path/to/mcp-server.js"]
    },
    "other-tool": {
      "command": "python",
      "args": ["/path/to/other-tool.py"]
    }
  }
}
```

### Debug Mode

To see detailed logs:

1. Update config:
```json
{
  "mcpServers": {
    "societies": {
      "command": "node",
      "args": [
        "/Users/junaidnasir/Herd/Automation/Upwork-Projects/dan-project/src/mcp-server.js"
      ],
      "env": {
        "DEBUG": "*",
        "NODE_ENV": "development"
      }
    }
  }
}
```

2. Check Claude Desktop logs (if accessible)

## Comparison: Claude Desktop vs Cursor

| Feature | Claude Desktop | Cursor |
|---------|---------------|--------|
| MCP Support | ✅ Native | ✅ Native |
| Setup Complexity | Easy | Easy |
| Natural Language | ✅ Excellent | ✅ Good |
| Code Context | ❌ Limited | ✅ Full IDE |
| Conversation | ✅ Better | ✅ Good |
| Tool Response | ✅ Clear | ✅ Clear |

**Recommendation**: Use **Claude Desktop** if:
- You want pure conversation interface
- You don't need code editing
- You prefer standalone app
- Client specifically requested it

Use **Cursor** if:
- You're actively coding
- You want IDE integration
- You need code context
- You want inline results

## Testing Checklist

- [ ] Config file created in correct location
- [ ] Path is absolute and correct
- [ ] JSON syntax is valid
- [ ] Claude Desktop restarted completely
- [ ] Tool shows up in tools list
- [ ] Test query sent
- [ ] Automation runs (browser opens)
- [ ] Results received (~5 minutes)
- [ ] Impact score and insights shown

## Example Prompts for Claude Desktop

### Test 1: Article
```
I have an article about AI for Startup Investors. The content is:
"Artificial intelligence is transforming the tech landscape. Companies implementing 
AI see 40% productivity gains and 30% cost reduction."

Can you test this using the societies tool?
```

### Test 2: Website Content
```
Test this website headline for Tech Enthusiasts:
"Discover the next generation of cloud computing - faster, smarter, more secure"
```

### Test 3: Social Media
```
I want to test this tweet for Marketing Professionals:
"🚀 Just launched our new AI-powered marketing platform! Automate your campaigns 
and boost ROI by 50%. Try it free: [link]"

Use the societies tool to see how it performs.
```

### Test 4: Comparison
```
I have two versions of content. Can you test both and tell me which performs better?

Version A: "Innovative blockchain solutions for enterprise"
Version B: "Save $100K annually with blockchain automation"

Test both for Startup Investors.
```

## Support

**For Claude Desktop Issues:**
- Check official Claude Desktop documentation
- Verify MCP configuration syntax
- Check Claude Desktop version (update if needed)

**For Tool/Automation Issues:**
- See `MCP_SETUP.md` for general troubleshooting
- Run `npm run test:mcp` for standalone testing
- Check `README.md` for project-specific issues

**For Integration Help:**
- See `MCP_IMPLEMENTATION_SUMMARY.md` for technical details
- Check `QUICK_START.md` for basic setup
- Review logs in terminal when running `npm run mcp`

---

**Ready to use with Claude Desktop!** 🎉

Simply copy the config, restart Claude, and start testing your content!


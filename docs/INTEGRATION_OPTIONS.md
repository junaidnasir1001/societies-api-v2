# Integration Options - Choose Your Interface

This MCP server can be used with multiple AI interfaces. Choose the one that fits your workflow best.

## 🎯 Quick Comparison

| Feature | Claude Desktop | Cursor AI | API/CLI |
|---------|---------------|-----------|---------|
| **Setup Time** | 3 minutes | 3 minutes | Instant |
| **Best For** | Conversation & Testing | Coding + Testing | Automation |
| **Interface** | Chat App | IDE | Command Line |
| **Natural Language** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ |
| **Code Context** | ⭐ | ⭐⭐⭐⭐⭐ | N/A |
| **Ease of Use** | Very Easy | Easy | Technical |
| **Client Preference** | ✅ Recommended | ✅ Good | ⭐ Advanced |

## Option 1: Claude Desktop (Recommended for Content Testing)

### ✅ Best For:
- Non-technical users
- Content creators
- Marketing teams
- Quick ad-hoc testing
- Conversational workflow

### 📖 Setup Guide:
**Quick**: `CLAUDE_DESKTOP_QUICK_SETUP.md` (3 minutes)  
**Full**: `CLAUDE_DESKTOP_SETUP.md` (comprehensive)

### 💬 Example Usage:
```
Test this headline for Startup Investors:
"AI-powered analytics - 10x faster insights"
```

Claude will:
1. Understand your request
2. Use the societies tool automatically
3. Wait for results (~5 min)
4. Present findings in a clear format

### ⚡ Quick Setup:
```bash
# macOS
cp claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Restart Claude Desktop
# Ask: "Test 'your content' for Startup Investors"
```

## Option 2: Cursor AI (Best for Developers)

### ✅ Best For:
- Developers
- When coding + testing together
- IDE-integrated workflow
- Code generation + testing

### 📖 Setup Guide:
**Quick**: `QUICK_START.md` (3 steps)  
**Full**: `MCP_SETUP.md` (detailed)

### 💬 Example Usage:
```
Run a societies test:
- societyName: Tech Enthusiasts
- testType: Article
- testString: Your content here
```

### ⚡ Quick Setup:
1. Copy `CURSOR_AGENT_PROMPT.txt` → Cursor Agent System Prompt
2. Add MCP server config (see `QUICK_START.md`)
3. Restart Cursor
4. Ask: "Run a societies test for..."

## Option 3: Direct CLI (For Automation)

### ✅ Best For:
- Automated workflows
- CI/CD integration
- Batch testing
- Scripting

### 📖 Setup Guide:
See main `README.md`

### 💻 Example Usage:
```bash
# Single test
npm run simulate -- \
  --society="Startup Investors" \
  --test="Article" \
  --text="Your content"

# HTTP API
curl -X POST http://localhost:3000/simulate \
  -H "Content-Type: application/json" \
  -d '{"society": "...", "test": "...", "text": "..."}'
```

### ⚡ Quick Setup:
```bash
npm install
npm run dev  # Test it works
```

## Decision Matrix

### Choose Claude Desktop if:
- ✅ Client specifically requested it
- ✅ Users are non-technical
- ✅ You want the best conversational experience
- ✅ You don't need code editing
- ✅ You prefer a standalone app
- ✅ You want the simplest setup

### Choose Cursor AI if:
- ✅ You're a developer
- ✅ You want IDE integration
- ✅ You're actively coding
- ✅ You need code context
- ✅ You want inline results

### Choose CLI/API if:
- ✅ You're building automation
- ✅ You need CI/CD integration
- ✅ You're running batch tests
- ✅ You want programmatic access

## Feature Comparison

### Natural Language Understanding

**Claude Desktop:**
```
"Can you test my headline about AI for investors?"
→ Claude asks for the headline
→ You provide it
→ Claude runs the test automatically
```

**Cursor AI:**
```
"Run a test for Startup Investors, Article, text: AI headline"
→ Cursor extracts parameters
→ Runs the test
→ Returns results
```

**CLI:**
```bash
npm run simulate -- --society="..." --test="..." --text="..."
→ Direct execution
→ JSON output
```

### Response Format

**Claude Desktop:**
- Conversational summary
- Key insights highlighted
- Full JSON available
- Follow-up questions easy

**Cursor AI:**
- Brief summary
- JSON in code block
- Inline with code
- Technical format

**CLI:**
- Pure JSON output
- Saved to files
- Machine-readable
- No conversation

### Integration Complexity

**Claude Desktop:**
1. Copy config file (1 command)
2. Restart app
3. Start chatting
✅ **Easiest**

**Cursor AI:**
1. Copy system prompt
2. Add MCP config
3. Restart Cursor
4. Start testing
✅ **Easy**

**CLI:**
1. Install dependencies
2. Configure .env
3. Run commands
⭐ **Technical**

## Real-World Scenarios

### Scenario 1: Marketing Team Testing Headlines
**Best Choice:** Claude Desktop

**Why:**
- Non-technical users
- Need quick feedback
- Want conversational interface
- Test multiple variations easily

**Workflow:**
```
User: "Test these 3 headlines for Tech Enthusiasts"
Claude: "Sure! I'll test each one. What's the first headline?"
User: "AI makes coding 10x faster"
Claude: [runs test, shows results]
Claude: "This scored 32/100. What's the next one?"
...
```

### Scenario 2: Developer Building Content Feature
**Best Choice:** Cursor AI

**Why:**
- Developer workflow
- Building feature that uses this
- Needs to test while coding
- Wants inline results

**Workflow:**
```typescript
// Developer writes code
function testContent(text: string) {
  // Ask Cursor: "Test this text for Startup Investors"
  // Gets results inline
  // Continues coding
}
```

### Scenario 3: Automated Content Pipeline
**Best Choice:** CLI/API

**Why:**
- Automated workflow
- No human interaction needed
- Batch processing
- Integration with other systems

**Workflow:**
```bash
#!/bin/bash
for content in content_files/*.txt; do
  npm run simulate -- --society="..." --text="$(cat $content)"
done
```

## Migration Path

Already using one? Easy to add others:

### From CLI → Claude Desktop:
1. Keep CLI setup (works independently)
2. Add Claude Desktop config
3. Use both as needed

### From Cursor → Claude Desktop:
1. Both use same MCP server
2. Add Claude config
3. Use whichever fits the task

### From Claude Desktop → Cursor:
1. Copy system prompt to Cursor
2. Add MCP config to Cursor
3. Same tool, different interface

## Support & Resources

### Claude Desktop:
- **Quick Setup**: `CLAUDE_DESKTOP_QUICK_SETUP.md`
- **Full Guide**: `CLAUDE_DESKTOP_SETUP.md`
- **Troubleshooting**: See guide

### Cursor AI:
- **Quick Setup**: `QUICK_START.md`
- **Full Guide**: `MCP_SETUP.md`
- **System Prompt**: `CURSOR_AGENT_PROMPT.txt`

### CLI/API:
- **Main Guide**: `README.md`
- **Testing**: `npm run dev`
- **HTTP API**: See README

### All Options:
- **Technical Details**: `MCP_IMPLEMENTATION_SUMMARY.md`
- **Test Script**: `npm run test:mcp`
- **Source Code**: `src/mcp-server.js`

## Recommendation

**For your client (based on "Client requested Claude Desktop"):**

1. **Primary**: Claude Desktop
   - Easiest for non-technical users
   - Best conversational experience
   - Client's preference

2. **Secondary**: CLI
   - For automated testing
   - Batch processing
   - Integration needs

3. **Optional**: Cursor
   - If developers need it
   - For technical users
   - IDE integration

**Setup Order:**
1. Start with Claude Desktop (3 minutes)
2. Test with client
3. Add others as needed

---

**All options work with the same MCP server - choose what fits your workflow best!** 🎯


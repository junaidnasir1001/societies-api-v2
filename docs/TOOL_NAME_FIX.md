# Tool Name Fix - societies.run → societies_run

## Issue
Claude Desktop showed warning:
```
tools.0.FrontendRemoteMcpToolDefinition.name: String should match pattern '^[a-zA-Z0-9_-]{1,64}$'
```

**Problem**: The dot (.) in `societies.run` is not allowed in Claude Desktop tool names.

## Fix Applied ✅

Changed tool name from `societies.run` to `societies_run`

### Files Updated:
1. ✅ `src/mcp-server.js` - Tool definition and handler
2. ✅ `CURSOR_AGENT_PROMPT.txt` - System prompt
3. ✅ `test-mcp.js` - Test script

## Next Steps

### 1. Restart Claude Desktop
**Important**: Completely quit and restart Claude Desktop to pick up the changes.

```bash
# macOS: Cmd+Q to quit
# Then reopen Claude Desktop
```

### 2. Test Again
In Claude Desktop, type:
```
Use the societies_run tool to test this content:
- societyName: Startup Investors
- testType: Article
- testString: AI is revolutionizing the tech industry with machine learning and automation
```

### 3. Expected Result
- ✅ No warning message
- ✅ Tool executes successfully
- ✅ Browser automation runs
- ✅ Results returned in ~5 minutes

## Tool Name Change Summary

| Before | After |
|--------|-------|
| `societies.run` | `societies_run` |

**Reason**: Claude Desktop only allows alphanumeric characters, underscores, and hyphens in tool names (no dots).

---

**Status**: Fixed and ready to test! 🚀


# Claude Desktop - Quick Setup (3 Minutes)

## 🚀 Setup in 3 Steps

### Step 1: Copy Config File (30 seconds)

**macOS:**
```bash
# Create directory if needed
mkdir -p ~/Library/Application\ Support/Claude

# Copy the config
cp claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows (PowerShell):**
```powershell
# Create directory if needed
New-Item -ItemType Directory -Force -Path "$env:APPDATA\Claude"

# Copy the config
Copy-Item claude_desktop_config.json "$env:APPDATA\Claude\claude_desktop_config.json"
```

### Step 2: Verify Path (30 seconds)

**macOS/Linux:**
```bash
# Check if MCP server file exists
ls -la /Users/junaidnasir/Herd/Automation/Upwork-Projects/dan-project/src/mcp-server.js
```

**If path is different**, edit the config:
```bash
# macOS
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Update the path in "args" to your actual path
```

### Step 3: Restart Claude Desktop (1 minute)

1. **Quit** Claude Desktop completely (right-click → Quit)
2. **Restart** Claude Desktop
3. **Verify** tool is available (look for 🔧 or tools menu)

## ✅ Test It!

**Ask Claude:**
```
Use the societies tool to test "AI is the future" as an article for Startup Investors
```

**Expected:**
- ⏳ Browser opens (automation starts)
- ⏱️ Wait ~5 minutes
- ✅ Results show impact score and insights

## 📝 Usage Examples

### Example 1: Simple Test
```
Test this for Tech Enthusiasts: "Cloud computing made simple"
```

### Example 2: Social Media
```
I want to test this tweet for Marketing Professionals:
"Just launched our new product! 🚀"
```

### Example 3: Detailed Request
```
Can you test my article headline using the societies tool?

Audience: Startup Investors
Type: Article
Content: "How AI is transforming SaaS - 40% faster development, 
50% cost reduction, and 3x customer satisfaction"
```

## 🔧 Troubleshooting

### Tool Not Showing?
1. Check config file exists: `cat ~/Library/Application\ Support/Claude/claude_desktop_config.json`
2. Verify path is correct
3. Restart Claude Desktop **completely**

### Automation Fails?
1. Run standalone test: `npm run dev`
2. Check `.env` file exists
3. Verify Google credentials

### Slow Response?
- **Normal!** Takes 4-5 minutes
- Browser automation is not instant
- Be patient

## 📚 More Help

- **Full Setup**: `CLAUDE_DESKTOP_SETUP.md`
- **Technical Details**: `MCP_IMPLEMENTATION_SUMMARY.md`
- **General Guide**: `MCP_SETUP.md`

---

**That's it!** Copy config, restart Claude, start testing! 🎉


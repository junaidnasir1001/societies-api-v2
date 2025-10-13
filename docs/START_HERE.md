# 👋 Start Here - Societies.io Automation

## 🎯 What is This?

An automated content testing tool that uses **Claude Desktop** (or Cursor AI) to test your content with target audiences on Societies.io. Get instant feedback on impact, attention, and insights.

---

## ⚡ Quick Start (Choose Your Path)

### 🥇 **Option 1: Claude Desktop** (Recommended - 3 minutes)

**Best for**: Non-technical users, content teams, quick testing

📖 **Guide**: [CLAUDE_DESKTOP_QUICK_SETUP.md](./CLAUDE_DESKTOP_QUICK_SETUP.md)

```bash
# One command setup
cp claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Restart Claude Desktop
# Then ask: "Test 'your content' for Startup Investors"
```

---

### 🥈 **Option 2: Cursor AI** (For Developers)

**Best for**: Developers, IDE integration, coding + testing

📖 **Guide**: [QUICK_START.md](./QUICK_START.md)

1. Copy system prompt from `CURSOR_AGENT_PROMPT.txt`
2. Add MCP config to Cursor
3. Ask: "Run a societies test..."

---

### 🥉 **Option 3: Direct CLI** (For Automation)

**Best for**: Scripts, CI/CD, batch processing

📖 **Guide**: [README.md](./README.md)

```bash
npm install
npm run dev  # Test it works
npm run simulate -- --society="..." --test="..." --text="..."
```

---

## 📚 Documentation Index

### Setup Guides (Start Here)
1. **[CLAUDE_DESKTOP_QUICK_SETUP.md](./CLAUDE_DESKTOP_QUICK_SETUP.md)** ⭐  
   3-minute setup for Claude Desktop

2. **[QUICK_START.md](./QUICK_START.md)**  
   Quick start for Cursor AI (3 steps)

3. **[INTEGRATION_OPTIONS.md](./INTEGRATION_OPTIONS.md)**  
   Compare all interfaces and choose

### Complete Guides
4. **[CLAUDE_DESKTOP_SETUP.md](./CLAUDE_DESKTOP_SETUP.md)**  
   Complete Claude Desktop guide with troubleshooting

5. **[MCP_SETUP.md](./MCP_SETUP.md)**  
   General MCP setup for both Claude and Cursor

6. **[README.md](./README.md)**  
   Main project documentation

### Technical Documentation
7. **[MCP_IMPLEMENTATION_SUMMARY.md](./MCP_IMPLEMENTATION_SUMMARY.md)**  
   Technical details, architecture, how it works

8. **[FINAL_DELIVERY_SUMMARY.md](./FINAL_DELIVERY_SUMMARY.md)**  
   Complete project summary and deliverables

### Reference
9. **[CURSOR_AGENT_PROMPT.txt](./CURSOR_AGENT_PROMPT.txt)**  
   System prompt for Cursor AI (copy-paste ready)

---

## 🎬 Example Usage

### In Claude Desktop:
```
User: Test this headline for Tech Enthusiasts:
"AI-powered analytics - 10x faster insights"

Claude: I'll test that for you using the societies tool.
⏳ Running automation... (4-5 minutes)

✅ Results:
Impact Score: 32/100 (Low)
- Full attention: 9%
- Partial attention: 38%
- Ignored: 53%

Insights: The headline mentions a concrete benefit (10x faster) 
but lacks context about how the AI works. Tech enthusiasts want 
to understand the technology behind the claims...
```

### In Cursor:
```
Run a societies test:
- societyName: Startup Investors
- testType: Article
- testString: AI is transforming SaaS

[Returns JSON with full results]
```

### Via CLI:
```bash
npm run simulate -- \
  --society="Startup Investors" \
  --test="Article" \
  --text="AI is transforming SaaS"
```

---

## 🧪 Testing

### Quick Test
```bash
npm run test:mcp
```

### Full Test
```bash
npm run dev
```

---

## 🆘 Need Help?

### Common Questions

**Q: Which interface should I use?**  
A: See [INTEGRATION_OPTIONS.md](./INTEGRATION_OPTIONS.md)

**Q: How do I set up Claude Desktop?**  
A: See [CLAUDE_DESKTOP_QUICK_SETUP.md](./CLAUDE_DESKTOP_QUICK_SETUP.md)

**Q: How do I set up Cursor?**  
A: See [QUICK_START.md](./QUICK_START.md)

**Q: The tool isn't showing up?**  
A: Check the setup guide for your interface (Claude/Cursor)

**Q: It's taking too long?**  
A: 4-5 minutes is normal for browser automation

**Q: How do I test it works?**  
A: Run `npm run test:mcp`

### Troubleshooting Guides

- **Claude Desktop Issues**: [CLAUDE_DESKTOP_SETUP.md](./CLAUDE_DESKTOP_SETUP.md) → Troubleshooting
- **Cursor Issues**: [MCP_SETUP.md](./MCP_SETUP.md) → Troubleshooting
- **Automation Issues**: [README.md](./README.md) → Notes section
- **Technical Issues**: [MCP_IMPLEMENTATION_SUMMARY.md](./MCP_IMPLEMENTATION_SUMMARY.md) → Troubleshooting

---

## 📦 What's Included

```
✅ MCP Server (Claude Desktop & Cursor AI integration)
✅ Browser Automation (with DNS fixes)
✅ CLI Interface
✅ HTTP API
✅ Complete Documentation (9 guides)
✅ Testing Tools
✅ Sample Configurations
```

---

## 🎯 Quick Decision Tree

```
Start Here
    |
    ├─ Want conversational interface?
    │   └─ YES → Use Claude Desktop
    │       📖 CLAUDE_DESKTOP_QUICK_SETUP.md
    │
    ├─ Are you a developer?
    │   └─ YES → Use Cursor AI
    │       📖 QUICK_START.md
    │
    └─ Need automation/scripts?
        └─ YES → Use CLI/API
            📖 README.md
```

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| **Setup (Claude Desktop)** | 3 minutes |
| **Setup (Cursor)** | 3-5 minutes |
| **Setup (CLI)** | 2 minutes |
| **First Test** | 5-6 minutes |
| **Subsequent Tests** | 4-5 minutes |
| **Read Documentation** | 10-30 minutes |

---

## 🚀 Recommended Path

### For First-Time Users:

1. **Read**: This file (you're here!)
2. **Choose**: [INTEGRATION_OPTIONS.md](./INTEGRATION_OPTIONS.md)
3. **Setup**: [CLAUDE_DESKTOP_QUICK_SETUP.md](./CLAUDE_DESKTOP_QUICK_SETUP.md) (recommended)
4. **Test**: Run a sample test
5. **Learn**: Read [FINAL_DELIVERY_SUMMARY.md](./FINAL_DELIVERY_SUMMARY.md)

**Total Time**: ~15-20 minutes to be fully up and running

---

## 📞 Support

- **Setup Help**: See guide for your chosen interface
- **Technical Issues**: See `MCP_IMPLEMENTATION_SUMMARY.md`
- **General Questions**: See `FINAL_DELIVERY_SUMMARY.md`

---

## ✨ What You Can Test

### Audiences (Societies):
- Startup Investors
- Tech Enthusiasts  
- Marketing Professionals
- And more...

### Content Types:
- Articles
- Website Content
- Emails
- Tweets/X Posts
- Social Media Posts

### What You Get:
- Impact Score (0-100)
- Attention Breakdown (Full/Partial/Ignore %)
- AI-Generated Insights
- Actionable Recommendations

---

**Ready to start?** Pick your interface above and follow the setup guide! 🎉

Most users should start with: [CLAUDE_DESKTOP_QUICK_SETUP.md](./CLAUDE_DESKTOP_QUICK_SETUP.md)


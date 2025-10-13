# Quick Start Guide - MCP Integration

## 🚀 In 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Cursor AI

**A. Copy the System Prompt**
1. Open file: `CURSOR_AGENT_PROMPT.txt`
2. Copy all contents
3. Open Cursor Settings → Agent → System Prompt
4. Paste the content

**B. Add MCP Server**
1. Open Cursor Settings → Features → MCP Servers
2. Click "Add MCP Server"
3. Use this configuration:

```json
{
  "name": "societies",
  "command": "node",
  "args": [
    "/Users/junaidnasir/Herd/Automation/Upwork-Projects/dan-project/src/mcp-server.js"
  ]
}
```

4. Save and restart Cursor

### Step 3: Test It!

**Ask Cursor:**
```
Run a societies test with:
- societyName: Startup Investors
- testType: Article
- testString: AI is revolutionizing the tech industry
```

**Expected Response (after ~5 minutes):**
```
The content scored 18/100 (Very Low) with Startup Investors. 
Only 4% gave full attention, while 72% ignored it. The insights 
suggest making it more relevant to investor interests and adding 
concrete data points.

{
  "ok": true,
  "inputs": {
    "societyName": "Startup Investors",
    "testType": "Article",
    "testString": "AI is revolutionizing the tech industry"
  },
  "results": {
    "impactScore": {
      "value": "18",
      "rating": "Very Low"
    },
    ...
  }
}
```

## 📝 Usage Templates

### Template 1: Article Test
```
Test this article for Startup Investors:
"Artificial intelligence is transforming how we build software. Companies using AI see 40% productivity gains."
```

### Template 2: Website Content
```
Run a societies test:
- societyName: Tech Enthusiasts
- testType: Website Content
- testString: Discover the next generation of cloud computing
```

### Template 3: Social Media Post
```
Test this tweet for Marketing Professionals:
"Just launched our new product! Revolutionary features that will change the game 🚀"
```

## 🔧 Troubleshooting

### "Tool not found"
- Restart Cursor completely
- Check that the path in config is absolute
- Verify `npm install` completed successfully

### "DNS errors"
- Already fixed in the code with hardcoded DNS mappings
- If issues persist, check `.env` file exists

### "Slow response"
- Normal: 4-5 minutes per test
- The browser automation takes time
- Be patient!

## 📚 More Information

- **Full Setup Guide**: [MCP_SETUP.md](./MCP_SETUP.md)
- **Implementation Details**: [MCP_IMPLEMENTATION_SUMMARY.md](./MCP_IMPLEMENTATION_SUMMARY.md)
- **Main README**: [README.md](./README.md)

## ✅ Verification Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] System prompt copied to Cursor
- [ ] MCP server configured in Cursor
- [ ] Cursor restarted
- [ ] Test query sent
- [ ] Results received

## 🎯 Common Use Cases

### Use Case 1: Content A/B Testing
```
Test version A: "Innovative AI solutions for modern businesses"
Test version B: "Save 40% on operational costs with AI automation"
```

### Use Case 2: Audience Comparison
```
Test "Blockchain will revolutionize finance" for:
1. Startup Investors
2. Tech Enthusiasts
3. Financial Professionals
```

### Use Case 3: Content Optimization
```
1. Test initial version
2. Review insights
3. Refine content based on feedback
4. Test refined version
5. Compare scores
```

## 💡 Pro Tips

1. **Be Specific**: More specific content gets better insights
2. **Test Variations**: Try different phrasings
3. **Match Audience**: Choose the right society for your content
4. **Read Insights**: The AI feedback is valuable for improvement
5. **Track Scores**: Keep a log of your tests to see trends

---

**Need help?** Check the full guides or run `npm run test:mcp` to verify everything works.


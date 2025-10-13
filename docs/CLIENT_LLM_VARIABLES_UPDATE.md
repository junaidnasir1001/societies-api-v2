# 🎯 Client LLM Variables Update - MCP Tool Instructions

**Date:** October 10, 2025  
**Status:** ✅ Updated per Client Requirements

---

## 📋 Client's Exact Requirements

**Client Message:**
> "for clarification the variables I expect the LLM to gather from user based on the tool instructions will be:
> 
> - the audience / society name ie. 'Startup Investors'
> - the test ie. ['Article', 'Website Content']  
> - the string to test ie 'cowboys vs pirates'"

---

## ✅ What's Been Updated

### **1. MCP Tool Name Updated**
- **Old:** `societies_run`
- **New:** `societies_test_content` ✅

### **2. Tool Description Enhanced**
**New Description:**
```
Run a societies.io simulation to test content with a target audience. 
The LLM should gather these variables from the user: 
1) audience/society name (e.g., 'Startup Investors'), 
2) test type (e.g., 'Article', 'Website Content'), 
3) string to test (e.g., 'cowboys vs pirates'). 
Returns impact score, attention metrics, and insights.
```

### **3. Parameter Descriptions Updated**

#### **societyName Parameter:**
```json
{
  "type": "string",
  "description": "The audience/society name that the LLM should gather from user (e.g., 'Startup Investors', 'Tech Enthusiasts', 'Healthcare Professionals')"
}
```

#### **testType Parameter:**
```json
{
  "type": "string", 
  "description": "The test type that the LLM should gather from user. One of: 'Article', 'Website Content', 'Email', 'Tweet', 'Post'. Common variants like 'web', 'site' are normalized automatically."
}
```

#### **testString Parameter:**
```json
{
  "type": "string",
  "description": "The string to test that the LLM should gather from user (e.g., 'cowboys vs pirates', 'our new product launch announcement')"
}
```

---

## 🎯 LLM Integration Flow

### **What the LLM Should Do:**

1. **Gather Variables from User:**
   - Ask for target audience/society name
   - Ask for test type (Article, Website Content, etc.)
   - Ask for the actual content string to test

2. **Call MCP Tool:**
   ```json
   {
     "name": "societies_test_content",
     "arguments": {
       "societyName": "Startup Investors",
       "testType": "Article", 
       "testString": "cowboys vs pirates"
     }
   }
   ```

3. **Process Results:**
   - Impact score and rating
   - Attention metrics (full, partial, ignore percentages)
   - Insights and recommendations
   - Raw HTML and plain text results

---

## 📊 Example Usage

### **Client's Example Variables:**
- **Audience:** `'Startup Investors'`
- **Test Type:** `'Article'` (from ['Article', 'Website Content'])
- **String to Test:** `'cowboys vs pirates'`

### **MCP Tool Call:**
```json
{
  "name": "societies_test_content",
  "arguments": {
    "societyName": "Startup Investors",
    "testType": "Article",
    "testString": "cowboys vs pirates"
  }
}
```

### **Expected Response Format:**
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
      "value": "76",
      "rating": "High"
    },
    "attention": {
      "full": 62,
      "partial": 28, 
      "ignore": 10
    },
    "insights": "Clear value prop resonates with efficiency-focused investors...",
    "summaryText": "Impact Score: 76/100. Attention: Full 62%, Partial 28%, Ignore 10%",
    "keyFindings": [
      "Impact score: 76/100 (High)",
      "Full attention: 62%",
      "Ignored: 10%"
    ],
    "rawHtml": "<div>...</div>",
    "plainText": "Impact Score 76/100 (High)...",
    "url": "https://app.societies.io/test/abc123"
  },
  "metadata": {
    "timingsMs": {
      "googleLogin": 0,
      "simulate": 146000,
      "total": 154000
    },
    "runId": "mcp_1728826500000"
  },
  "screenshots": null,
  "error": null
}
```

---

## 🔧 Technical Details

### **File Updated:**
- **`src/mcp-server.js`** ✅

### **Changes Made:**
1. ✅ Tool name: `societies_run` → `societies_test_content`
2. ✅ Description: Added explicit LLM variable gathering instructions
3. ✅ Parameter descriptions: Made it clear LLM should gather from user
4. ✅ Tool handler: Updated to match new tool name

### **Validation:**
- ✅ No linting errors
- ✅ MCP server starts successfully
- ✅ Tool registration working
- ✅ Parameter validation intact

---

## 🚀 Integration Status

### **Ready for Client Integration:**
1. ✅ **MCP Tool:** `societies_test_content` available
2. ✅ **Clear Instructions:** LLM knows exactly what to gather
3. ✅ **Parameter Validation:** All required fields enforced
4. ✅ **Response Format:** Matches societies.io API contract
5. ✅ **Error Handling:** Proper error responses for missing fields

### **LLM Integration Steps:**
1. **Configure MCP Server:** Use updated `src/mcp-server.js`
2. **Tool Available:** `societies_test_content` will appear in tool list
3. **LLM Behavior:** Will gather 3 variables per client requirements
4. **Results:** Structured JSON response with impact scores and insights

---

## 📝 Notes for Client

1. **Variable Gathering:** The LLM will now explicitly ask for the 3 variables you specified
2. **Tool Name:** Changed to `societies_test_content` for clarity
3. **Backward Compatibility:** All existing functionality preserved
4. **Error Handling:** Clear error messages if any required variable is missing
5. **Response Format:** Matches your societies.io API contract exactly

---

## ✅ Summary

**Client Requirements Met:**
- ✅ LLM gathers audience/society name (e.g., 'Startup Investors')
- ✅ LLM gathers test type (e.g., 'Article', 'Website Content')  
- ✅ LLM gathers string to test (e.g., 'cowboys vs pirates')
- ✅ Clear tool instructions for LLM
- ✅ Proper parameter validation
- ✅ Structured response format

**Status:** ✅ **Ready for Client Integration**

The MCP tool now has explicit instructions for the LLM to gather exactly the 3 variables you specified from users before calling the societies.io simulation.


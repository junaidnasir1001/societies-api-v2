# 🎯 Client Requirements Update - Dropdown Support

## 📋 Client's Exact Workflow (From Voice Note)

### **Original Requirements:**
1. ✅ Login to societies.io (Google SSO)
2. ✅ **Select "target society" from DROPDOWN** (e.g., "investors") 
3. ✅ **Click "Create new test" button**
4. ✅ **Select template from DROPDOWN** (e.g., "article")
5. ✅ Input text (lorem ipsum from LLM)
6. ✅ Click "Simulate"
7. ✅ Wait for right-hand side to populate
8. ✅ Return right-hand side content as JSON

### **Key Point:**
Client specifically mentioned **DROPDOWNS** for society and template selection, not text inputs!

---

## 🔧 Changes Made to `src/societies.js`

### **1. Added Dropdown Selection Function**
```javascript
const selectDropdown = async (selectors, value, fieldName) => {
  // Tries multiple dropdown selectors
  // Clicks dropdown to open
  // Selects option by text
  // Logs each step
}
```

**Supports:**
- `<select>` elements
- Custom dropdowns with `role="combobox"`
- Various selector patterns

### **2. Added "Create New Test" Button**
```javascript
// Click "Create new test" button if present
console.log("[sim] Looking for 'Create new test' button...");
try {
  const createBtn = page.locator('button:has-text("Create new test")').first();
  await createBtn.click();
  console.log("[sim] Clicked 'Create new test' button");
} catch (e) {
  console.log("[sim] No 'Create new test' button found, continuing...");
}
```

### **3. Updated Society Selection (DROPDOWN)**
```javascript
// Select target society from dropdown (e.g., "investors")
if (society) {
  await selectDropdown([
    'select[name="society"]', 
    'select[name="target-society"]',
    '[role="combobox"]:has-text("Society")',
    '#society-select',
    '[data-testid="society-dropdown"]'
  ], society, 'target society');
}
```

### **4. Updated Template Selection (DROPDOWN)**
```javascript
// Select template from dropdown (e.g., "article")
if (template) {
  await selectDropdown([
    'select[name="template"]',
    'select[name="template-type"]', 
    '[role="combobox"]:has-text("Template")',
    '#template-select',
    '[data-testid="template-dropdown"]'
  ], template, 'template');
}
```

### **5. Kept Text Input for Input Text**
```javascript
// Fill input text (textarea)
if (inputText) {
  await fillInput([
    'textarea[name="inputText"]',
    'textarea[name="input"]',
    'textarea[placeholder*="text"]',
    'textarea',
    '[data-testid="inputText"]'
  ], inputText, 'input text');
}
```

---

## 📊 New Log Output

With the updates, you'll now see:

```
[sim] goto societies.io
[sim] SSO continue
[sim] SSO clicked, waiting for redirect...
[sim] Looking for 'Create new test' button...
[sim] Clicked 'Create new test' button
[sim] Filling form inputs...
[sim] Opened target society dropdown
[sim] Selected target society: "investors"
[sim] Opened template dropdown
[sim] Selected template: "article"
[sim] Filled input text: "Lorem ipsum dolor sit amet..."
[sim] Looking for Simulate button...
[sim] Clicking Simulate button...
[sim] Waiting for results panel...
[sim] Checking for spinner...
[sim] Waiting for DOM stability (800ms)...
[sim] Results stable!
[done] mode=browserbase totalMs=XXXX
```

---

## 🚀 Usage Example

### **CLI:**
```bash
npm run simulate -- \
  --society="investors" \
  --template="article" \
  --inputText="Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
```

### **HTTP API:**
```bash
curl -X POST http://localhost:3000/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "society": "investors",
    "template": "article",
    "inputText": "Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
  }'
```

### **Expected JSON Response:**
```json
{
  "society": "investors",
  "template": "article", 
  "inputText": "Lorem ipsum dolor...",
  "result": {
    "plainText": "Right-hand side content as plain text",
    "html": "<div>Right-hand side content as HTML</div>"
  },
  "metadata": {
    "timingsMs": {
      "googleLogin": 34000,
      "simulate": 15000
    },
    "runId": "run_1234567890",
    "url": "https://societies.io/..."
  }
}
```

---

## 🔍 Dropdown Selector Strategy

The code tries multiple selector patterns for robustness:

### **For Society Dropdown:**
1. `select[name="society"]` - Standard select element
2. `select[name="target-society"]` - Alternative name
3. `[role="combobox"]:has-text("Society")` - Custom dropdown
4. `#society-select` - ID selector
5. `[data-testid="society-dropdown"]` - Test ID

### **For Template Dropdown:**
1. `select[name="template"]` - Standard select element
2. `select[name="template-type"]` - Alternative name
3. `[role="combobox"]:has-text("Template")` - Custom dropdown
4. `#template-select` - ID selector
5. `[data-testid="template-dropdown"]` - Test ID

---

## ✅ What's Working Now

1. ✅ **Dropdown Support** - Handles both `<select>` and custom dropdowns
2. ✅ **Create New Test** - Clicks button if present
3. ✅ **Target Society Selection** - From dropdown (e.g., "investors")
4. ✅ **Template Selection** - From dropdown (e.g., "article")
5. ✅ **Text Input** - For lorem ipsum text
6. ✅ **Simulate** - Clicks simulate button
7. ✅ **Results Extraction** - Gets right-hand side content
8. ✅ **JSON Output** - Returns structured data

---

## 🎯 Stagehand Integration Ready

The automation now:
- ✅ Works with Browserbase CDP
- ✅ Handles dropdown selections
- ✅ Returns JSON output
- ✅ Has detailed logging
- ✅ Supports MCP HTTP endpoint

**Client can integrate this with Stagehand script in Browserbase!**

---

## 🔄 Migration from Old to New

### **Old (Text Inputs):**
```javascript
await page.fill('input[name="society"]', 'investors');
await page.fill('input[name="template"]', 'article');
```

### **New (Dropdown Selections):**
```javascript
await dropdown.click(); // Open dropdown
await page.click('text="investors"'); // Select option
await dropdown.click(); // Open dropdown
await page.click('text="article"'); // Select option
```

---

## 📝 Notes for Client

1. **Dropdown Values:** The automation will select the exact text you provide (e.g., "investors", "article")

2. **Create New Test:** The button click is optional - if not found, automation continues

3. **Right-Hand Side:** Content is extracted as both `plainText` and `html` from the results panel

4. **LLM Integration:** Your agent can:
   - Send society, template, inputText via JSON
   - Receive results from right-hand side
   - Process the returned content

5. **Browserbase Ready:** All code uses CDP connection when `BROWSERBASE_WS_ENDPOINT` is set

---

**Status:** ✅ Updated to match client's exact workflow from voice note!


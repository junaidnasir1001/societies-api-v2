# Expected Output Format

## Screenshot Analysis

Based on the societies.io interface, the automation extracts data from the **RIGHT PANEL** (results section) after simulation completes.

### What Gets Extracted:

#### 1. Impact Score
- **Value**: Numeric score (e.g., 4)
- **Max**: Maximum score (e.g., 100)
- **Rating**: Text rating (e.g., "Very Low", "Low", "Medium", "High", "Very High")
- **Raw**: Original text (e.g., "4/100")

#### 2. Attention Metrics
- **Full**: Percentage who gave full attention (e.g., 1%)
- **Partial**: Percentage who partially engaged (e.g., 9%)
- **Ignore**: Percentage who ignored (e.g., 90%)
- **Raw**: Original text for each metric

#### 3. Insights
Full text analysis from the insights section, including:
- Overall reception feedback
- Audience behavior analysis
- Specific recommendations
- Any other text content in the insights area

#### 4. Complete Data
- **HTML**: Full HTML of the results panel
- **Plain Text**: Full text content of the results panel

---

## Example JSON Output

```json
{
  "society": "Startup Investors",
  "template": "Article",
  "inputText": "testing",
  "result": {
    "impactScore": {
      "value": 4,
      "max": 100,
      "rating": "Very Low",
      "raw": "4/100"
    },
    "attention": {
      "full": 1,
      "partial": 9,
      "ignore": 90,
      "raw": {
        "full": "Full 1%",
        "partial": "Partial 9%",
        "ignore": "Ignore 90%"
      }
    },
    "insights": "Overall, the article \"testing\" was not well-received by your target audience.\n\nThe overwhelming majority quickly skimmed or ignored the content, seeking more substance.\n\nThe title \"testing\" is too vague; a specific title is needed to grab attention.",
    "html": "<div class=\"results-panel\">...</div>",
    "plainText": "Impact Score\nVery Low\n4/100\n\nAttention\nFull 1%\nPartial 9%\nIgnore 90%\n\nInsights\nOverall, the article \"testing\" was not well-received..."
  },
  "metadata": {
    "timingsMs": {
      "googleLogin": 0,
      "simulate": 45230
    },
    "runId": "run_1234567890",
    "url": "https://societies.io",
    "ms": 45230
  }
}
```

---

## Usage

### CLI
```bash
npm run simulate -- \
  --society="Startup Investors" \
  --template="Article" \
  --inputText="Your content here"
```

### HTTP API
```bash
curl -X POST http://localhost:3000/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "society": "Startup Investors",
    "template": "Article",
    "inputText": "Your content here"
  }'
```

---

## Key Features

✅ **Structured Data**: Impact score and attention metrics as numbers (not strings)  
✅ **Insights Text**: Full analysis and recommendations  
✅ **Raw Data**: Original HTML and text for custom parsing  
✅ **Metadata**: Timings, URL, run ID for tracking  
✅ **Validation**: Ajv JSON schema ensures data integrity  

---

## What the Screenshot Shows

The automation will extract from the **right panel**:
- ✅ Impact Score box (red background, showing "Very Low 4/100")
- ✅ Attention metrics (Full, Partial, Ignore percentages)
- ✅ Insights section (text analysis and recommendations)
- ✅ Any additional content in the results area

The **left panel** (society selector, create test button) is for INPUT.  
The **center panel** (visualization) is not extracted (visual only).  
The **right panel** is the OUTPUT that gets returned as JSON.


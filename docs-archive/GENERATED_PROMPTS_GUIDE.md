# Generated User Prompts - When They're Empty

## 🎯 What Are "Generated User Prompts"?

These are AI-generated questions across three user intent stages:
- **Awareness** (Discovery) - Real-world, factual discovery questions
- **Consideration** (Comparison) - Fresh comparisons & market conditions
- **Conversion** (Action) - Decision-critical, time-sensitive information

---

## 🔍 When They'll Be Empty

### Scenario 1: No Azure OpenAI Key ❌

**Condition:**
```bash
# In backend/.env
AZURE_OPENAI_KEY=   # Not set or empty
```

**Result:**
```javascript
prompts: {
  summary: 'AI prompt generation not available (no Azure OpenAI key)',
  awareness: [],
  consideration: [],
  conversion: []
}
```

**Frontend Display:**
- ❌ "Generated User Prompts" section is **completely hidden**
- Only shows if `analysis.prompts` exists and has content

**Fix:**
```bash
# Add to backend/.env
AZURE_OPENAI_KEY=your-azure-openai-key-here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
```

---

### Scenario 2: Content Doesn't Match Intent Type ❌

**Condition:**
The page content doesn't address a particular funnel stage.

**Example:**
```
Page: Generic company "About Us" page with no actionable content
```

**AI Response:**
```
Awareness: Not Found
Consideration: Not Found  
Conversion: Not Found
```

**Result:**
```javascript
prompts: {
  summary: "This is an About Us page...",
  awareness: [],      // Empty - no discovery questions
  consideration: [],  // Empty - no comparison questions
  conversion: []      // Empty - no action questions
}
```

**Frontend Display:**
- ✅ Summary shows
- ❌ No Awareness section (empty array)
- ❌ No Consideration section (empty array)
- ❌ No Conversion section (empty array)

---

### Scenario 3: Parsing Error ❌

**Condition:**
The AI returns malformed text that can't be parsed.

**Code Reference:**
```javascript
// backend/services/hybridContentAnalyzer.js
function parsePromptResponse(llmResponse) {
  // Tries to extract:
  // - Summary from "Summary: ..." section
  // - Questions from "Awareness", "Consideration", "Conversion" sections
  
  // If parsing fails, returns empty arrays
}
```

**Result:**
```javascript
prompts: {
  summary: '',
  awareness: [],
  consideration: [],
  conversion: []
}
```

---

### Scenario 4: API Error or Timeout ❌

**Conditions:**
- Azure OpenAI API is down
- Network timeout
- Rate limit exceeded
- Invalid API key

**Result:**
```javascript
prompts: {
  summary: 'Error generating prompts: API timeout',
  awareness: [],
  consideration: [],
  conversion: []
}
```

**Backend Logs:**
```
[hybrid-analyzer] error: Prompt generation error {"error":"API timeout"}
```

---

### Scenario 5: Content Too Short ⚠️

**Condition:**
Page has very little text content (< 100 words).

**What Happens:**
- AI may not find enough content to generate meaningful questions
- Returns "Not Found" for all funnels

**Result:**
```javascript
prompts: {
  summary: "This page has minimal content...",
  awareness: [],
  consideration: [],
  conversion: []
}
```

---

## ✅ When They'll Show Up

### Perfect Scenario ✅

**Conditions:**
1. ✅ Azure OpenAI key is configured
2. ✅ Page has substantial content (500+ words)
3. ✅ Content addresses user questions
4. ✅ API call succeeds
5. ✅ Response parses correctly

**Result:**
```javascript
prompts: {
  summary: "This page provides comprehensive product information...",
  awareness: [
    {
      question: "What are the latest modular couch cover options?",
      support: "Page discusses current 2025 collection..."
    }
  ],
  consideration: [
    {
      question: "How do modular covers compare to traditional slipcovers?",
      support: "Page explains differences in customization..."
    }
  ],
  conversion: [
    {
      question: "How much does a custom sectional cover cost?",
      support: "Page shows pricing starting at..."
    }
  ]
}
```

**Frontend Display:**
```
Generated User Prompts
├─ 📘 Awareness (Discovery)
│  └─ "What are the latest modular couch cover options?"
│     Based on: Page discusses current 2025 collection...
│
├─ 📗 Consideration (Comparison)  
│  └─ "How do modular covers compare to traditional slipcovers?"
│     Based on: Page explains differences...
│
└─ 📙 Conversion (Action)
   └─ "How much does a custom sectional cover cost?"
      Based on: Page shows pricing...
```

---

## 🔧 How to Debug Empty Prompts

### Step 1: Check Backend Logs

Look for these messages:

```bash
# SUCCESS - Prompts generated
[hybrid-analyzer] debug: Prompts generated {"url":"...","hasSummary":true,"awarenessCount":2,"considerationCount":2,"conversionCount":2}

# FAILURE - No API key
[hybrid-analyzer] warn: Prompt generation skipped (no Azure OpenAI key)

# FAILURE - API error
[hybrid-analyzer] error: Prompt generation error {"error":"..."}
```

### Step 2: Check Environment Variables

```bash
# In backend directory
cd backend

# Windows
type .env | findstr AZURE_OPENAI

# Should show:
AZURE_OPENAI_KEY=sk-...
AZURE_OPENAI_ENDPOINT=https://...
```

### Step 3: Check Browser Console

```javascript
// Open DevTools (F12) → Console
// Look for the analysis object
console.log(urlData.contentAnalysis.prompts)

// Should show:
{
  summary: "...",
  awareness: [...],
  consideration: [...],
  conversion: [...]
}

// If empty arrays, check why
```

### Step 4: Test Manually

```bash
# Test Azure OpenAI connection
curl -X POST https://your-resource.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-01 \
  -H "Content-Type: application/json" \
  -H "api-key: YOUR_KEY" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

---

## 📊 Common Cases

| Page Type | Awareness | Consideration | Conversion | Why |
|-----------|-----------|---------------|------------|-----|
| Product Page | ✅ | ✅ | ✅ | Has all info |
| Blog Post | ✅ | ✅ | ❌ | No pricing/action |
| About Us | ❌ | ❌ | ❌ | Generic info |
| Pricing Page | ⚠️ | ✅ | ✅ | Focused on buying |
| FAQ Page | ✅ | ✅ | ⚠️ | Q&A format |
| Contact Us | ❌ | ❌ | ❌ | Just contact info |
| Tutorial | ✅ | ✅ | ✅ | Educational + actionable |

---

## 💡 Expected Behavior

### On Frontend

The "Generated User Prompts" section will:

1. **Show if `analysis.prompts` exists** (even if arrays are empty)
2. **Hide individual sections** if their arrays are empty:
   ```jsx
   {analysis.prompts.awareness?.length > 0 && (
     <PromptSection ... />  // Only shows if array has items
   )}
   ```
3. **Show summary** even if questions are empty
4. **Show helpful fallback message** if all arrays are empty ✨ NEW

### Result for User

**If all arrays empty (with fallback message):**
```
Content Summary
└─ "This page provides basic company information..."

Generated User Prompts
└─ ℹ️ No User Prompts Generated
   
   📄 Content doesn't match user intent patterns
   
   This page doesn't contain content that answers typical user questions in these categories:
   • Awareness: "What are...?" "How does X work?"
   • Consideration: "How do A and B compare?" "What are the pros/cons?"
   • Conversion: "How much does X cost?" "How do I buy/implement X?"
   
   Common for: Catalog landing pages, contact forms, about pages, login pages,
   or pages with minimal text content (<100 words).
   
   💡 Tip: Try analyzing product pages, tutorials, blog posts, or FAQ pages for better results.
```

**If Azure OpenAI not configured:**
```
Generated User Prompts
└─ ℹ️ No User Prompts Generated
   
   ⚙️ Azure OpenAI is not configured
   
   Prompt generation requires Azure OpenAI API access.
   Configure AZURE_OPENAI_KEY in your backend .env file to enable this feature.
```

**If some arrays have content:**
```
Content Summary
└─ "This page provides product information..."

Generated User Prompts
├─ 📘 Awareness (2 questions)
└─ 📗 Consideration (1 question)

(No Conversion section - array was empty)
```

---

## 🚀 How to Ensure Prompts Are Generated

### 1. **Configure Azure OpenAI** ✅

```bash
# In backend/.env
AZURE_OPENAI_KEY=your-key-here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_COMPLETION_DEPLOYMENT=gpt-4o
AZURE_API_VERSION=2024-02-01
```

### 2. **Analyze Content-Rich Pages** ✅

Best results with pages that have:
- ✅ 500+ words of content
- ✅ Clear headings and structure
- ✅ Product information or services
- ✅ Pricing or features
- ✅ User-focused content

### 3. **Check Backend Health** ✅

Visit: http://localhost:3000/api/health

Should show:
```json
{
  "status": "ok",
  "azureOpenAI": "configured",
  "browserPool": { "available": 2 }
}
```

### 4. **Monitor Backend Logs** ✅

Watch for:
```
✅ [hybrid-analyzer] debug: Generating AI prompts
✅ [hybrid-analyzer] debug: Prompts generated {... awarenessCount:2 ...}
```

---

## 🎯 Summary

**Generated User Prompts will be EMPTY when:**

1. ❌ No Azure OpenAI key configured
2. ❌ Page content doesn't match intent types (Awareness/Consideration/Conversion)
3. ❌ Content is too short or generic
4. ❌ API error or timeout
5. ❌ Parsing error in backend

**Generated User Prompts will SHOW when:**

1. ✅ Azure OpenAI key is configured
2. ✅ Page has substantial, relevant content
3. ✅ Content addresses user questions/needs
4. ✅ API call succeeds
5. ✅ Response parses correctly

**To guarantee prompts, ensure:**
- ✅ Configure Azure OpenAI credentials in `backend/.env`
- ✅ Analyze content-rich pages (products, tutorials, guides)
- ✅ Check backend logs for errors
- ✅ Verify API connection works

---

## 🔧 Quick Fix

**If prompts are always empty:**

```bash
# 1. Check if key is set
cd backend
type .env | findstr AZURE

# 2. If missing, add it
echo AZURE_OPENAI_KEY=your-key >> .env
echo AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/ >> .env

# 3. Restart backend
# Close backend terminal, then:
npm run dev

# 4. Test with a content-rich page
# Analyze a product page or blog post (not "About Us" or "Contact")
```

---

**In summary:** The prompts are AI-generated based on page content. If the page doesn't have content that matches user intent stages (Awareness/Consideration/Conversion), or if Azure OpenAI isn't configured, the section will be empty. This is expected behavior for certain page types!


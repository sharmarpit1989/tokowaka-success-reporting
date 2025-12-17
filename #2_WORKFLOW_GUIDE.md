# AI Visibility Dashboard - Workflow Guide

## 📖 Overview

This guide provides a complete visual walkthrough of how the AI Visibility Dashboard works, from initial setup to actionable insights. The dashboard combines **content optimization analysis** with **citation performance tracking** in a unified web platform.

---

## 🎯 High-Level Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                     AI VISIBILITY DASHBOARD                      │
│                         Complete Workflow                         │
└─────────────────────────────────────────────────────────────────┘

Step 1: Project Setup (Upload URLs)
   ↓
Step 2: Upload Brand Presence Data (Citations)
   ↓
Step 3: Content Analysis (Batch or Individual)
   ↓
Step 4: Generate AI Insights
   ↓
Step 5: View Analytics & Reports
   ├──→ AI Visibility Dashboard
   ├──→ Citation Performance
   └──→ Trends & Insights (Content Opportunities)
   ↓
Step 6: Optimize & Iterate
```

---

## 📋 Detailed Workflow

### Step 1: Project Setup & URL Upload

**What happens:**
- Create a new project by uploading a URL file
- System extracts and validates URLs
- Project automatically created with URLs

**File format (CSV or Excel):**
```csv
url
https://lovesac.com/sactionals
https://lovesac.com/products/best-seller
https://lovesac.com/designed-for-life
...
```

**Supported column names:** url, urls, link, or links

**User actions:**
```
┌─────────────────────────────────────┐
│  1. Navigate to AI Visibility page  │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  2. Enter your domain name          │
│     Example: lovesac.com            │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  3. Upload URL file (CSV/Excel)     │
│     - Drag & drop OR click to browse│
│     - File parsed automatically     │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  4. System validates & creates      │
│     - Extracts URLs from file       │
│     - Validates format              │
│     - Removes duplicates            │
│     - Creates project               │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  ✅ Project created with URLs       │
│     Project ID: abc-123-def         │
│     Count: 15 URLs                  │
│     Status: "ready_for_citations"   │
│     Auto-saved to browser storage   │
└─────────────────────────────────────┘
```

**Backend process:**
```javascript
// Creates unified-{projectId}.json
{
  "id": "abc-123-def",
  "domain": "lovesac.com",
  "status": "ready_for_citations",
  "urls": [
    "https://lovesac.com/sactionals",
    "https://lovesac.com/products/best-seller",
    // ... more URLs (typically 10-50)
  ],
  "createdAt": "2025-12-17T10:00:00Z",
  "urlCount": 15
}
```

---

### Step 2: Upload Brand Presence Data

**What happens:**
- Upload one or multiple Excel files with AI citation data (up to 50 files)
- System processes all files and combines data
- Calculates citation rates per URL, platform, and week

**File format (Excel only - .xlsx or .xls):**
```
| Week | Platform      | Prompt              | URL | sources                          |
|------|---------------|---------------------|-----|----------------------------------|
| w48  | chatgpt-paid  | best modular sofas  |     | https://lovesac.com/sactionals   |
| w48  | perplexity    | furniture reviews   |     | https://lovesac.com/products/... |
| w49  | claude        | home furniture      |     | https://lovesac.com/designed...  |
```

**Important:** The tool looks for target URLs in the **"sources"** column, not the "URL" column.

**Multi-file support:** You can upload multiple Excel files at once (e.g., separate files per week, platform, or AI mode). The system automatically combines and processes all data.

**User actions:**
```
┌──────────────────────────────────────────┐
│  1. Click "Upload Brand Presence Data"   │
│     (Appears after URLs are loaded)      │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  2. Select Excel file(s) (.xlsx/.xls)   │
│     Can upload up to 50 files at once   │
│                                           │
│     Required columns:                    │
│     - Week (e.g., "w48", "w49")          │
│     - Platform (e.g., "chatgpt-paid")    │
│     - Prompt (user's query)              │
│     - sources (URLs cited by AI)         │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  3. System processes file(s)             │
│     - Uploads all files to backend       │
│     - Generates unique jobId             │
│     - Returns immediately (async)        │
└──────────────┬───────────────────────────┘
               ↓
      ┌────────┴────────┐
      ↓                 ↓
┌──────────┐    ┌──────────────┐
│ Parsing  │    │  Validation  │
│ Excel    │    │  - Columns   │
│ Files    │    │  - Format    │
│ (all)    │    │  - Combining │
└────┬─────┘    └──────┬───────┘
     ↓                 ↓
┌─────────────────────────────────────┐
│  4. Citation rate calculation       │
│     For each URL × Week × Platform: │
│     - Count unique prompts          │
│     - Count prompts with citation   │
│     - Calculate: cited/total × 100  │
│     - Generate trend data           │
└──────────────┬──────────────────────┘
               ↓
┌──────────────────────────────────────┐
│  5. Save citation data               │
│     Creates: {jobId}-citations.json  │
│     Links to project via jobId       │
└──────────────┬──────────────────────┘
               ↓
┌──────────────────────────────────────┐
│  ✅ Brand presence data processed    │
│     Dashboard refreshes automatically│
│     Citation rates visible           │
│     Status: "completed"              │
└──────────────────────────────────────┘
```

**Citation Rate Calculation Logic:**
```
For each URL in each week/platform combination:

Step 1: Get all prompts for that week/platform
Example: 100 unique prompts in w48 for chatgpt-paid

Step 2: Find prompts that cited this URL
Look in "sources" column for URL matches
Example: 15 prompts cited https://lovesac.com/sactionals

Step 3: Calculate rate
Citation Rate = 15/100 = 15%

This repeats for:
- Each URL (15 URLs)
- Each week (w48, w49, w50...)
- Each platform (chatgpt-paid, perplexity, claude...)
```

**Backend process:**
```javascript
// Creates {jobId}-citations.json
{
  "domain": "lovesac.com",
  "targetUrls": [
    "https://lovesac.com/sactionals",
    "https://lovesac.com/products/best-seller",
    // ... all tracked URLs
  ],
  "citationRates": [
    {
      "week": "w48",
      "platform": "chatgpt-paid",
      "url": "https://lovesac.com/sactionals",
      "totalPrompts": 100,
      "citedPrompts": 15,
      "selectedUrlRate": 0.15,  // 15%
      "type": "url_specific"
    },
    {
      "week": "w48",
      "platform": "chatgpt-paid",
      "totalPrompts": 500,
      "citedPrompts": 87,
      "domainRate": 0.174,  // 17.4%
      "type": "summary"
    },
    // ... more entries for all weeks/platforms/URLs
  ],
  "combinedData": [
    // Raw prompt data from all Excel files combined
    { week: "w48", platform: "chatgpt-paid", prompt: "...", sources: "..." },
    // ... 1000+ rows
  ],
  "status": "completed",
  "processedAt": "2025-12-17T10:15:00Z",
  "fileCount": 5  // Number of Excel files processed
}
```

**Status flow:**
```
pending
   ↓
ready_for_citations
   ↓
processing_citations
   ↓
completed ✅
```

---

### Step 3: Content Analysis

**What happens:**
- System scrapes target URLs (individually or in batch)
- Analyzes content using LLM Presence Tracker
- Calculates 6 key scores per URL
- Generates AI-recommended prompts per page

**Two analysis modes:**

#### Mode A: Individual URL Analysis
```
┌──────────────────────────────────────┐
│  1. Click "Analyze" button           │
│     (Next to any URL in dashboard)   │
└──────────────┬───────────────────────┘
               ↓
┌──────────────────────────────────────┐
│  2. Real-time progress updates       │
│     - Loading page...                │
│     - Analyzing content...           │
│     - Calculating scores...          │
│     Progress: 33% → 66% → 100%      │
└──────────────┬───────────────────────┘
               ↓
┌──────────────────────────────────────┐
│  3. Analysis completes (~5-8s)       │
│     Results appear immediately       │
└──────────────┬───────────────────────┘
               ↓
┌──────────────────────────────────────┐
│  ✅ Scores visible & expanded        │
│     LLM Presence: 68%                │
│     6 metric scores displayed        │
└──────────────────────────────────────┘
```

#### Mode B: Batch Analysis
```
┌──────────────────────────────────────┐
│  1. Select multiple URLs (checkboxes)│
│     - Click checkboxes next to URLs  │
│     - "Select All" option available  │
└──────────────┬───────────────────────┘
               ↓
┌──────────────────────────────────────┐
│  2. Click "Analyze Selected (5)"     │
│     Configure batch settings:        │
│     - Delay between analyses: 5s     │
│     - Sequential processing          │
└──────────────┬───────────────────────┘
               ↓
┌──────────────────────────────────────┐
│  3. Batch processing starts          │
│     Progress: 1/5 → 2/5 → 3/5...    │
│     Each URL analyzed sequentially   │
│     Current: analyzing URL #2...     │
└──────────────┬───────────────────────┘
               ↓
┌──────────────────────────────────────┐
│  4. Completion notification          │
│     "✅ 5 URLs analyzed successfully" │
│     Toast notification appears       │
└──────────────┬───────────────────────┘
               ↓
┌──────────────────────────────────────┐
│  ✅ All selected URLs analyzed       │
│     Dashboard updated with scores    │
│     Can now generate insights        │
└──────────────────────────────────────┘
```

**Backend content analysis flow:**
```
┌───────────────────────────────────────┐
│  Backend: hybridContentAnalyzer.js    │
└───────────────┬───────────────────────┘
                ↓
┌───────────────────────────────────────┐
│  Step 1: Scrape URL with Puppeteer   │
│  - Load page in headless browser     │
│  - Wait for JavaScript to render     │
│  - Extract HTML content              │
└───────────────┬───────────────────────┘
                ↓
┌───────────────────────────────────────┐
│  Step 2: Page Type Classification    │
│  - Analyze content patterns          │
│  - Detect: Product, Blog, Guide, etc │
│  - Confidence: High/Medium/Low       │
└───────────────┬───────────────────────┘
                ↓
┌───────────────────────────────────────┐
│  Step 3: LLM Presence Analysis       │
│  Calls external tool:                │
│  llm-presence-tracker/main.js        │
│                                       │
│  Calculates 6 scores:                │
│  ├─ Freshness (20% weight)           │
│  ├─ Answerability (25% weight)       │
│  ├─ Query Alignment (15% weight)     │
│  ├─ Snippet Quality (15% weight)     │
│  ├─ Authority (15% weight)           │
│  └─ Structure (10% weight)           │
│                                       │
│  Overall Score = Weighted Average    │
└───────────────┬───────────────────────┘
                ↓
┌───────────────────────────────────────┐
│  Step 4: Content Extraction           │
│  - Extract main text (using Cheerio) │
│  - Remove navigation, footer, etc    │
│  - Smart extraction: 500+ chars      │
└───────────────┬───────────────────────┘
                ↓
┌───────────────────────────────────────┐
│  Step 5: AI Prompt Generation         │
│  Uses Azure OpenAI to generate:      │
│  - Summary of page content           │
│  - Awareness questions (3-5)         │
│  - Consideration questions (3-5)     │
│  - Conversion questions (3-5)        │
└───────────────┬───────────────────────┘
                ↓
┌───────────────────────────────────────┐
│  Step 6: Save Results                 │
│  Creates: {jobId}.json                │
│  Contains:                            │
│  - All scores and details             │
│  - AI prompts                         │
│  - Page metadata                      │
│  - Context for insights               │
└───────────────┬───────────────────────┘
                ↓
┌───────────────────────────────────────┐
│  ✅ Analysis Complete                 │
│     Status: "completed"               │
│     Dashboard cache invalidated       │
└───────────────────────────────────────┘
```

**Data structure saved:**
```javascript
// Saved to data/results/{jobId}.json
{
  "results": [
    {
      "url": "https://lovesac.com/sactionals",
      "title": "Sactionals - Modular Sectional Sofa",
      "llmPresence": {
        "overallScore": 0.68,      // 68%
        "rating": "Good",
        "pageType": "Product Page",
        "freshness": 0.75,          // 75%
        "answerability": 0.62,      // 62%
        "queryAlignment": 0.58,     // 58%
        "authority": 0.70,          // 70%
        "structure": 0.65,          // 65%
        "snippetQuality": 0.72      // 72%
      },
      "details": {
        "freshness": {
          "hasCurrentYear": true,
          "currentYearMatches": 8,
          "freshnessKeywordCount": 12,
          "hasPricing": true
        },
        "answerability": {
          "h1Count": 1,
          "h2Count": 5,
          "listCount": 3,
          "hasQuestions": true,
          "hasFAQ": false
        },
        // ... more details
      },
      "prompts": {
        "summary": "Page describes modular...",
        "awareness": [
          "What is a Sactional sofa?",
          "How does modular furniture work?",
          // ... more questions
        ],
        "consideration": [
          "What are the benefits of Sactionals?",
          "How much does a Sactional cost?",
          // ... more questions
        ],
        "conversion": [
          "Where can I buy Sactionals?",
          "What Sactional configurations are available?",
          // ... more questions
        ]
      },
      "wordCount": 1248,
      "hasAIInsights": false  // Not yet generated
    }
  ]
}
```

---

### Step 4: Generate AI Insights

**What happens:**
- Uses Azure OpenAI to generate personalized recommendations
- Three types of AI insights available
- Tailored to specific context and data

**Three types of AI recommendations:**

#### Type A: Per-URL Insights (AI Visibility Dashboard)
```
┌────────────────────────────────────────┐
│  1. Expand analyzed URL row            │
│     Click "Generate AI Insights"       │
└──────────────┬─────────────────────────┘
               ↓
┌────────────────────────────────────────┐
│  2. Azure OpenAI analyzes URL          │
│     Input: LLM scores + page content   │
│     Model: GPT-4o                      │
└──────────────┬─────────────────────────┘
               ↓
┌────────────────────────────────────────┐
│  3. Generates 5 URL-specific actions   │
│     Focus: Weakest metrics             │
│     - Add FAQ section → +12% answer.   │
│     - Update dates → +8% freshness     │
│     - Add structured data → +6% struct │
└──────────────┬─────────────────────────┘
               ↓
┌────────────────────────────────────────┐
│  ✅ Insights shown in expanded row     │
│     Cached per URL (instant on reload) │
└────────────────────────────────────────┘
```

#### Type B: Dashboard-Level Recommendations
```
┌────────────────────────────────────────┐
│  1. Click "Generate AI Recommendations"│
│     (Top of AI Visibility dashboard)   │
└──────────────┬─────────────────────────┘
               ↓
┌────────────────────────────────────────┐
│  2. Azure OpenAI analyzes all URLs     │
│     Input: All analyzed pages + scores │
│     Strategy: Portfolio-level insights │
└──────────────┬─────────────────────────┘
               ↓
┌────────────────────────────────────────┐
│  3. Generates strategic recommendations│
│     - Which pages to prioritize        │
│     - Common issues across site        │
│     - Quick wins vs. long-term fixes   │
└──────────────┬─────────────────────────┘
               ↓
┌────────────────────────────────────────┐
│  ✅ Recommendations in expandable panel│
└────────────────────────────────────────┘
```

#### Type C: Content Opportunity Insights (Trends & Insights page)
```
┌────────────────────────────────────────┐
│  1. Navigate to "Trends & Insights"    │
│     Auto-loads when project has data   │
└──────────────┬─────────────────────────┘
               ↓
┌────────────────────────────────────────┐
│  2. System analyzes prompt patterns    │
│     - 1000+ user queries analyzed      │
│     - Themes identified (pricing, etc.)│
│     - Content gaps detected            │
└──────────────┬─────────────────────────┘
               ↓
┌────────────────────────────────────────┐
│  3. Azure OpenAI generates insights    │
│     Input: Prompts + URL analysis      │
│     Strategy: Content opportunities    │
│     - New pages needed                 │
│     - Existing pages to improve        │
│     - Validated against site structure │
└──────────────┬─────────────────────────┘
               ↓
┌────────────────────────────────────────┐
│  ✅ Full opportunity analysis shown    │
│     - Themes (5-10 identified)         │
│     - AI recommendations (8-12)        │
│     - Each with priority & validation  │
│     Cached to disk (instant on reload) │
└────────────────────────────────────────┘
```

**Backend insights generation flow:**
```
┌─────────────────────────────────────────┐
│  Backend: insightsGenerator.js          │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│  Step 1: Load content analysis data     │
│  - Read {jobId}.json                    │
│  - Extract scores and context           │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│  Step 2: Build AI prompt                │
│  Includes:                              │
│  - URL and domain                       │
│  - Current date (December 2025)         │
│  - All 6 scores with percentages        │
│  - Detailed findings                    │
│  - Page type and applied weights        │
│  - Sample content (first 2000 chars)    │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│  Step 3: Call Azure OpenAI API          │
│  POST to:                               │
│  {endpoint}/openai/deployments/gpt-4o   │
│                                          │
│  Request:                               │
│  - Temperature: 0.7                     │
│  - Max tokens: 1500                     │
│  - System role: SEO expert              │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│  Step 4: Parse AI response              │
│  Extract 5 recommendations in format:   │
│                                          │
│  ## Recommendation 1: [Title]           │
│  **Description:** [Details]             │
│  **Impact:** [Expected improvement]     │
│  **Steps:**                             │
│  1. [Action 1]                          │
│  2. [Action 2]                          │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│  Step 5: Update content analysis file   │
│  Adds "recommendations" array           │
│  Sets hasAIInsights = true              │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│  Step 6: Invalidate caches              │
│  - Dashboard cache cleared              │
│  - Content analysis cache cleared       │
│  - Frontend refetches latest data       │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│  ✅ Insights ready and displayed        │
└─────────────────────────────────────────┘
```

**Example AI prompt sent to Azure:**
```
You are an SEO expert specializing in LLM/AI discoverability. 
Analyze this webpage and provide 5 tailored recommendations.

CONTEXT:
- Current Date: December 13, 2025
- URL: https://lovesac.com/sactionals
- Domain: lovesac.com
- Page Type: Product Page

Current Scores:
- Overall LLM Presence: 68% (Good)
- Freshness: 75%
- Answerability: 62%
- Query Alignment: 58% ⚠️ NEEDS IMPROVEMENT
- Authority: 70%
- Structure: 65%
- Snippet Quality: 72%

Page Content Sample:
"Sactionals are the world's most adaptable couch..."

INSTRUCTIONS:
1. Focus on Query Alignment (weakest score)
2. Provide specific, actionable steps
3. Reference actual page elements
4. Use current year (2025) in suggestions
5. Prioritize high-impact changes

Generate 5 recommendations following this format:
## Recommendation 1: [Clear Title]
**Description:** [What to do]
**Impact:** [Expected improvement]
**Steps:**
1. [Specific action]
2. [Specific action]
```

**Example AI response:**
```markdown
## Recommendation 1: Add Question-Based H2 Headings
**Description:** Transform existing headings into natural questions users would ask.
**Impact:** Will improve Query Alignment by 15-20% and boost answerability.
**Steps:**
1. Change "Features" → "What makes Sactionals different from regular sofas?"
2. Change "Materials" → "What materials are Sactionals made from?"
3. Add new section: "How do I configure my Sactional?"

## Recommendation 2: Create Conversational Product Description
**Description:** Rewrite intro paragraph in second-person perspective.
**Impact:** Will improve Query Alignment by 10% through conversational tone.
**Steps:**
1. Start with "You can customize your Sactional..."
2. Use phrases like "Here's how it works" and "You'll love"
3. Keep it 120-160 characters for snippet optimization
```

---

### Step 5: View Analytics & Reports

**What you can see:**
Three main dashboards provide comprehensive insights into your AI visibility performance.

#### 5A: AI Visibility Dashboard (Main View)
```
┌─────────────────────────────────────────────────┐
│           AI VISIBILITY DASHBOARD               │
├─────────────────────────────────────────────────┤
│                                                 │
│  🏠 Project: lovesac.com                       │
│  📋 15 URLs tracked  •  🔍 8 analyzed          │
│  💾 Auto-saved • Last update: 2 min ago        │
│                                                 │
│  ┌───────────────────────────────────────┐    │
│  │  Quick Actions                        │    │
│  ├───────────────────────────────────────┤    │
│  │  [🤖 Generate AI Recommendations]     │    │
│  │  [📊 View Citation Performance]       │    │
│  │  [🎯 View Trends & Insights]          │    │
│  └───────────────────────────────────────┘    │
│                                                 │
│  ┌───────────────────────────────────────┐    │
│  │  Summary Cards (Top Section)          │    │
│  ├───────────────────────────────────────┤    │
│  │  📊 Avg Citation Rate: 18.2%          │    │
│  │  🎯 Avg LLM Presence: 68%            │    │
│  │  ✅ URLs with Citations: 12/15        │    │
│  │  🔍 Analyzed URLs: 8/15               │    │
│  └───────────────────────────────────────┘    │
│                                                 │
│  ┌───────────────────────────────────────┐    │
│  │  Controls & Filters                   │    │
│  ├───────────────────────────────────────┤    │
│  │  Sort by: [Citation Rate ▼]          │    │
│  │  [☑ Select All] [Analyze Selected (5)]│    │
│  │  Page: [< 1 of 1 >]  (20 per page)   │    │
│  └───────────────────────────────────────┘    │
│                                                 │
│  ┌───────────────────────────────────────┐    │
│  │  URLs Table (Collapsible Rows)       │    │
│  ├───────────────────────────────────────┤    │
│  │  [☑] /sactionals                      │    │
│  │  Citation: 22% • LLM: 72% • [Analyze]│    │
│  │  [▼] Expand for details...           │    │
│  │                                        │    │
│  │  ├─ When Expanded ─────────────────┐ │    │
│  │  │  🎯 LLM Presence Metrics:        │ │    │
│  │  │  • Freshness: 75% [ℹ️]           │ │    │
│  │  │  • Answerability: 62% [ℹ️]       │ │    │
│  │  │  • Query Alignment: 58% ⚠️ [ℹ️]  │ │    │
│  │  │  • Authority: 70% [ℹ️]           │ │    │
│  │  │  • Structure: 65% [ℹ️]           │ │    │
│  │  │  • Snippet Quality: 72% [ℹ️]     │ │    │
│  │  │                                   │ │    │
│  │  │  [✨ Generate AI Insights]        │ │    │
│  │  │                                   │ │    │
│  │  │  💡 AI Recommendations (5):       │ │    │
│  │  │  1. Add question-based H2s        │ │    │
│  │  │     Impact: +15% query alignment  │ │    │
│  │  │  2. Update to 2025 data           │ │    │
│  │  │     Impact: +20% freshness        │ │    │
│  │  │  ... (3 more)                     │ │    │
│  │  │                                   │ │    │
│  │  │  📝 AI-Generated Prompts:         │ │    │
│  │  │  Awareness (3 questions)          │ │    │
│  │  │  Consideration (4 questions)      │ │    │
│  │  │  Conversion (3 questions)         │ │    │
│  │  └───────────────────────────────────┘ │    │
│  │                                        │    │
│  │  [☑] /products/best-seller            │    │
│  │  Citation: 18% • LLM: 65% • [Analyze]│    │
│  │  [▶] Click to expand...              │    │
│  │                                        │    │
│  │  [+ 13 more URLs with pagination]     │    │
│  └───────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

#### 5B: Citation Performance Page
```
┌─────────────────────────────────────────────────┐
│         CITATION PERFORMANCE DASHBOARD          │
├─────────────────────────────────────────────────┤
│                                                 │
│  📊 Standalone or linked from AI Visibility    │
│  Can upload data independently without project │
│                                                 │
│  ┌───────────────────────────────────────┐    │
│  │  Upload Options (Step 1 if new)      │    │
│  ├───────────────────────────────────────┤    │
│  │  Option A: Upload URLs + Citations    │    │
│  │  • Drag & drop URL file               │    │
│  │  • Then drag & drop citation files    │    │
│  │                                        │    │
│  │  Option B: Use Active Project         │    │
│  │  • Load from AI Visibility project    │    │
│  └───────────────────────────────────────┘    │
│                                                 │
│  ┌───────────────────────────────────────┐    │
│  │  Summary Cards                        │    │
│  ├───────────────────────────────────────┤    │
│  │  Overall Avg: 18.2%                   │    │
│  │  Domain Rate: 24.5%                   │    │
│  │  Best Week: w50 (22%)                │    │
│  │  Worst Week: w47 (12%)               │    │
│  │  Total Prompts: 2,340                │    │
│  └───────────────────────────────────────┘    │
│                                                 │
│  ┌───────────────────────────────────────┐    │
│  │  [🤖 Generate AI Recommendations]     │    │
│  │  Context-aware insights based on data │    │
│  └───────────────────────────────────────┘    │
│                                                 │
│  ┌───────────────────────────────────────┐    │
│  │  Filters & Settings (Collapsible)    │    │
│  ├───────────────────────────────────────┤    │
│  │  📅 Weeks: [All] [w48] [w49] [w50]   │    │
│  │  🔗 URLs: [Select specific URLs...]  │    │
│  │  📊 Charts: [Show/Hide]              │    │
│  └───────────────────────────────────────┘    │
│                                                 │
│  ┌───────────────────────────────────────┐    │
│  │  📈 Visual Analytics (4 Charts)       │    │
│  ├───────────────────────────────────────┤    │
│  │  1. Weekly Trend (line chart)         │    │
│  │     Citation % over time              │    │
│  │                                        │    │
│  │  2. Platform Comparison (bar chart)   │    │
│  │     ChatGPT, Perplexity, etc.         │    │
│  │                                        │    │
│  │  3. URL Performance (doughnut)        │    │
│  │     High/Medium/Low/None tiers        │    │
│  │                                        │    │
│  │  4. URL Comparison (multi-line)       │    │
│  │     When specific URLs filtered       │    │
│  └───────────────────────────────────────┘    │
│                                                 │
│  ┌───────────────────────────────────────┐    │
│  │  Platform Performance Cards           │    │
│  ├───────────────────────────────────────┤    │
│  │  🤖 ChatGPT: 15.2% (852 prompts)     │    │
│  │  🔮 Perplexity: 23.4% (634 prompts)  │    │
│  │  🧠 Claude: 12.1% (298 prompts)      │    │
│  │  💎 Gemini: 18.7% (421 prompts)      │    │
│  │  [+ Google AI Overviews, Copilot]    │    │
│  └───────────────────────────────────────┘    │
│                                                 │
│  ┌───────────────────────────────────────┐    │
│  │  Detailed Data Table (Sortable)      │    │
│  ├───────────────────────────────────────┤    │
│  │  Week | Platform | URL | Rate | Cited│    │
│  │  w50  | chatgpt  | /s  | 18%  | 15/83│    │
│  │  w50  | perplex  | /s  | 25%  | 18/72│    │
│  │  [+ Paginated, 20 per page]          │    │
│  └───────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

#### 5C: Trends & Insights Page (NEW! 🎉)
```
┌─────────────────────────────────────────────────┐
│            TRENDS & INSIGHTS DASHBOARD          │
├─────────────────────────────────────────────────┤
│                                                 │
│  💡 Discover content opportunities based on     │
│     prompt patterns and citation data           │
│                                                 │
│  ⚡ Requires: Project with citation data        │
│  ✨ Enhanced with URL analysis data (optional)  │
│                                                 │
│  ┌───────────────────────────────────────┐    │
│  │  [🔄 Load Opportunities]  [♻️ Regenerate]│  │
│  │  Status: ✅ Analysis complete          │    │
│  │  Generated: 2 min ago (cached)         │    │
│  └───────────────────────────────────────┘    │
│                                                 │
│  ┌───────────────────────────────────────┐    │
│  │  Summary Stats                        │    │
│  ├───────────────────────────────────────┤    │
│  │  📊 1,243 Unique Prompts Analyzed     │    │
│  │  🎯 8 Themes Identified               │    │
│  │  💡 12 AI Recommendations Generated   │    │
│  │  ✅ Validated Against 8 Analyzed URLs │    │
│  └───────────────────────────────────────┘    │
│                                                 │
│  ┌───────────────────────────────────────┐    │
│  │  🎨 Prompt Themes (Collapsible)       │    │
│  ├───────────────────────────────────────┤    │
│  │  [▼] Theme 1: Pricing Questions       │    │
│  │      • 187 prompts (15% of total)     │    │
│  │      • Citation rate: 12.3% ⚠️        │    │
│  │      • Funnel: Consideration           │    │
│  │      • Top cited: /pricing (8.2%)     │    │
│  │      • Sample prompts:                │    │
│  │        - "How much does X cost?"      │    │
│  │        - "What are the pricing tiers?"│    │
│  │                                        │    │
│  │  [▶] Theme 2: Product Comparisons     │    │
│  │      • 142 prompts (11% of total)     │    │
│  │      • Citation rate: 18.1% ✅        │    │
│  │                                        │    │
│  │  [▶] Theme 3: Setup Guides            │    │
│  │  [▶] Theme 4: Troubleshooting         │    │
│  │  [+ 4 more themes]                    │    │
│  └───────────────────────────────────────┘    │
│                                                 │
│  ┌───────────────────────────────────────┐    │
│  │  🤖 AI Content Recommendations        │    │
│  ├───────────────────────────────────────┤    │
│  │  [Show All (12)] [Filter by Priority]│    │
│  │                                        │    │
│  │  ✨ Recommendation 1: [HIGH Priority] │    │
│  │  Create Comprehensive Pricing FAQ     │    │
│  │                                        │    │
│  │  📋 Theme: Pricing Questions          │    │
│  │  🎯 Metric Focus: Answerability       │    │
│  │  🔧 Action Type: Create New Page      │    │
│  │                                        │    │
│  │  📊 Data:                             │    │
│  │  • 187 prompts need this content      │    │
│  │  • Current citation rate: 12.3%       │    │
│  │  • Potential: 25-30% if implemented   │    │
│  │                                        │    │
│  │  🎯 Target Pages:                     │    │
│  │  ⚠️ No existing page found            │    │
│  │  Recommended URL: /pricing-faq        │    │
│  │                                        │    │
│  │  ✅ Action Items:                     │    │
│  │  1. Create /pricing-faq page          │    │
│  │  2. Add 15-20 pricing FAQs            │    │
│  │  3. Include comparison table          │    │
│  │  4. Add "Last updated: Dec 2025"      │    │
│  │                                        │    │
│  │  ────────────────────────────────────  │    │
│  │                                        │    │
│  │  ✨ Recommendation 2: [HIGH Priority] │    │
│  │  Update Product Comparison Content    │    │
│  │                                        │    │
│  │  📋 Theme: Product Comparisons        │    │
│  │  🎯 Metric Focus: Freshness           │    │
│  │  🔧 Action Type: Improve Existing     │    │
│  │                                        │    │
│  │  🎯 Target Pages:                     │    │
│  │  ✅ /compare (LLM: 42% • Fresh: 28%)  │    │
│  │  Validated: Page exists, needs update │    │
│  │                                        │    │
│  │  ✅ Action Items:                     │    │
│  │  1. Update all prices to 2025         │    │
│  │  2. Add release dates for products    │    │
│  │  3. Remove discontinued items         │    │
│  │  4. Add structured comparison table   │    │
│  │                                        │    │
│  │  [+ 10 more recommendations]          │    │
│  └───────────────────────────────────────┘    │
│                                                 │
│  ┌───────────────────────────────────────┐    │
│  │  💾 Note: Results cached to disk      │    │
│  │  Click "Regenerate" after analyzing   │    │
│  │  more URLs for updated recommendations│    │
│  └───────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

### Step 6: Optimize & Iterate

**The continuous improvement cycle:**

```
┌─────────────────────────────────────────────┐
│         OPTIMIZATION WORKFLOW               │
└──────────────┬──────────────────────────────┘
               ↓
┌───────────────────────────────────────────────┐
│  1. Gather Insights from All Dashboards       │
│     • AI Visibility: Per-URL insights         │
│     • Citation Performance: Platform trends   │
│     • Trends & Insights: Content gaps         │
│     Prioritize by impact and effort           │
└──────────────┬────────────────────────────────┘
               ↓
┌───────────────────────────────────────────────┐
│  2. Choose Your Strategy                      │
│     Option A: Quick Wins (1-2 days)           │
│     • Update dates to 2025                    │
│     • Add FAQ sections                        │
│     • Improve H2 headings                     │
│                                                │
│     Option B: New Content (1-2 weeks)         │
│     • Create pages for content gaps           │
│     • Based on Trends & Insights              │
│     • Target high-volume, low-citation themes │
│                                                │
│     Option C: Major Overhaul (1+ month)       │
│     • Restructure poor-performing pages       │
│     • Complete content rewrites               │
└──────────────┬────────────────────────────────┘
               ↓
┌───────────────────────────────────────────────┐
│  3. Implement Changes on Your Website         │
│     Track which recommendations you implement │
│     Example actions:                          │
│     ✅ Added pricing FAQ page                 │
│     ✅ Updated /compare page to 2025          │
│     ✅ Improved answerability on 3 pages      │
└──────────────┬────────────────────────────────┘
               ↓
┌───────────────────────────────────────────────┐
│  4. Wait for AI Models to Re-Crawl (1-2 weeks)│
│     • Different AI platforms crawl at          │
│       different rates                          │
│     • ChatGPT: ~1 week                        │
│     • Perplexity: ~3-5 days                   │
│     • Monitor but don't expect instant results│
└──────────────┬────────────────────────────────┘
               ↓
┌───────────────────────────────────────────────┐
│  5. Re-Analyze & Compare                      │
│     In AI Visibility Dashboard:               │
│     • Click "Analyze" on updated URLs         │
│     • Compare new LLM scores to old           │
│     • Check if freshness, answerability improved│
│     • Regenerate insights to see new suggestions│
└──────────────┬────────────────────────────────┘
               ↓
┌───────────────────────────────────────────────┐
│  6. Upload New Citation Data & Check Trends   │
│     • Upload latest brand presence files      │
│     • Go to Citation Performance              │
│     • Compare week-over-week trends           │
│     • Did citation rate increase?             │
└──────────────┬────────────────────────────────┘
               ↓
┌───────────────────────────────────────────────┐
│  7. Regenerate Content Opportunities          │
│     In Trends & Insights:                     │
│     • Click "Regenerate" button               │
│     • System uses updated URL analysis        │
│     • Get refreshed recommendations           │
│     • See validation against new content      │
└──────────────┬────────────────────────────────┘
               ↓
┌───────────────────────────────────────────────┐
│  8. Measure Impact & Iterate                  │
│     ✅ LLM scores improved?                   │
│     ✅ Citation rates increased?              │
│     ✅ Which changes had most impact?         │
│     ✅ Which themes now performing better?    │
└──────────────┬────────────────────────────────┘
               ↓
         ┌─────┴─────┐
         ↓           ↓
    [SUCCESS]    [NEEDS MORE]
         ↓           ↓
    Document    Try different
    what worked approaches
    & replicate    ↓
         └─────┬─────┘
               ↓
        [Back to Step 1]
        [Focus on next set of URLs]
```

**Optimization cycle timeline:**
```
Week 1: Initial setup & analysis
  Day 1: Upload URLs + citation data
  Day 2: Batch analyze all URLs (use batch mode!)
  Day 3: Review all 3 dashboards
  Day 4-5: Generate all AI recommendations
  Day 6-7: Implement quick wins
    • Update dates to 2025
    • Add FAQ sections
    • Improve H2 headings

Week 2-3: Let AI models re-crawl
  • Monitor only, no changes
  • Different platforms crawl at different rates
  • Upload weekly citation data to track changes

Week 4: Measure impact
  Day 1: Upload new citation data
  Day 2: Re-analyze updated URLs
  Day 3: Compare before/after metrics
  Day 4: Regenerate Trends & Insights
  Day 5-7: Decide next actions based on results

Week 5+: Continue cycle
  • Focus on new URLs or content opportunities
  • Implement medium-effort changes
  • Build new pages for content gaps
  • Monitor trends and adjust strategy
```

---

## 🔄 Data Flow Architecture

### Complete System Data Flow

```
┌────────────────────────────────────────────────────────────┐
│                       USER ACTIONS                          │
└──────────────────┬─────────────────────────────────────────┘
                   ↓
┌────────────────────────────────────────────────────────────┐
│                  FRONTEND (React + Vite)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │AI Visibility │  │Citation      │  │Trends &      │    │
│  │Analysis      │  │Performance   │  │Insights      │    │
│  │Page          │  │Page          │  │Page (NEW!)   │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            ↓                                │
│                    ┌───────────────┐                        │
│                    │ AppContext    │                        │
│                    │ (Global State)│                        │
│                    │ + localStorage│                        │
│                    │ (Persistence) │                        │
│                    └───────┬───────┘                        │
└────────────────────────────┼────────────────────────────────┘
                             ↓
                    HTTP Requests (axios)
                             ↓
┌────────────────────────────────────────────────────────────┐
│                  BACKEND API (Express)                      │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │  API Routes (routes/)                              │   │
│  │  ├─ /api/unified/*          (Main project routes) │   │
│  │  │   ├─ POST /create-from-file                    │   │
│  │  │   ├─ POST /:id/upload-citations                │   │
│  │  │   ├─ POST /:id/analyze-content                 │   │
│  │  │   ├─ POST /:id/generate-insights               │   │
│  │  │   ├─ POST /:id/generate-recommendations        │   │
│  │  │   ├─ POST /:id/content-opportunities          │   │
│  │  │   └─ GET  /:id/dashboard                       │   │
│  │  │                                                 │   │
│  │  ├─ /api/citations/*        (Citation routes)     │   │
│  │  │   ├─ POST /upload (multi-file support)        │   │
│  │  │   ├─ POST /generate-recommendations (NEW!)    │   │
│  │  │   ├─ GET  /results/:jobId                     │   │
│  │  │   └─ GET  /trends                             │   │
│  │  │                                                 │   │
│  │  └─ /api/spacecat/*         (Spacecat integration)│   │
│  └──────────────────┬─────────────────────────────────┘   │
│                     ↓                                       │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Services (services/)                              │   │
│  │  ├─ unifiedAnalyzer.js          (orchestration)   │   │
│  │  ├─ citationProcessor.js        (Excel parsing)   │   │
│  │  ├─ hybridContentAnalyzer.js    (scraping + LLM)  │   │
│  │  ├─ insightsGenerator.js        (per-URL AI)      │   │
│  │  ├─ visibilityRecommendationAI.js (dashboard AI)  │   │
│  │  ├─ citationRecommendationAI.js (citation AI)     │   │
│  │  ├─ contentOpportunityAI.js     (trends AI) NEW!  │   │
│  │  ├─ promptAnalyzer.js           (prompt patterns) │   │
│  │  ├─ contentPatternAnalyzer.js   (content gaps)    │   │
│  │  └─ websiteStructureValidator.js (validation)     │   │
│  └──────────────────┬─────────────────────────────────┘   │
│                     ↓                                       │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Utilities (utils/)                                │   │
│  │  ├─ browserPool.js    (Puppeteer pool 40-50% faster)│ │
│  │  ├─ cache.js          (In-memory caching)         │   │
│  │  ├─ rateLimiter.js    (Rate limiting)             │   │
│  │  ├─ validation.js     (Input validation)          │   │
│  │  └─ logger.js         (Structured logging)        │   │
│  └──────────────────┬─────────────────────────────────┘   │
│                     ↓                                       │
│  ┌────────────────────────────────────────────────────┐   │
│  │  External Dependencies                             │   │
│  │  ├─ Puppeteer (browser automation)                │   │
│  │  ├─ Cheerio (HTML parsing)                        │   │
│  │  ├─ ExcelJS (Excel parsing, multi-file)          │   │
│  │  └─ fs-extra (file operations)                    │   │
│  └──────────────────┬─────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES & TOOLS                      │
│  ┌──────────────────────┐  ┌──────────────────────┐       │
│  │ Azure OpenAI         │  │ LLM Presence Tracker │       │
│  │ (GPT-4o)             │  │ (External Tool)      │       │
│  │ ────────────────────│  │ - 6 metric scores    │       │
│  │ 3 AI Services:       │  │ - Page classification│       │
│  │ • Per-URL insights   │  │ - Prompt generation  │       │
│  │ • Dashboard recs     │  │ - Weighted scoring   │       │
│  │ • Content opps       │  └──────────────────────┘       │
│  └──────────────────────┘                                  │
└────────────────────────────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│               FILE STORAGE (data/)                          │
│                                                             │
│  data/                                                      │
│  ├── uploads/                   (User uploads)             │
│  │   ├── {timestamp}-urls.csv                             │
│  │   └── {timestamp}-brandpresence-*.xlsx (multi-file)    │
│  │                                                          │
│  ├── results/                   (Analysis results)         │
│  │   ├── unified-{projectId}.json       (project state)   │
│  │   ├── {jobId}-citations.json         (citation data)   │
│  │   ├── {contentJobId}.json            (URL analysis)    │
│  │   ├── {projectId}-opportunities.json (trends, NEW!)    │
│  │   └── temp/                          (temp files)      │
│  │                                                          │
│  └── projects/                  (Legacy, deprecated)       │
└────────────────────────────────────────────────────────────┘
                     ↑
                     │
         ┌───────────┴───────────┐
         ↓                       ↓
┌──────────────────┐  ┌──────────────────┐
│ Browser Storage  │  │ Backend Caching  │
│ (localStorage)   │  │ (In-memory Maps) │
│ - Active project │  │ - Dashboard data │
│ - Citation data  │  │ - Citation data  │
│ - Auto-restore   │  │ - TTL: 5 minutes │
└──────────────────┘  └──────────────────┘
```

---

## 🔐 Backend Job Management

### How Background Jobs Work

```
┌─────────────────────────────────────────────┐
│       JOB LIFECYCLE MANAGEMENT              │
└──────────────┬──────────────────────────────┘
               ↓
┌──────────────────────────────────────────────┐
│  1. Job Creation                             │
│     - User clicks "Analyze this URL"         │
│     - Backend generates unique jobId         │
│     - Returns jobId to frontend              │
│     Example: "job-abc-123-def"               │
└──────────────┬───────────────────────────────┘
               ↓
┌──────────────────────────────────────────────┐
│  2. Job Execution (Async)                    │
│     - Job runs in background                 │
│     - Status stored in memory map            │
│     - Updates: "processing" → "completed"    │
└──────────────┬───────────────────────────────┘
               ↓
┌──────────────────────────────────────────────┐
│  3. Status Polling (Frontend)                │
│     - Frontend polls every 2 seconds         │
│     - GET /api/unified/:projectId/status     │
│     - Checks job status                      │
└──────────────┬───────────────────────────────┘
               ↓
┌──────────────────────────────────────────────┐
│  4. Completion Detection                     │
│     - Status changes to "completed"          │
│     - Frontend stops polling                 │
│     - Fetches results                        │
│     - Updates UI                             │
└──────────────────────────────────────────────┘
```

**Status values:**
```
pending                → Initial state
ready_for_citations   → URLs uploaded
processing_citations  → Processing Excel file
completed             → ✅ All done
error                 → ❌ Something failed
```

---

## 💾 Caching Strategy

### How Caching Improves Performance

```
┌────────────────────────────────────────────┐
│           CACHING SYSTEM                   │
└──────────────┬─────────────────────────────┘
               ↓
┌───────────────────────────────────────────────┐
│  Cache Types (In-Memory Maps)                 │
│                                                │
│  1. dashboardCache                            │
│     Key: projectId                            │
│     Value: Full dashboard data + timestamp    │
│     TTL: 5 minutes                            │
│                                                │
│  2. citationDataCache                         │
│     Key: citationJobId                        │
│     Value: Citation data + timestamp          │
│     TTL: 5 minutes                            │
│                                                │
│  3. contentAnalysisCache                      │
│     Key: contentJobId                         │
│     Value: Analysis results + timestamp       │
│     TTL: 5 minutes                            │
└──────────────┬────────────────────────────────┘
               ↓
┌───────────────────────────────────────────────┐
│  Cache Hit/Miss Flow                          │
│                                                │
│  Request → Check cache                        │
│      ├─ HIT (age < 5 min)                    │
│      │   └─→ Return cached data (fast! 2ms)  │
│      │                                         │
│      └─ MISS (not cached or expired)         │
│          └─→ Read from disk (~200ms)         │
│              └─→ Store in cache              │
│                  └─→ Return data             │
└──────────────┬────────────────────────────────┘
               ↓
┌───────────────────────────────────────────────┐
│  Cache Invalidation (When?)                   │
│                                                │
│  ✅ After content analysis completes          │
│  ✅ After citation data uploads               │
│  ✅ After insights generation                 │
│  ✅ After 5 minutes (automatic TTL)          │
│  ✅ Manual via cache-busting headers         │
└───────────────────────────────────────────────┘
```

**Performance comparison:**
```
Without caching:
  Dashboard load: ~400ms (read from disk)
  
With caching:
  First request: ~400ms (cache MISS)
  Subsequent requests: ~2ms (cache HIT)
  
Speed improvement: 200x faster! 🚀
```

---

## 🎨 Frontend State Management

### How React State Flows

```
┌────────────────────────────────────────────┐
│       FRONTEND STATE MANAGEMENT            │
└──────────────┬─────────────────────────────┘
               ↓
┌──────────────────────────────────────────────┐
│  AppContext (Global State)                   │
│  Located: contexts/AppContext.jsx            │
│                                               │
│  State Variables:                            │
│  ├─ activeProject: {id, domain, status}     │
│  ├─ uploadedUrls: [array of URLs]           │
│  ├─ citationData: {rates, targetUrls}       │
│  └─ dashboardData: {urls, analysis}         │
│                                               │
│  Functions:                                  │
│  ├─ setActiveProject()                      │
│  ├─ addUploadedUrls()                       │
│  ├─ updateCitationData()                    │
│  └─ clearProject()                          │
└──────────────┬───────────────────────────────┘
               ↓
┌──────────────────────────────────────────────┐
│  Component State (Local)                     │
│                                               │
│  AIVisibility.jsx:                           │
│  ├─ step: 1, 2, or 3 (wizard progress)      │
│  ├─ selectedUrl: "https://..."              │
│  ├─ expandedUrl: "https://..."              │
│  └─ isLoading: true/false                   │
│                                               │
│  CitationPerformance.jsx:                    │
│  ├─ selectedWeeks: ["w48", "w49"]           │
│  ├─ selectedUrls: [filtered URLs]           │
│  ├─ showFilters: true/false                 │
│  └─ showCharts: true/false                  │
└──────────────┬───────────────────────────────┘
               ↓
┌──────────────────────────────────────────────┐
│  State Update Flow                           │
│                                               │
│  User Action                                 │
│      ↓                                        │
│  Component Event Handler                     │
│      ↓                                        │
│  API Call (if needed)                        │
│      ↓                                        │
│  Update Context/State                        │
│      ↓                                        │
│  React Re-renders                            │
│      ↓                                        │
│  UI Updates                                  │
└──────────────────────────────────────────────┘
```

---

## 🚨 Error Handling Flow

### What Happens When Things Go Wrong

```
┌──────────────────────────────────────────────┐
│         ERROR HANDLING SYSTEM                │
└──────────────┬───────────────────────────────┘
               ↓
┌─────────────────────────────────────────────────┐
│  Frontend Error Handling                        │
│                                                  │
│  try {                                          │
│    const response = await axios.post(...)      │
│    // Success path                             │
│  } catch (error) {                             │
│    if (error.response) {                       │
│      // Server responded with error            │
│      alert(`Error: ${error.response.data}`)    │
│    } else if (error.request) {                 │
│      // No response received                   │
│      alert('Server not responding')            │
│    } else {                                    │
│      // Request setup error                    │
│      alert('Request failed')                   │
│    }                                            │
│  }                                              │
└──────────────┬──────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────────┐
│  Backend Error Handling                         │
│                                                  │
│  app.use((err, req, res, next) => {            │
│    logger.error('Error:', err)                 │
│    res.status(500).json({                      │
│      error: err.message,                       │
│      stack: isDev ? err.stack : undefined      │
│    })                                           │
│  })                                             │
└──────────────┬──────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────────┐
│  Common Error Scenarios                         │
│                                                  │
│  1. File Upload Errors                         │
│     → Invalid format                           │
│     → Missing required columns                 │
│     → File too large                           │
│     Solution: Show clear error message         │
│                                                  │
│  2. Analysis Timeout                           │
│     → Page takes >30s to load                  │
│     → Puppeteer crash                          │
│     Solution: Retry with increased timeout     │
│                                                  │
│  3. Azure API Errors                           │
│     → Rate limit exceeded                      │
│     → Invalid API key                          │
│     Solution: Fallback gracefully              │
│                                                  │
│  4. Network Errors                             │
│     → Backend not running                      │
│     → CORS issues                              │
│     Solution: Check server status              │
└─────────────────────────────────────────────────┘
```

---

## 📊 Performance Optimization

### How the System Stays Fast

```
┌────────────────────────────────────────────┐
│      PERFORMANCE OPTIMIZATIONS             │
└──────────────┬─────────────────────────────┘
               ↓
┌───────────────────────────────────────────────┐
│  1. Caching (Covered above)                   │
│     → 200x faster dashboard loads             │
└──────────────┬────────────────────────────────┘
               ↓
┌───────────────────────────────────────────────┐
│  2. Lazy Data Loading                         │
│     → Only analyze when user clicks           │
│     → Don't load all 15 URLs at once         │
│     → Load on-demand                          │
└──────────────┬────────────────────────────────┘
               ↓
┌───────────────────────────────────────────────┐
│  3. React Memoization                         │
│     → useMemo() for expensive calculations    │
│     → Chart data only recalculated on change  │
│     → Prevents unnecessary re-renders         │
└──────────────┬────────────────────────────────┘
               ↓
┌───────────────────────────────────────────────┐
│  4. Efficient Data Structures                 │
│     → Map() for O(1) lookups                 │
│     → Set() for unique values                │
│     → No nested loops where possible         │
└──────────────┬────────────────────────────────┘
               ↓
┌───────────────────────────────────────────────┐
│  5. Background Jobs                           │
│     → Heavy processing in background          │
│     → UI stays responsive                     │
│     → Status polling for updates              │
└───────────────────────────────────────────────┘
```

---

## 🎓 Best Practices for Users

### Tips for Getting the Most from the Tool

```
DO ✅
├─ Upload complete, accurate Excel files
├─ Track 10-20 URLs (not too few, not too many)
├─ Re-analyze monthly after making changes
├─ Focus on one recommendation at a time
├─ Monitor weekly trends
└─ Use filters in Citation Performance

DON'T ❌
├─ Upload incomplete Excel files
├─ Track 100+ URLs (performance issues)
├─ Expect instant citation rate changes
├─ Implement all recommendations at once
├─ Ignore low-performing URLs
└─ Forget to update data regularly
```

### Recommended Update Frequency

```
Weekly:
  └─ Upload new brand presence data
     (to track citation rate changes)

Monthly:
  └─ Re-analyze content for each URL
     (after implementing changes)

Quarterly:
  └─ Review overall strategy
     (analyze patterns, adjust approach)
```

---

## 🔗 File Structure Reference

### Key Files and Their Roles

```
AIVisibilityDashboard/
├── backend/
│   ├── routes/
│   │   ├── unified.js          → Main project API routes
│   │   ├── citations.js        → Citation endpoints
│   │   └── spacecat.js         → Spacecat API integration
│   │
│   ├── services/
│   │   ├── unifiedAnalyzer.js              → Project orchestration
│   │   ├── citationProcessor.js            → Multi-file Excel parsing
│   │   ├── hybridContentAnalyzer.js        → Content scraping + LLM
│   │   ├── insightsGenerator.js            → Per-URL AI insights
│   │   ├── visibilityRecommendationAI.js   → Dashboard AI recs
│   │   ├── citationRecommendationAI.js     → Citation AI recs
│   │   ├── contentOpportunityAI.js         → Trends AI recs (NEW!)
│   │   ├── promptAnalyzer.js               → Prompt pattern analysis
│   │   ├── contentPatternAnalyzer.js       → Content gap detection
│   │   ├── websiteStructureValidator.js    → Validation logic
│   │   ├── fileParser.js                   → URL file parser
│   │   └── sitemapParser.js                → Sitemap handling
│   │
│   ├── utils/
│   │   ├── config.js           → Centralized configuration
│   │   ├── logger.js           → Structured logging
│   │   ├── cache.js            → In-memory caching (5 min TTL)
│   │   ├── browserPool.js      → Puppeteer browser pooling
│   │   ├── rateLimiter.js      → Rate limiting per service
│   │   ├── validation.js       → Input validation
│   │   └── errors.js           → Custom error classes
│   │
│   └── server.js               → Express app entry point
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx                  → Landing page
│   │   │   ├── AIVisibility.jsx          → Main dashboard
│   │   │   ├── CitationPerformance.jsx   → Citation analytics
│   │   │   └── TrendsInsights.jsx        → Content opportunities (NEW!)
│   │   │
│   │   ├── components/
│   │   │   ├── ContentOpportunities.jsx  → Trends component
│   │   │   ├── LLMScoreTooltip.jsx      → Metric tooltips
│   │   │   ├── SkeletonLoader.jsx       → Loading states
│   │   │   ├── Toast.jsx                → Notifications
│   │   │   ├── Layout.jsx               → App layout
│   │   │   └── citation/                → Citation components
│   │   │       ├── VisualAnalyticsSection.jsx
│   │   │       ├── FiltersSection.jsx
│   │   │       └── MetricCard.jsx
│   │   │
│   │   ├── contexts/
│   │   │   └── AppContext.jsx  → Global state + localStorage
│   │   │
│   │   └── App.jsx             → React router + routes
│   │
│   └── package.json            → React, Vite, Chart.js, Tailwind
│
├── data/                        (Auto-created)
│   ├── uploads/                → User uploaded files
│   ├── results/                → Analysis results & cache
│   │   └── temp/              → Temporary processing files
│   └── projects/               → (Legacy, unused)
│
├── external-tools/
│   └── llm-presence-tracker/   → LLM scoring engine
│       ├── analyzers/          → 6 metric analyzers
│       └── main.js             → Entry point
│
├── logs/                        (Auto-created)
│   ├── combined.log            → All logs
│   └── error.log               → Error logs only
│
├── docs/
│   ├── GETTING_STARTED.md      → Setup guide
│   ├── USER_GUIDE.md           → How to use
│   └── DEVELOPER_GUIDE.md      → Architecture
│
├── #1_METRICS_GUIDE.md         → Metrics explanation
├── #2_WORKFLOW_GUIDE.md        → This file!
├── README.md                    → Project overview
└── start.bat                    → Quick start script (Windows)
```

---

## 📞 Troubleshooting Common Issues

### Quick Reference Guide

#### Issue: "Nothing happens after uploading brand presence data"

**Diagnosis:**
```
Check:
1. Is backend running? (Port 3000)
2. Console errors in browser?
3. Network tab shows 304 status?
```

**Solution:**
```
1. Restart backend server
2. Add cache-busting headers
3. Check Excel file format
```

---

#### Issue: "Generate AI Insights button not working"

**Diagnosis:**
```
Check:
1. Is Azure OpenAI key configured?
2. Backend logs show errors?
3. Content analysis completed first?
```

**Solution:**
```
1. Set AZURE_OPENAI_KEY in .env
2. Click "Analyze this URL" first
3. Check backend terminal output
```

---

#### Issue: "Citation rate shows 0% for all URLs"

**Diagnosis:**
```
Check:
1. Is "sources" column populated in Excel?
2. Do URLs in Excel match tracked URLs exactly?
3. Is data formatted correctly?
```

**Solution:**
```
1. Verify Excel has "sources" column
2. Ensure URLs match (including https://)
3. Check for typos in domain name
```

---

#### Issue: "Charts not displaying in Citation Performance"

**Diagnosis:**
```
Check:
1. Is citation data loaded?
2. Are filters too restrictive?
3. Browser console errors?
```

**Solution:**
```
1. Click "Load Recent Data"
2. Clear filters and retry
3. Check Chart.js is loaded
```

---

## 🎯 Summary: The Complete Journey

```
User uploads URL file + domain
         ↓
Project created automatically with all URLs
         ↓
User uploads brand presence data (1-50 Excel files)
         ↓
System processes & calculates citation rates
         ↓
User analyzes URLs (batch mode: select multiple!)
         ↓
System scrapes content & calculates 6 LLM scores per URL
         ↓
User generates AI insights (3 types available)
         ↓
   ┌─────┴──────┬─────────────┐
   ↓            ↓             ↓
Per-URL     Dashboard    Content Opportunities
Insights    Strategy     (Prompt Analysis)
   └─────┬──────┴─────────────┘
         ↓
User views insights across 3 dashboards:
  • AI Visibility Analysis (URL-level)
  • Citation Performance (Trends & platforms)
  • Trends & Insights (Content gaps & themes)
         ↓
User implements recommendations
         ↓
Wait 1-2 weeks for AI models to re-crawl
         ↓
User re-analyzes URLs & uploads new citation data
         ↓
User regenerates Trends & Insights (validation updated!)
         ↓
Measure improvement & repeat cycle
```

**⚡ Performance Metrics:**
- Time to first insights: **2-5 minutes** (with batch analysis)
- Analysis speed: **5-8 seconds per URL**
- Batch processing: **Configurable delays** (rate-limit friendly)
- Dashboard load time: **~200ms** (with caching)

**📈 Improvement Cycle:**
- Quick wins visible: **1-2 weeks**
- Full optimization cycle: **4-6 weeks**
- Continuous monitoring: **Weekly citation uploads recommended**

---

*Last Updated: December 2025*
*Version: 1.0*



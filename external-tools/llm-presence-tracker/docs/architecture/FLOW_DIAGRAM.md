# LLM Presence Tracker - Flow Diagram

> **💡 Tip:** This is the detailed technical flow. For a quick overview, see [SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md)

## 📑 Table of Contents

1. [Complete System Architecture](#-complete-system-architecture) - Visual flow from input to output
2. [Decision Points & Branching](#-decision-points--branching-logic) - Where the system makes choices
3. [Data Flow](#-data-flow-input--output) - Input transformation to output
4. [Performance Characteristics](#-performance-characteristics) - Timing, concurrency, rate limits
5. [Key Integration Points](#-key-integration-points) - How components connect
6. [Iterative Improvement](#-iterative-improvement-workflow) - Continuous optimization cycle

---

## 📊 Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER STARTS HERE                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │   Choose Input      │
                          │   Method            │
                          └──────────┬──────────┘
                                     │
                ┌────────────────────┼────────────────────┐
                │                    │                    │
         ┌──────▼────────┐   ┌──────▼────────┐   ┌──────▼────────┐
         │ Option 1:     │   │ Option 2:     │   │ Option 3:     │
         │ Minimal CSV   │   │ Manual GSC    │   │ Auto-Generate │
         │               │   │ Export        │   │ Queries       │
         │ URL, Traffic  │   │               │   │               │
         │ only          │   │ Add queries   │   │ (NEW!)        │
         │               │   │ manually      │   │               │
         └───────┬───────┘   └───────┬───────┘   └───────┬───────┘
                 │                   │                   │
                 │                   │                   │
                 │                   │           ┌───────▼────────┐
                 │                   │           │ Run:           │
                 │                   │           │ auto-populate- │
                 │                   │           │ queries.js     │
                 │                   │           └───────┬────────┘
                 │                   │                   │
                 │                   │           ┌───────▼────────────────┐
                 │                   │           │ 1. Extract topic       │
                 │                   │           │    from URL            │
                 │                   │           │ 2. Generate keywords   │
                 │                   │           │    (Azure OpenAI)      │
                 │                   │           │ 3. Fetch PAA questions │
                 │                   │           │    (SERP API)          │
                 │                   │           │ 4. Detect intent       │
                 │                   │           │ 5. Output enriched CSV │
                 │                   │           └───────┬────────────────┘
                 │                   │                   │
                 └───────────────────┴───────────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │   Input CSV         │
                          │   (with or without  │
                          │   search queries)   │
                          └──────────┬──────────┘
                                     │
                          ┌──────────▼──────────┐
                          │  Run main.js        │
                          │  --csv input.csv    │
                          │  --aikey KEY        │
                          │  [--disable-learning]│
                          └──────────┬──────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                         MAIN ANALYSIS PIPELINE                           │
└──────────────────────────────────────────────────────────────────────────┘
                                     │
                     ┌───────────────┴───────────────┐
                     │  For Each URL (parallel x5)  │
                     └───────────────┬───────────────┘
                                     │
                     ┌───────────────▼───────────────┐
                     │  STEP 1: Page Fetch          │
                     │  ┌─────────────────────────┐ │
                     │  │ Puppeteer launches      │ │
                     │  │ Chrome browser          │ │
                     │  │                         │ │
                     │  │ - Load URL              │ │
                     │  │ - Render JavaScript     │ │
                     │  │ - Capture HTML          │ │
                     │  │ - Extract text          │ │
                     │  └─────────────────────────┘ │
                     └───────────────┬───────────────┘
                                     │
                     ┌───────────────▼───────────────┐
                     │  STEP 2: Page Classification │
                     └───────────────┬───────────────┘
                                     │
                        ┌────────────┴────────────┐
                        │                         │
              ┌─────────▼────────┐      ┌────────▼─────────┐
              │ Heuristic Method │      │  AI Method       │
              │                  │      │  (if AI key)     │
              │ - URL patterns   │      │                  │
              │ - Content words  │      │  Azure OpenAI    │
              │ - Word count     │      │  analyzes page   │
              │                  │      │  content         │
              │ Confidence: Low/ │      │                  │
              │ Medium/High      │      │  Confidence:     │
              └─────────┬────────┘      │  High            │
                        │               └────────┬─────────┘
                        └────────────┬───────────┘
                                     │
                     ┌───────────────▼────────────────┐
                     │ Page Type Identified:          │
                     │                                │
                     │ - Online Tool                  │
                     │ - Blog Post                    │
                     │ - Tutorial/Guide               │
                     │ - Documentation                │
                     │ - FAQ Page                     │
                     │ - Product Page                 │
                     │ - Pricing Page                 │
                     │ - Homepage                     │
                     │ - Event/Webinar                │
                     │ - etc. (20+ types)             │
                     └───────────────┬────────────────┘
                                     │
                     ┌───────────────▼────────────────┐
                     │  STEP 3: Content Analysis      │
                     │  (6 Parallel Analyzers)        │
                     └───────────────┬────────────────┘
                                     │
        ┌────────────┬───────┬───────┼───────┬───────┬────────────┐
        │            │       │       │       │       │            │
┌───────▼──────┐ ┌──▼───┐ ┌▼────┐ ┌▼────┐ ┌▼────┐ ┌▼──────────┐ │
│ 1. Freshness │ │ 2.   │ │ 3.  │ │ 4.  │ │ 5.  │ │ 6.        │ │
│              │ │Answer│ │Query│ │Snip │ │Auth │ │ Structure │ │
│ - Has 2025?  │ │-able │ │Align│ │-pet │ │-ity │ │           │ │
│ - Has prices?│ │      │ │     │ │     │ │     │ │ - H1/H2/H3│ │
│ - Freshness  │ │ - Q? │ │ - Top│ │- 1st│ │-HTTPS│ │ - Lists   │ │
│   keywords   │ │ - Def│ │  phrases│ │ para│ │- Auth│ │ - Tables  │ │
│              │ │ - Steps│ │- Natural│ │- Meta│ │  info│ │ - Word ct │ │
│ Score: 0-100 │ │ - Comp│ │  lang  │ │  desc│ │     │ │ - Read.   │ │
│              │ │      │ │        │ │     │ │Score│ │           │ │
│              │ │Score │ │Score   │ │Score│ │0-100│ │ Score     │ │
│              │ │0-100 │ │0-100   │ │0-100│ │     │ │ 0-100     │ │
└───────┬──────┘ └──┬───┘ └┬────┘ └┬────┘ └┬────┘ └┬──────────┘ │
        │            │       │       │       │       │            │
        └────────────┴───────┴───────┴───────┴───────┴────────────┘
                                     │
                     ┌───────────────▼────────────────┐
                     │  STEP 4: Dynamic Weighting     │
                     │                                │
                     │  Get weights for page type:    │
                     │                                │
                     │  If "Online Tool":             │
                     │    Freshness:      10% ↓       │
                     │    Answerability:  30% ↑       │
                     │    QueryAlign:     20% ↑       │
                     │    SnippetQuality: 20% ↑       │
                     │    Authority:      10% ↓       │
                     │    Structure:      10%         │
                     │                                │
                     │  If "Blog Post":               │
                     │    Freshness:      35% ↑↑      │
                     │    Answerability:  20%         │
                     │    QueryAlign:     20% ↑       │
                     │    SnippetQuality: 15%         │
                     │    Authority:       5% ↓       │
                     │    Structure:       5% ↓       │
                     │                                │
                     │  (Different weights for each   │
                     │   of 20+ page types)           │
                     └───────────────┬────────────────┘
                                     │
                     ┌───────────────▼────────────────┐
                     │  STEP 5: Calculate Score       │
                     │                                │
                     │  LLM Presence Score =          │
                     │    (Freshness × weight1) +     │
                     │    (Answerability × weight2) + │
                     │    (QueryAlign × weight3) +    │
                     │    (SnippetQuality × weight4) +│
                     │    (Authority × weight5) +     │
                     │    (Structure × weight6)       │
                     │                                │
                     │  Result: 0-100%                │
                     │                                │
                     │  Rating:                       │
                     │    80-100% = Excellent         │
                     │    60-79%  = Good              │
                     │    40-59%  = Fair              │
                     │    0-39%   = Poor              │
                     └───────────────┬────────────────┘
                                     │
                     ┌───────────────▼────────────────┐
                     │  STEP 6: AI Insights           │
                     │  (if --aikey provided)         │
                     └───────────────┬────────────────┘
                                     │
                          ┌──────────┴───────────┐
                          │                      │
                  ┌───────▼──────────┐  ┌────────▼────────┐
                  │ Build AI Prompt  │  │  Check Learning │
                  │                  │  │  Library        │
                  │ Include:         │  │                 │
                  │ - Page type      │  │  If enabled &   │
                  │ - Applied weights│  │  10+ examples   │
                  │ - Current scores │  │  @ 75%+ avg:    │
                  │ - Actual content │  │                 │
                  │   * Title        │  │  Find 3 similar │
                  │   * Meta desc    │  │  examples based │
                  │   * 1st para     │  │  on:            │
                  │   * H2 samples   │  │  - Page type    │
                  │   * Questions    │  │  - User intent  │
                  │ - Structure      │  │  - Queries      │
                  │   counts         │  │                 │
                  │ - Search queries │  │  Add to prompt  │
                  │   (if provided)  │  │  as examples    │
                  │ - User intent    │  │                 │
                  │ - Top 3 weakness│  │                 │
                  │                  │  │                 │
                  └───────┬──────────┘  └────────┬────────┘
                          │                      │
                          └──────────┬───────────┘
                                     │
                     ┌───────────────▼────────────────┐
                     │  Call Azure OpenAI             │
                     │                                │
                     │  Model: GPT-4o                 │
                     │  Temperature: 0.3              │
                     │  Max tokens: 2000              │
                     │                                │
                     │  Response: 3-5 specific,       │
                     │  actionable recommendations    │
                     │                                │
                     │  - Content-aware (references   │
                     │    existing content)           │
                     │  - Data-driven (aligns with    │
                     │    search queries)             │
                     │  - Prioritized (focuses on     │
                     │    weaknesses)                 │
                     └───────────────┬────────────────┘
                                     │
                     ┌───────────────▼────────────────┐
                     │  STEP 7: Save Results          │
                     │                                │
                     │  Per URL:                      │
                     │  - llm-presence-{url}.json     │
                     │  - enhanced-content-{url}.txt  │
                     └───────────────┬────────────────┘
                                     │
                     ┌───────────────▼────────────────┐
                     │  STEP 8: Learning System       │
                     │  (if not --disable-learning)   │
                     │                                │
                     │  If score >= 75%:              │
                     │    Add to examples-library.json│
                     │                                │
                     │  Store:                        │
                     │  - Page type                   │
                     │  - User intent                 │
                     │  - Search queries              │
                     │  - Scores                      │
                     │  - Recommendations that worked │
                     │  - Timestamp                   │
                     │                                │
                     │  Future analyses will learn    │
                     │  from these examples!          │
                     └───────────────┬────────────────┘
                                     │
                                     │
                     ┌───────────────▼────────────────┐
                     │  Wait for all URLs to finish   │
                     └───────────────┬────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                            OUTPUT GENERATION                             │
└──────────────────────────────────────────────────────────────────────────┘
                                     │
                     ┌───────────────▼────────────────┐
                     │  Generate Summary CSV          │
                     │                                │
                     │  Columns (original + new):     │
                     │  - URL (original)              │
                     │  - Traffic (original)          │
                     │  - Category (original)         │
                     │  - Top_Search_Queries (orig)   │
                     │  - User_Intent (original)      │
                     │  ─────────────────────────     │
                     │  - Page_Type (NEW)             │
                     │  - Page_Type_Confidence (NEW)  │
                     │  - Classification_Method (NEW) │
                     │  - LLM_Presence_Score (NEW)    │
                     │  - Score_vs_Default (NEW)      │
                     │  - Score_Rating (NEW)          │
                     │  - Freshness_Score (NEW)       │
                     │  - Answerability_Score (NEW)   │
                     │  - Query_Alignment_Score (NEW) │
                     │  - Snippet_Quality_Score (NEW) │
                     │  - Authority_Score (NEW)       │
                     │  - Structure_Score (NEW)       │
                     │  - Has_Current_Year (NEW)      │
                     │  - Has_Pricing (NEW)           │
                     │  - Has_Questions (NEW)         │
                     │  - Has_Definitions (NEW)       │
                     │  - Has_Steps (NEW)             │
                     │  - Has_Comparisons (NEW)       │
                     │  - H1_Count (NEW)              │
                     │  - H2_Count (NEW)              │
                     │  - List_Count (NEW)            │
                     │  - Top_Phrases (NEW)           │
                     │  - Intent_Awareness (NEW)      │
                     │  - Intent_Consideration (NEW)  │
                     │  - Intent_Conversion (NEW)     │
                     │  - AI_Summary (NEW)            │
                     │                                │
                     │  Total: Original + 22 new cols │
                     └───────────────┬────────────────┘
                                     │
                     ┌───────────────▼────────────────┐
                     │  Generate Summary Report       │
                     │  (JSON)                        │
                     │                                │
                     │  - Total URLs analyzed         │
                     │  - Success/failure count       │
                     │  - Average LLM presence score  │
                     │  - Page type distribution      │
                     │  - Score distribution          │
                     │  - Library stats (if learning) │
                     └───────────────┬────────────────┘
                                     │
                     ┌───────────────▼────────────────┐
                     │  Console Summary               │
                     │                                │
                     │  ✅ Analysis complete!         │
                     │  Processed X URLs              │
                     │  Average Score: Y%             │
                     │                                │
                     │  📊 Summary Report:            │
                     │    - Total: X                  │
                     │    - Successful: X             │
                     │    - Average Score: X%         │
                     │                                │
                     │  📚 Examples Library:          │
                     │    - X examples stored         │
                     │    - Avg score: X%             │
                     │                                │
                     │  Files saved:                  │
                     │  - llm-presence-summary_...csv │
                     │  - llm-presence-report_...json │
                     │  - Individual analysis files   │
                     └───────────────┬────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                         USER REVIEWS RESULTS                             │
│                                                                          │
│  1. Open CSV in Excel/Google Sheets                                     │
│  2. Sort by LLM_Presence_Score (find lowest scoring pages)              │
│  3. Review AI_Summary recommendations for each page                     │
│  4. Implement improvements on actual pages                               │
│  5. Re-run analysis after changes to measure improvement                 │
│  6. Learning system improves recommendations over time                   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🔀 Decision Points & Branching Logic

### 1. Input Method Selection
```
START
  │
  ├─ Have Search Console data? ──YES─→ Manual export (Option 2)
  │                              NO
  │                               │
  ├─ Need quick analysis? ──YES──→ Auto-generate (Option 3)
  │                         NO
  │                          │
  └─ Just testing? ─────YES──→ Minimal CSV (Option 1)
```

### 2. Page Type Classification
```
Analyze URL + Content
  │
  ├─ URL patterns match? ──YES─→ Heuristic classification (fast)
  │                       NO      │
  │                               ├─ Confidence high? ──YES─→ Use result
  │                               │                    NO
  │                               │                     │
  └─ Azure OpenAI available? ─YES─┴─→ AI classification (accurate)
                              NO
                               │
                               └─→ Default: "Unknown"
```

### 3. AI Insights Generation
```
Check --aikey provided?
  │
  NO ──→ Skip AI insights, continue with scores only
  │
  YES
  │
  ├─ Check Learning enabled?
  │    │
  │    YES ──→ Library has 10+ examples @ 75%+ avg?
  │    │         │
  │    │         YES ──→ Find 3 similar examples
  │    │         │       Add to AI prompt
  │    │         │
  │    │         NO ──→ Don't use learning yet
  │    │
  │    NO (--disable-learning) ──→ Skip learning
  │
  └─→ Build context-aware prompt
      Call Azure OpenAI
      Get recommendations
```

### 4. Learning System Save
```
Analysis complete for URL
  │
  ├─ --disable-learning flag? ──YES─→ Skip saving
  │                             NO
  │                              │
  ├─ Score >= 75%? ─────────NO──→ Skip (quality threshold)
  │                    YES
  │                     │
  └─────────────────────→ Save to examples-library.json
                          - Page type
                          - Intent
                          - Queries
                          - Scores
                          - Recommendations
                          - Timestamp
```

---

## 📊 Data Flow: Input → Output

### Minimal Input
```
URL,Traffic
https://example.com/tool,100K
```

### After Auto-Population (Optional)
```
URL,Traffic,Category,Top_Search_Queries,User_Intent
https://example.com/tool,100K,,"keyword1; keyword2",transactional
```

### Analysis Processing
```
Fetch → Classify → Analyze → Weight → Score → AI → Learn
  ↓        ↓          ↓         ↓       ↓      ↓     ↓
HTML   "Tool"    6 scores   Apply   76.3%  Recs  Save
```

### Final Output
```
URL,Traffic,Category,Top_Search_Queries,User_Intent,Page_Type,
LLM_Presence_Score,Freshness_Score,Answerability_Score,...,
AI_Summary

https://example.com/tool,100K,,"keyword1; keyword2",
transactional,Online Tool,76.3,65.0,85.0,...,
"1. Add FAQ... 2. Improve..."
```

---

## ⚡ Performance Characteristics

### Concurrency
```
URLs 1-5:  [■■■■■] ← Process in parallel
URLs 6-10: [■■■■■] ← Next batch
URLs 11-15:[■■■■■] ← Next batch
```

### Timing Estimates
- **Page fetch:** 2-4 seconds
- **Analysis:** 1-2 seconds
- **AI call:** 3-5 seconds (if enabled)
- **Per URL total:** ~8-12 seconds with AI, ~3-6 seconds without

### Rate Limiting
- **Azure OpenAI:** Automatic retry with backoff
- **Puppeteer:** Max 5 concurrent pages
- **SERP API:** 1-second delay between requests (auto-populate)

---

## 🎯 Key Integration Points

### 1. Parent Project Utilities
```
llm-presence-tracker/main.js
         │
         ├─→ ../utils/utils.js (reused)
         │     - stripTagsToText()
         │     - extractWordCount()
         │     - tokenize()
         │
         └─→ ../main.js patterns (reused)
               - Puppeteer setup
               - Azure OpenAI integration
               - CSV processing
```

### 2. PAA Extractor Integration
```
auto-populate-queries.js
         │
         ├─→ ../paa-keyword-extractor/ (leveraged)
         │     - Azure OpenAI keyword generation
         │     - SERP API PAA fetching
         │     - Excel export patterns
         │
         └─→ llm-presence-tracker/main.js
               - Enriched CSV input
```

### 3. Learning System Feedback Loop
```
Analysis Run N
      │
      ├─→ Save good examples (score >= 75%)
      │     to examples-library.json
      │
Analysis Run N+1
      │
      └─→ Load examples-library.json
          Find similar examples
          Use as context in AI prompt
          Generate better recommendations
```

---

## 🔄 Iterative Improvement Workflow

```
┌─────────────────────────────────────────────────────┐
│  ITERATION CYCLE                                     │
│                                                      │
│  1. Run analysis                                     │
│     └─→ Get baseline scores & recommendations       │
│                                                      │
│  2. Implement improvements                           │
│     └─→ Update actual web pages                     │
│                                                      │
│  3. Re-run analysis (same URLs)                      │
│     └─→ Compare new vs old scores                   │
│                                                      │
│  4. Learning system observes:                        │
│     - What improved scores?                          │
│     - Which recommendations worked?                  │
│     - What patterns emerge?                          │
│                                                      │
│  5. Future analyses benefit:                         │
│     - Better recommendations                         │
│     - More relevant examples                         │
│     - Higher success rate                            │
│                                                      │
│  6. Repeat cycle ────────────────────┐              │
│     └─────────────────────────────────┘              │
└─────────────────────────────────────────────────────┘
```

---

Created: November 2025  
Version: 1.0  
Status: Production


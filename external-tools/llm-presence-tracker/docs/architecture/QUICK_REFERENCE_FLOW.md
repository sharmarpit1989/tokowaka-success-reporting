# Quick Reference Flow

## 🚀 Simple 3-Step Process

```
┌─────────────────┐
│  1. INPUT       │
│  CSV with URLs  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  2. ANALYZE     │
│  Run main.js    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  3. OUTPUT      │
│  CSV + JSON     │
└─────────────────┘
```

---

## 📋 Input Options (Choose One)

### Option A: Quick Start (Minimal)
```bash
# Just URLs
echo "URL,Traffic
https://example.com,100K" > urls.csv

node main.js --csv urls.csv --aikey KEY
```

### Option B: Data-Driven (Manual)
```bash
# URLs + manually exported search queries
# Export from Google Search Console first
echo "URL,Traffic,Category,Top_Search_Queries,User_Intent
https://example.com,100K,,\"query1; query2\",transactional" > urls.csv

node main.js --csv urls.csv --aikey KEY
```

### Option C: Automated (NEW!)
```bash
# Auto-generate queries using PAA
node auto-populate-queries.js --csv urls.csv --output enriched.csv
node main.js --csv enriched.csv --aikey KEY
```

---

## 🔬 What Happens Inside

```
┌──────────────────────────────────────────────────────┐
│  FOR EACH URL:                                       │
│                                                      │
│  1. 🌐 FETCH                                        │
│     Chrome → Load URL → Get HTML                    │
│                                                      │
│  2. 🏷️ CLASSIFY                                     │
│     Detect page type (Tool, Blog, Docs, etc.)       │
│                                                      │
│  3. 📊 ANALYZE (6 dimensions)                       │
│     ├─ Freshness      (Has 2025? Prices?)          │
│     ├─ Answerability  (Questions? Steps?)           │
│     ├─ Query Align    (Natural language?)           │
│     ├─ Snippet        (Meta desc? First para?)      │
│     ├─ Authority      (HTTPS? Structured data?)     │
│     └─ Structure      (H1-H3? Lists? Readable?)     │
│                                                      │
│  4. ⚖️ WEIGHT                                       │
│     Apply page-type-specific weights                │
│     (Blog = more freshness, Tool = more steps)      │
│                                                      │
│  5. 💯 SCORE                                        │
│     Calculate: Score = Σ(metric × weight)           │
│     Result: 0-100% (Poor/Fair/Good/Excellent)       │
│                                                      │
│  6. 🤖 AI INSIGHTS (if --aikey)                    │
│     Azure OpenAI → 3-5 specific recommendations     │
│                                                      │
│  7. 📚 LEARN (if not --disable-learning)           │
│     Save good examples for future improvement       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 📤 What You Get

### 1. Summary CSV
```
Original columns + 22 new analysis columns

Example row:
URL: https://example.com/tool
LLM_Presence_Score: 76.3%
Page_Type: Online Tool
Freshness_Score: 65%
Answerability_Score: 85%
Has_Questions: Yes
AI_Summary: "1. Add FAQ... 2. Improve..."
```

### 2. Individual JSON Files
```json
{
  "url": "https://example.com",
  "llm_presence_score": 0.763,
  "pageType": "Online Tool",
  "metrics": {
    "freshness": {...},
    "answerability": {...},
    ...
  },
  "recommendations": [...]
}
```

### 3. Console Summary
```
✅ Analysis complete!
Processed 10 URLs
Average Score: 72.4%

📊 Summary Report:
   - Excellent: 2
   - Good: 5
   - Fair: 3
   - Poor: 0
```

---

## 🎯 Common Workflows

### Workflow 1: Quick Audit
```bash
# Use minimal CSV
node main.js --csv my-urls.csv --aikey KEY

# Review scores
# Implement top recommendations
# Done!
```

### Workflow 2: Full Optimization
```bash
# Step 1: Auto-generate queries
node auto-populate-queries.js --csv urls.csv --output enriched.csv

# Step 2: Run analysis
node main.js --csv enriched.csv --aikey KEY

# Step 3: Review & implement
# Open output CSV, sort by score, fix lowest

# Step 4: Re-analyze
node main.js --csv urls.csv --aikey KEY

# Step 5: Compare before/after
# Scores improved? ✅
```

### Workflow 3: Continuous Monitoring
```bash
# Month 1: Baseline
node main.js --csv all-pages.csv --aikey KEY --output-dir month1

# Month 2: Re-analyze
node main.js --csv all-pages.csv --aikey KEY --output-dir month2

# Compare month1 vs month2 CSVs
# Track improvements over time
```

---

## 🔍 Decision Tree: Which Option?

```
Do you have Google Search Console access?
│
├─ YES → Do you want maximum precision?
│   │
│   ├─ YES → Use Option B (Manual GSC export)
│   │         Best for: Established pages with traffic
│   │
│   └─ NO → Use Option C (Auto-generate)
│             Fast enough, good enough
│
└─ NO → Use Option C (Auto-generate)
          Works without GSC access
          
Just testing the tool?
└─ Use Option A (Minimal)
   Simplest to start
```

---

## ⏱️ Time Estimates

### Per URL Analysis Time

**Without AI:**
- Page fetch: 2-3 sec
- Analysis: 1-2 sec
- **Total: ~3-5 sec/URL**

**With AI (recommended):**
- Page fetch: 2-3 sec
- Analysis: 1-2 sec
- AI insights: 3-5 sec
- **Total: ~8-12 sec/URL**

### Batch Analysis

**100 URLs:**
- Without AI: ~5-8 minutes
- With AI: ~15-20 minutes
- With auto-populate: +3-5 minutes

**Parallel processing:** 5 URLs at once (built-in)

---

## 💡 Pro Tips

### 1. Start Small
```bash
# Test with 3-5 URLs first
head -6 large-file.csv > test.csv
node main.js --csv test.csv --aikey KEY
```

### 2. Disable Learning Initially
```bash
# First 10-20 analyses
node main.js --csv urls.csv --aikey KEY --disable-learning

# Once you have quality examples, enable it
node main.js --csv urls.csv --aikey KEY
```

### 3. Focus on Low Scorers
```bash
# After analysis, open CSV
# Sort by LLM_Presence_Score (ascending)
# Fix bottom 20% first
# Biggest impact for effort
```

### 4. Batch by Page Type
```bash
# Analyze all tools together
echo "URL
https://site.com/tool1
https://site.com/tool2" > tools.csv

node main.js --csv tools.csv --aikey KEY

# Then all blogs
# Then all product pages
# Learning system gets domain-specific
```

---

## 🚨 Common Issues & Quick Fixes

### "Chrome not found"
```bash
# Install Chrome/Chromium
# Or set path:
export CHROME_PATH=/path/to/chrome
```

### "API key not provided"
```bash
# Set environment variable
export AZURE_OPENAI_KEY=your_key
# Or pass inline:
node main.js --csv urls.csv --aikey your_key
```

### "Rate limit exceeded"
```bash
# Wait 1 minute, retry
# Or upgrade Azure OpenAI quota
```

### "Low quality recommendations"
```bash
# Clear learning library
rm examples-library.json
# Rebuild with good examples
node main.js --csv urls.csv --aikey KEY --disable-learning
```

---

## 📊 Score Interpretation

```
┌────────────┬──────────┬─────────────────────────┐
│ Score      │ Rating   │ Action                  │
├────────────┼──────────┼─────────────────────────┤
│ 80-100%    │ Excellent│ Maintain, minor tweaks  │
│ 60-79%     │ Good     │ Optimize top 2 factors  │
│ 40-59%     │ Fair     │ Major improvements      │
│ 0-39%      │ Poor     │ Complete overhaul       │
└────────────┴──────────┴─────────────────────────┘
```

### Score Drivers by Page Type

**Online Tools:**
- Answerability (30%) - Clear steps?
- Snippet Quality (20%) - Good first para?
- Query Alignment (20%) - Matches searches?

**Blog Posts:**
- Freshness (35%) - Current year? Recent dates?
- Query Alignment (20%) - Natural language?
- Answerability (20%) - Answers questions?

**Documentation:**
- Answerability (30%) - Complete info?
- Structure (15%) - Well organized?
- Authority (15%) - Official source?

---

## 🎓 Learning Curve

```
Day 1:  Run first analysis (1 hour)
        Understand output format
        
Week 1: Implement recommendations (3-5 hours)
        Re-analyze to see improvements
        
Month 1: Build learning library (ongoing)
         System gets smarter
         
Month 3: Optimized workflow
         Continuous monitoring
         Iterative improvements
```

---

Created: November 2025  
For full details: [FLOW_DIAGRAM.md](FLOW_DIAGRAM.md)


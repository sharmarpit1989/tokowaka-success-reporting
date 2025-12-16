# Quick Start Guide

Get started with LLM Presence Tracker in **two ways**:
1. **🔥 RUM Mode** (Recommended for Adobe sites) - Automatic data fetching
2. **📄 CSV Mode** (For any site) - Manual data preparation

---

## Option 1: RUM Mode (Recommended) 🚀

**Best for:** Adobe sites with RUM tracking installed
**Setup time:** 5 minutes
**Data:** Automatic and real-time

### Quick Setup

```bash
# Install dependencies
npm install

# Set your RUM admin key
$env:RUM_ADMIN_KEY = "your-rum-admin-key"

# Analyze any domain - no CSV needed!
node main-rum.js --domain www.example.com
```

**That's it!** The tool will automatically:
- Fetch traffic data from RUM API
- Get Core Web Vitals (LCP, CLS, INP, TTFB)
- Analyze top pages by priority
- Generate comprehensive reports

**See [SETUP_RUM.md](../../SETUP_RUM.md) for complete RUM setup guide.**

---

## Option 2: CSV Mode 📄

**Best for:** External sites, one-time analysis
**Setup time:** 10 minutes
**Data:** Manual CSV creation

## Installation

Since this tool uses dependencies from the parent project, install them first:

```bash
# From the parent directory
cd ..
npm install

# Return to llm-presence-tracker
cd llm-presence-tracker
```

No separate `npm install` needed - dependencies are shared!

## Basic Usage

### 1. Prepare Your URLs

Create a CSV file with URLs to analyze:

```csv
URL,Traffic,Category
https://example.com/product,50000,Product
https://example.com/blog,25000,Blog
```

Or use the provided `sample-urls.csv`.

### 2. Run Analysis

```bash
node main.js --csv sample-urls.csv
```

### 3. View Results

Check the `output/` directory for:
- **CSV Summary** - All metrics in spreadsheet format
- **JSON Reports** - Detailed analysis per URL
- **Summary Report** - Overall statistics

## Advanced Usage

### With AI-Powered Insights

Get enhanced recommendations from Azure OpenAI:

```bash
node main.js --csv urls.csv --aikey YOUR_AZURE_OPENAI_KEY
```

The AI will provide specific, actionable recommendations for each URL.

### Custom Output Directory

```bash
node main.js --csv urls.csv --output-dir my-analysis
```

## Understanding the Output

### CSV Columns Explained

| Column | Range | Meaning |
|--------|-------|---------|
| **LLM_Presence_Score** | 0-100 | Overall discoverability score |
| **Score_Rating** | Text | Excellent/Good/Fair/Poor |
| **Freshness_Score** | 0-100 | How current the content is |
| **Answerability_Score** | 0-100 | How directly it answers questions |
| **Query_Alignment_Score** | 0-100 | Alignment with search queries |
| **Snippet_Quality_Score** | 0-100 | Optimization for snippets |
| **Authority_Score** | 0-100 | Trust and authority signals |
| **Structure_Score** | 0-100 | Content organization quality |

### Quick Score Interpretation

- **80-100**: Excellent - Maintain current approach
- **60-79**: Good - Minor optimizations needed
- **40-59**: Fair - Significant improvements needed
- **0-39**: Poor - Major overhaul required

## Example Output

### Console Output
```
2025-01-25T10:30:00.000Z - INFO - Loaded 5 URLs from sample-urls.csv
2025-01-25T10:30:05.000Z - INFO - Analyzing https://example.com/product...
2025-01-25T10:30:08.000Z - INFO - ✅ https://example.com/product - Score: 85% (Excellent)
...

📊 Summary Report:
   Total URLs: 5
   Successful: 5
   Failed: 0
   Average Score: 78.4%

📁 Output files:
   CSV: output/llm-presence-summary_2025-01-25T10-30-00.csv
   Report: output/llm-presence-report_2025-01-25T10-30-00.json
```

### JSON Output (per URL)
```json
{
  "url": "https://example.com/product",
  "llm_presence_score": 0.85,
  "interpretation": {
    "rating": "Excellent",
    "summary": "Highly discoverable by LLMs"
  },
  "metrics": {
    "freshness": {
      "score": 0.90,
      "hasCurrentYear": true,
      "hasPricing": true
    },
    "answerability": {
      "score": 0.88,
      "hasQuestions": true,
      "hasDefinitions": true
    }
  },
  "recommendations": [
    {
      "category": "Freshness",
      "text": "Content freshness is good - maintain regular updates"
    }
  ]
}
```

## Common Use Cases

### 1. Content Audit

Analyze your entire website to identify pages that need optimization:

```bash
node main.js --csv all-pages.csv
```

Review the CSV to find pages with scores below 60%.

### 2. Competitive Analysis

Compare your content against competitors:

```bash
# Create a CSV with your URLs and competitor URLs
node main.js --csv comparison.csv
```

### 3. Content Improvement Tracking

Run analysis before and after content updates:

```bash
# Before
node main.js --csv pages.csv --output-dir analysis-before

# After updates
node main.js --csv pages.csv --output-dir analysis-after
```

Compare the two reports to measure improvement.

### 4. AI-Enhanced Recommendations

Use Azure OpenAI for specific improvement suggestions:

```bash
node main.js --csv priority-pages.csv --aikey YOUR_KEY
```

## Tips for Better Results

### 1. Target High-Traffic Pages First
Focus on pages with significant traffic for maximum impact.

### 2. Look for Quick Wins
Pages scoring 60-79% often need just minor tweaks:
- Add current year mentions
- Include a few bullet lists
- Add clear question-based headings

### 3. Prioritize by Intent
- **Awareness** pages: Focus on definitions and explanations
- **Consideration** pages: Add comparisons and feature details
- **Conversion** pages: Include pricing, steps, and FAQs

### 4. Batch Similar Pages
Analyze similar page types together to identify patterns:
- All product pages
- All blog posts
- All documentation pages

## Troubleshooting

### "Chrome not found" Warning

This is normal - Puppeteer will use its bundled Chrome. To use system Chrome:

- **macOS**: Install Chrome to `/Applications/`
- **Windows**: Install to default location
- **Linux**: Install `google-chrome-stable`

### "CSV file not found" Error

Ensure the CSV path is correct:
```bash
# Relative path
node main.js --csv sample-urls.csv

# Absolute path
node main.js --csv /full/path/to/urls.csv
```

### Low Scores for Good Content

Some factors the tool can't measure:
- Brand recognition
- Domain authority history
- Backlink quality

Focus on the specific recommendations provided.

## Next Steps

1. **Analyze** your key pages
2. **Identify** low-scoring pages (< 60%)
3. **Implement** top 3 recommendations per page
4. **Re-analyze** after 1-2 weeks
5. **Track** score improvements over time

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review example outputs in `output/` after first run
- See analyzer source code in `analyzers/` for scoring logic

Happy optimizing! 🚀


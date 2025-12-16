# LLM Presence Tracker

Analyze and track how discoverable your web pages are to Large Language Models (LLMs) like ChatGPT, Claude, and Perplexity.

---

## 📁 Project Structure

```
llm-presence-tracker/
├── 📄 README.md              ← You are here
├── 📄 main.js                ← Main analysis script
├── 📄 auto-populate-queries.js ← Query generation utility
├── 📂 docs/                  ← All documentation (25+ files)
├── 📂 samples/               ← Sample CSV files
├── 📂 analyzers/             ← Analysis modules
└── 📂 output/                ← Generated results
```

🎯 **[Documentation Hub](docs/README.md)** - Browse all documentation organized by category

---

## 📚 Documentation & Guides

→ **[Complete Documentation Index](docs/README.md)** - Browse all 25+ documentation files

### Quick Links
- 🚀 **[Quick Start Guide](docs/guides/QUICKSTART.md)** - Get started in 10 minutes
- 🎯 **[System Overview](docs/architecture/SYSTEM_OVERVIEW.md)** - One-page visual summary
- ⚡ **[Quick Reference Flow](docs/architecture/QUICK_REFERENCE_FLOW.md)** - Workflows & pro tips
- 📊 **[Detailed Flow Diagram](docs/architecture/FLOW_DIAGRAM.md)** - Complete architecture
- 📖 **[Full Project Blog](docs/meta/BLOG.md)** - Evolution story & blindspots fixed

## What It Does

This tool analyzes web pages to measure their "LLM presence" - how likely they are to be found, cited, and used by AI systems when answering user queries.

## 🚀 RUM API Integration - NEW! 🔥

**Automatic data fetching - no more manual CSVs!** Integrate with Adobe's Real User Monitoring API:

```bash
# Analyze any domain automatically
node main-rum.js --domain www.example.com

# Find optimization opportunities
node main-rum.js --domain www.example.com --mode opportunities
```

**What you get:**
- ✅ **Automatic traffic data** (pageviews, organic, paid, owned)
- ✅ **Core Web Vitals** (LCP, CLS, INP, TTFB)
- ✅ **Engagement metrics** (bounce rate, engagement %)
- ✅ **Smart prioritization** (analyzes high-impact pages first)
- ✅ **Device breakdown** (desktop vs mobile)
- ✅ **No manual work** (set it and forget it!)

**Quick Setup:** See [SETUP_RUM.md](SETUP_RUM.md) for 5-minute setup guide.
**Full Guide:** See [RUM API Integration Guide](docs/guides/RUM_API_INTEGRATION.md) for advanced usage.

## 🎯 Features

### 1. Automatic Search Query Generation 🔍 NEW!

**No more manual CSV exports!** Automatically generate `Top_Search_Queries` using AI + Google PAA:

- **Auto-extracts topics** from URLs
- **Generates search keywords** via Azure OpenAI
- **Fetches PAA questions** from Google SERP
- **Detects user intent** automatically
- **100x faster** than manual GSC export

```bash
# Step 1: Auto-generate queries
node auto-populate-queries.js --csv sample-urls-minimal.csv --output enriched.csv

# Step 2: Run analysis with enriched data
node main.js --csv enriched.csv --aikey YOUR_KEY
```

See [AUTO_QUERY_GENERATION.md](docs/guides/AUTO_QUERY_GENERATION.md) for details.

### 2. Self-Improving Learning System 🧠

The tool now **learns from every URL you analyze** and gets smarter over time:

- **Learns Patterns**: Extracts successful strategies from each analysis
- **Finds Similar Pages**: Matches new pages with relevant past examples
- **Applies Best Practices**: Uses proven recommendations for similar scenarios
- **Improves Continuously**: Gets better with every URL analyzed

**Example:** After analyzing 10 tool pages, it learns that tool pages need step-by-step guides and "free" emphasis, and automatically applies these patterns to new tool pages.

See [LEARNING_SYSTEM.md](docs/features/LEARNING_SYSTEM.md) for details.

### 2. Data-Driven Recommendations 📊 NEW!

Recommendations now based on **real user search behavior** instead of generic SEO:

- **Uses Actual Search Queries**: Aligns with what users actually search for
- **Intent-Aware**: Adapts to informational vs transactional intent
- **Domain-Specific**: Learns your business's unique patterns
- **ROI-Focused**: Suggests content users are actually looking for

See [DATA_DRIVEN_RECOMMENDATIONS.md](docs/guides/DATA_DRIVEN_RECOMMENDATIONS.md) for details.

### 3. Automatic Page Type Classification

The tool automatically identifies what type of page it's analyzing:

- **20+ Page Types**: Product Page, Blog Post, Online Tool, Tutorial, Documentation, etc.
- **AI-Powered**: Uses Azure OpenAI for accurate classification (optional)
- **Heuristic Fallback**: Works without AI using URL/content patterns
- **Multi-Label**: Can identify primary + secondary page types

See [PAGE_TYPE_CLASSIFICATION.md](docs/features/PAGE_TYPE_CLASSIFICATION.md) for details.

### 4. Page Type-Specific Scoring

Different page types are scored with different priorities:

- **Online Tools**: Prioritize instructions (answerability) over freshness
- **Blog Posts**: Prioritize freshness (35% weight) over authority
- **Documentation**: Prioritize structure and comprehensive answers
- **Pricing Pages**: Prioritize current pricing (freshness critical!)

**Result:** Your scores are now **contextually relevant**! An online tool without dates isn't penalized, but a blog post without dates is.

See [PAGE_TYPE_SCORING.md](docs/features/PAGE_TYPE_SCORING.md) for full weight breakdown.

## Key Metrics Tracked

### 1. Content Freshness (20%)
- Current year mentions
- Time-sensitive data (pricing, versions)
- Publication/update dates
- Freshness keywords

### 2. Direct Answerability (25%)
- Question-answer patterns
- Clear definitions
- Step-by-step procedures
- Comparison content
- Structured data (JSON-LD)

### 3. Query Alignment (15%)
- Natural language query patterns
- Key phrase extraction
- Search-optimized content
- Snippet-worthy sentences

### 4. Authority Signals (15%)
- Domain authority
- Official source status
- Citation quality
- Trustworthiness indicators

### 5. Content Structure (10%)
- Heading hierarchy (H1, H2, H3)
- Lists and tables
- Readability score
- Content organization

### 6. Snippet Optimization (15%)
- First paragraph quality
- Meta description
- Featured snippet potential
- Citation-ready content

## Installation

This tool uses dependencies from the parent project:

```bash
# No separate installation needed if parent project is set up
cd ..
npm install
cd llm-presence-tracker
```

## Usage

### Basic Analysis

Analyze URLs from a CSV file:

```bash
# Minimal CSV (just URL and Traffic)
node main.js --csv samples/sample-urls-minimal.csv

# Full CSV (with search query data for better AI recommendations)
node main.js --csv samples/sample-urls-with-search-data.csv
```

📁 **See [SAMPLE_FILES.md](docs/guides/SAMPLE_FILES.md)** for a complete guide to the sample CSV files and which one to use.

### With Azure OpenAI Enhancement

Get AI-powered insights using Azure OpenAI:

```bash
node main.js --csv sample-urls.csv --aikey YOUR_AZURE_OPENAI_KEY
```

### Custom Output Directory

```bash
node main.js --csv urls.csv --output-dir my-analysis
```

### Command Line Options

- `--csv <file>` - CSV file with URLs to analyze (required)
- `--output-dir <dir>` - Output directory (default: `output`)
- `--aikey <key>` - Azure OpenAI API key for enhanced analysis (optional)
- `--help, -h` - Show help message

## Input Format

### Minimal CSV (Required columns only)

```csv
URL,Traffic
https://example.com/product,50000
https://example.com/blog/guide,25000
```

Minimum required: Just a URL column. Traffic is optional but recommended.

### Extended CSV (With search query data for data-driven recommendations)

```csv
URL,Traffic,Category,Top_Search_Queries,User_Intent
https://example.com/product,50000,Product,"keyword 1; keyword 2; keyword 3",transactional
https://example.com/blog/guide,25000,Blog,"how to guide; tutorial",informational
```

**Optional columns:**
- `Top_Search_Queries` - Semicolon-separated search queries (**manually exported from GSC/Ahrefs**)
- `User_Intent` - One of: `informational`, `transactional`, `navigational`, `commercial`

📊 **[GSC & Ahrefs Integration Guide](docs/guides/GSC_AHREFS_INTEGRATION_GUIDE.md)** - Step-by-step guide to export and format search query data from Google Search Console or Ahrefs.

See also: [DATA_DRIVEN_RECOMMENDATIONS.md](docs/guides/DATA_DRIVEN_RECOMMENDATIONS.md) for details on how the tool uses this data.

## Output Files

### 1. Per-URL Analysis Files
- `{domain}/llm-presence-{url}-{timestamp}.json` - Detailed metrics
- `{domain}/enhanced-content-{url}-{timestamp}.txt` - Extracted content

### 2. Summary Files
- `{domain}/llm-presence-summary_{timestamp}.csv` - All metrics in CSV
- `{domain}/llm-presence-report_{timestamp}.json` - Complete analysis

### 3. CSV Output Columns

Original columns from input CSV are preserved, plus:

- **LLM_Presence_Score** (0-1) - Overall discoverability score
- **Freshness_Score** (0-1) - Content freshness
- **Answerability_Score** (0-1) - Direct answer quality
- **Query_Alignment_Score** (0-1) - Search query match
- **Authority_Score** (0-1) - Source authority
- **Structure_Score** (0-1) - Content organization
- **Snippet_Quality_Score** (0-1) - Snippet optimization
- **Has_Current_Year** (boolean)
- **Has_Pricing** (boolean)
- **Has_Questions** (boolean)
- **Has_Definitions** (boolean)
- **Has_Steps** (boolean)
- **Has_Comparisons** (boolean)
- **H1_Count** - Number of H1 headings
- **H2_Count** - Number of H2 headings
- **List_Count** - Number of lists
- **Top_Phrases** - Top 10 key phrases
- **Intent_Awareness** - Covers awareness queries
- **Intent_Consideration** - Covers consideration queries
- **Intent_Conversion** - Covers conversion queries
- **AI_Summary** (if --aikey provided) - AI-generated insights

## Understanding Scores

### LLM Presence Score Breakdown

| Score Range | Interpretation | Action |
|------------|----------------|---------|
| 0.80 - 1.00 | Excellent | Maintain and expand |
| 0.60 - 0.79 | Good | Minor optimizations |
| 0.40 - 0.59 | Fair | Significant improvements needed |
| 0.00 - 0.39 | Poor | Major overhaul required |

### What Makes Content "LLM-Discoverable"

Based on analysis of ChatGPT's search behavior:

1. **Fresh, time-sensitive data** (triggers search)
2. **Direct, concise answers** in first paragraphs
3. **Natural language** question-answer format
4. **Structured content** (lists, tables, headings)
5. **Clear citations** and factual statements
6. **Specific details** (prices, dates, versions)
7. **Comparative content** ("X vs Y")
8. **Multiple related pages** on same domain

## Example Output

```json
{
  "url": "https://example.com/product",
  "llm_presence_score": 0.85,
  "freshness": {
    "score": 0.90,
    "has_current_year": true,
    "has_pricing": true,
    "freshness_keyword_count": 12
  },
  "answerability": {
    "score": 0.88,
    "has_questions": true,
    "has_definitions": true,
    "has_steps": true,
    "has_json_ld": true
  },
  "query_alignment": {
    "score": 0.82,
    "top_phrases": [
      "latest features",
      "how to use",
      "best practices"
    ]
  },
  "authority": {
    "score": 0.95,
    "is_official_source": true,
    "domain_authority": 85
  }
}
```

## Architecture

This tool reuses components from the parent project:

- **Text Processing**: `../utils/utils.js`
  - HTML parsing and text extraction
  - Word counting and tokenization
  - Content diff analysis
  
- **Azure OpenAI**: Pattern from `../main.js`
  - Chat completions API
  - Prompt engineering
  - Response handling

- **Browser Automation**: Puppeteer from parent
  - Page rendering
  - Dynamic content capture
  - Network interception

## Related Tools

- **Parent Project**: Core web scraping and analysis
- **LLMO Analyzer**: Brand presence in LLM responses
- **Profound Analyzer**: Deep content analysis

## Contributing

This is part of the Tokowaka utilities suite. See parent README for contribution guidelines.

## License

Same as parent project.


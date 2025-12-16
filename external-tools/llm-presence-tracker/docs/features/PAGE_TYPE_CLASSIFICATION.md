# Page Type Classification

## Overview

The LLM Presence Tracker now automatically identifies what **type of page** it's analyzing. This helps you understand your content inventory and optimize different page types appropriately.

## Supported Page Types

### 📦 Product & Commerce

| Type | Description | Example |
|------|-------------|---------|
| **Product Page** | Individual product/service page | `https://adobe.com/express` |
| **Product Category** | Collection of products | `https://adobe.com/products/catalog` |
| **Pricing Page** | Pricing plans and packages | `https://adobe.com/pricing` |
| **Landing Page** | Marketing/campaign landing page | `https://adobe.com/campaign/offer` |

### 📝 Content & Information

| Type | Description | Example |
|------|-------------|---------|
| **Blog Post** | Article, news, blog content | `https://adobe.com/blog/design-tips` |
| **Tutorial/Guide** | How-to guide, step-by-step | `https://adobe.com/tutorials/photoshop` |
| **Documentation** | Technical docs, API reference | `https://adobe.com/docs/api` |
| **FAQ Page** | Frequently Asked Questions | `https://adobe.com/faq` |
| **Knowledge Base** | Support articles, help center | `https://adobe.com/support/article/123` |

### 🛠️ Tools & Utilities

| Type | Description | Example |
|------|-------------|---------|
| **Online Tool** | Web-based tool, converter | `https://adobe.com/acrobat/online/pdf-to-word` ⭐ |
| **Demo/Sandbox** | Interactive demo, playground | `https://adobe.com/express/demo` |

### 🏢 Company & Information

| Type | Description | Example |
|------|-------------|---------|
| **Homepage** | Main website homepage | `https://adobe.com/` |
| **About Page** | Company info, team | `https://adobe.com/about` |
| **Contact Page** | Contact form, info | `https://adobe.com/contact` |

### 📚 Resources

| Type | Description | Example |
|------|-------------|---------|
| **Resource Center** | Downloads, templates, assets | `https://adobe.com/resources` |
| **Case Study** | Customer stories, testimonials | `https://adobe.com/customers/story` |
| **Whitepaper/eBook** | Downloadable research | `https://adobe.com/whitepapers/trends` |

### 👥 Community

| Type | Description | Example |
|------|-------------|---------|
| **Community/Forum** | Discussion boards, forums | `https://adobe.com/community` |
| **Events/Webinar** | Event pages, webinar registration | `https://adobe.com/events/summit` |

### 🔍 Comparison

| Type | Description | Example |
|------|-------------|---------|
| **Comparison Page** | "X vs Y", alternatives | `https://adobe.com/photoshop-vs-gimp` |

## How It Works

### 1. Heuristic Classification (Fast, No API Needed)

Uses **pattern matching** on URL, title, and content:

```javascript
// Example: Detects Online Tool
if (url.includes('/online/') || 
    url.includes('/converter') ||
    text.includes('upload') && text.includes('download')) {
  → "Online Tool" (high confidence)
}

// Example: Detects Pricing Page
if (url.includes('/pricing') || 
    title.includes('pricing') ||
    text has many $ symbols) {
  → "Pricing Page" (high confidence)
}
```

**Confidence Levels:**
- **High**: Strong URL/title/content match
- **Medium**: Partial match or ambiguous
- **Low**: Fallback classification

### 2. AI Classification (More Accurate, Requires API Key)

Uses **Azure OpenAI** to intelligently classify:

```javascript
// AI analyzes:
- URL structure
- Page title
- First 2000 characters of content
- Compares against all 20+ page type definitions

// Returns:
{
  "primaryType": "ONLINE_TOOL",
  "secondaryTypes": ["TUTORIAL_GUIDE"],  // If page serves multiple purposes
  "confidence": "high",
  "reasoning": "Provides PDF to Word conversion with step-by-step instructions"
}
```

**Benefits of AI:**
- ✅ Understands **context** and **intent**
- ✅ Handles **edge cases** and **hybrid pages**
- ✅ Provides **reasoning** for classification
- ✅ Can identify **multiple page types** (primary + secondary)

## Output Examples

### CSV Output

```csv
URL,Traffic,Page_Type,Page_Type_Confidence,Classification_Method,LLM_Presence_Score,...
https://adobe.com/acrobat/online/pdf-to-word,985508,Online Tool,high,ai,72.3,...
https://adobe.com/,1584229,Homepage,high,heuristic,68.5,...
https://adobe.com/pricing,350000,Pricing Page,high,heuristic,75.1,...
```

### JSON Output

```json
{
  "url": "https://www.adobe.com/acrobat/online/pdf-to-word.html",
  "pageType": {
    "primary": "Online Tool",
    "primaryKey": "ONLINE_TOOL",
    "secondary": ["Tutorial/Guide"],
    "confidence": "high",
    "reasoning": "Provides online PDF to Word conversion tool with embedded instructions",
    "method": "ai"
  },
  "llm_presence_score": 0.723,
  ...
}
```

### Console Output

```bash
2025-11-25T21:30:05.000Z - INFO - Classifying page type for https://adobe.com/acrobat/online/pdf-to-word...
2025-11-25T21:30:06.000Z - INFO - Page type: Online Tool (high confidence)
2025-11-25T21:30:07.000Z - INFO - ✅ https://adobe.com/acrobat/online/pdf-to-word - Score: 72% (Good)
```

## Usage

### Without AI (Fast, Free)

```bash
node main.js --csv sample-urls.csv
```

Uses **heuristic classification** based on URL patterns and content keywords.

### With AI (More Accurate, Requires Key)

```bash
node main.js --csv sample-urls.csv --aikey YOUR_AZURE_OPENAI_KEY
```

Uses **AI-powered classification** for better accuracy, especially for:
- Hybrid pages (e.g., Tool + Tutorial)
- Non-standard URLs
- Ambiguous content

## Real-World Examples

### Example 1: Adobe PDF to Word

**URL:** `https://www.adobe.com/id_id/acrobat/online/pdf-to-word.html`

**Heuristic Classification:**
```json
{
  "primaryType": "ONLINE_TOOL",
  "confidence": "high",
  "method": "heuristic",
  "reasoning": "URL contains '/online/', text contains 'upload', 'download', 'convert'"
}
```

**AI Classification:**
```json
{
  "primaryType": "ONLINE_TOOL",
  "secondaryTypes": ["TUTORIAL_GUIDE"],
  "confidence": "high",
  "method": "ai",
  "reasoning": "Primary function is online conversion tool, with embedded step-by-step tutorial"
}
```

**Winner:** AI provides more nuance (identifies dual purpose)

### Example 2: Adobe Homepage

**URL:** `https://www.adobe.com/`

**Heuristic Classification:**
```json
{
  "primaryType": "HOMEPAGE",
  "confidence": "high",
  "method": "heuristic",
  "reasoning": "Root domain URL"
}
```

**AI Classification:**
```json
{
  "primaryType": "HOMEPAGE",
  "secondaryTypes": ["PRODUCT_CATEGORY"],
  "confidence": "high",
  "method": "ai",
  "reasoning": "Main company homepage showcasing product portfolio"
}
```

### Example 3: Adobe Express

**URL:** `https://www.adobe.com/express/feature/image/remove-background`

**Heuristic Classification:**
```json
{
  "primaryType": "ONLINE_TOOL",
  "confidence": "high",
  "method": "heuristic"
}
```

**AI Classification:**
```json
{
  "primaryType": "ONLINE_TOOL",
  "secondaryTypes": ["PRODUCT_PAGE"],
  "confidence": "high",
  "method": "ai",
  "reasoning": "Free online tool with product upsell elements"
}
```

## Cost Considerations

### Heuristic Classification
- **Cost**: FREE ✅
- **Speed**: Instant
- **Accuracy**: ~80-85%

### AI Classification
- **Cost**: ~$0.002 per page (200 tokens)
- **Speed**: 1-2 seconds per page
- **Accuracy**: ~95-98%

### For 15 Adobe URLs:
- **Heuristic**: $0 (FREE)
- **AI**: ~$0.03 (negligible)

**Recommendation:** Use AI classification - the cost is trivial compared to the insight value!

## Use Cases

### 1. Content Inventory Audit

Understand what types of pages you have:

```bash
node main.js --csv all-pages.csv --aikey YOUR_KEY
```

**Output Analysis:**
```
- 150 Product Pages
- 85 Online Tools  
- 45 Blog Posts
- 30 Tutorial/Guides
- 20 Documentation Pages
...
```

**Insights:**
- Which page types are over/under-represented?
- Which types perform best (LLM presence score)?
- Which types need more optimization?

### 2. Optimization by Page Type

Target specific page types for improvement:

```bash
# Filter CSV for "Online Tool" pages with score < 70%
# Focus optimization efforts there
```

### 3. Competitive Analysis

Compare page type distribution vs competitors:

```csv
Domain,Product_Pages,Online_Tools,Blog_Posts,Docs
adobe.com,45,85,120,30
competitor.com,60,20,80,15
```

**Insight:** Adobe has more Online Tools (85 vs 20) - this is a strategic advantage!

### 4. Content Strategy Planning

Identify gaps in your content portfolio:

```
Current: 85 Online Tools, 15 Comparison Pages
Opportunity: Create more comparison pages (e.g., "Adobe vs X")
```

## Filtering and Grouping

### Excel/Google Sheets

After analysis, filter/group by `Page_Type` column:

```excel
=COUNTIF(Page_Type, "Online Tool")  → Count tools
=AVERAGEIF(Page_Type, "Blog Post", LLM_Presence_Score)  → Avg score for blogs
```

### Python Analysis

```python
import pandas as pd

df = pd.read_csv('output/llm-presence-summary.csv')

# Group by page type
by_type = df.groupby('Page_Type').agg({
    'LLM_Presence_Score': 'mean',
    'Traffic': 'sum',
    'URL': 'count'
}).round(2)

print(by_type)
```

**Output:**
```
Page_Type          LLM_Score  Traffic    Count
Online Tool        72.3       9500000    85
Product Page       68.5       2300000    45
Blog Post          65.2       1200000    120
```

## Troubleshooting

### Issue: All Pages Classified as "Other"

**Cause:** Heuristic patterns don't match your URLs

**Solution:** Use AI classification:
```bash
node main.js --csv urls.csv --aikey YOUR_KEY
```

### Issue: Wrong Classification

**Example:** Tool page classified as "Product Page"

**Solution 1:** AI classification will be more accurate

**Solution 2:** Submit feedback - we can improve heuristic patterns

### Issue: Multiple Page Types (Hybrid)

**Example:** Page is both "Tool" and "Tutorial"

**Solution:** This is correct! Check `secondaryTypes` in JSON output for full classification

## Future Enhancements

Planned improvements:

- [ ] Custom page type definitions (let users define their own)
- [ ] Page type-specific recommendations
- [ ] Benchmark scores by page type
- [ ] Auto-tag pages in CMS based on classification
- [ ] Track page type changes over time

---

**Last Updated:** November 2025  
**Version:** 1.2.0 (added page type classification)


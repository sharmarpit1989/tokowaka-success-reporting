# Data-Driven AI Recommendations

## Overview

The LLM Presence Tracker now generates **data-driven recommendations** based on **real user search behavior** instead of generic SEO best practices.

## The Problem with Generic Recommendations

**Before:**
```
❌ "Discover the latest QR code trends for 2025"
❌ "Add a blog section about QR code history"
❌ "Create comparison tables for different QR code types"
```

**Issues:**
- Not based on actual user queries
- May not align with business goals
- Generic advice anyone could give
- Wastes development resources on content nobody searches for

## The Solution: Real Search Data

**After:**
```
✅ "Add FAQ: 'How to make QR code free?' (matches search query)"
✅ "Add H2: 'Create QR Code Online Instantly' (users search 'create qr code online')"
✅ "Emphasize 'free' in first paragraph (appears in 2 top queries)"
```

**Benefits:**
- Based on actual search queries
- Aligns with user intent
- Targets keywords driving traffic
- Higher ROI on content improvements

---

## How to Use

### Step 1: Add Search Query Data to CSV

```csv
URL,Traffic,Category,Top_Search_Queries,User_Intent
https://example.com/tool,100K,,"keyword 1; keyword 2; keyword 3",transactional
```

**Columns:**
- `Top_Search_Queries`: Semicolon-separated list of actual search queries
- `User_Intent`: `informational`, `transactional`, `navigational`, or `commercial`

### Step 2: Get Real Search Data (Manual Process)

**⚠️ Important:** The tool does NOT automatically fetch this data. You must manually export and add it to your CSV.

#### Google Search Console (Best Source)
1. Go to Search Console → Performance
2. Filter by specific page URL
3. Click "Export" → Download as CSV
4. Copy top 10-20 queries
5. **Manually add** to your input CSV as semicolon-separated list

#### SEMrush / Ahrefs
1. Enter your URL in keyword research tool
2. View "Organic Keywords" report
3. Export top keywords (CSV/Excel)
4. **Manually copy** keywords to your input CSV

#### Internal Site Search
1. Go to Analytics → Site Search
2. Filter by landing page
3. Export top search queries
4. **Manually add** to your CSV

#### Customer Support Questions
1. Review support tickets for the page
2. Extract common questions
3. **Manually format** as queries in CSV

**No API Integrations Yet:** Direct API connections to GSC/Ahrefs/etc. are planned but not yet implemented. Currently, you must manually export and paste data into your CSV file.

### Step 3: Format Your CSV

Your input CSV should look like this:

```csv
URL,Traffic,Category,Top_Search_Queries,User_Intent
https://example.com/tool,100K,Tools,"qr code generator free; create qr code online; how to make qr code",transactional
https://example.com/guide,50K,Blog,"how to use qr codes; qr code best practices",informational
```

**Key Points:**
- `Top_Search_Queries`: Semicolon-separated (`;`) list of actual search queries
- `User_Intent`: One of `informational`, `transactional`, `navigational`, `commercial`
- These columns are **optional** but highly recommended for better AI recommendations

### Step 4: Run Analysis

```bash
node main.js --csv your-data.csv --aikey YOUR_KEY
```

---

## Real Examples

### Example 1: QR Code Generator Page

**Search Query Data:**
```
Top_Search_Queries: "qr code generator free; create qr code online; how to make qr code"
User_Intent: transactional
```

**AI Recommendations:**
```
1. Add FAQ: "How to make QR code free?" ← Direct match!
2. Add H2: "Create QR Code Online Instantly" ← Matches query!
3. Add CTA: "Start creating your free QR code now!" ← Aligns with intent!
```

### Example 2: PDF to Word Converter

**Search Query Data:**
```
Top_Search_Queries: "pdf to word converter free; convert pdf to word online"
User_Intent: transactional
```

**AI Recommendations:**
```
1. Ensure "free" appears in first 120 chars ← Key search term!
2. Add H2: "Free PDF to Word Converter Online" ← Exact match!
3. Prioritize clear CTA over educational content ← Transactional intent!
```

---

## User Intent Types

### Informational
**Searches:** "how to", "what is", "guide to"
**Recommendations:** Add FAQs, tutorials, definitions, comparisons

### Transactional
**Searches:** "free tool", "online converter", "generator"
**Recommendations:** Clear CTAs, emphasize "free", step-by-step guides

### Navigational
**Searches:** "adobe", "brand name + product"
**Recommendations:** Clear branding, product overview, feature highlights

### Commercial
**Searches:** "best", "vs", "review", "comparison"
**Recommendations:** Comparison tables, pros/cons, pricing info

---

## CSV Template

```csv
URL,Traffic,Category,Top_Search_Queries,User_Intent
https://example.com/page1,50000,Tools,"query 1; query 2; query 3",transactional
https://example.com/page2,30000,Guides,"how to X; guide to Y; learn Z",informational
https://example.com/page3,20000,,"brand name; product name",navigational
```

---

## Validation

### How to Verify Recommendations Are Data-Driven

Look for these signals in AI recommendations:

✅ **References specific search queries**: "Users search for 'X'"
✅ **Quotes actual keywords**: "Add FAQ: 'How to make QR code free?'"
✅ **Aligns with intent**: "Given transactional intent, emphasize CTAs"
✅ **Uses query terms in suggestions**: "Create Free QR Code Online"

❌ **Generic advice**: "Add blog section", "Include trending topics"
❌ **No search context**: "Users might want to know about X"
❌ **Arbitrary suggestions**: "Add analytics tracking guide"

---

## Best Practices

### 1. Update Search Data Quarterly
- Search trends change
- New questions emerge
- User intent evolves

### 2. Focus on Top 10-20 Queries
- Don't add 100+ queries
- Quality over quantity
- Focus on high-volume terms

### 3. Group Similar Queries
```
✅ Good: "pdf to word; pdf to word converter; convert pdf to word"
❌ Bad: Including every long-tail variation
```

### 4. Match Intent with Page Type
- Transactional pages → Tool/converter queries
- Informational pages → "How to" queries
- Product pages → Feature/benefit queries

---

## Without Search Data

If you don't provide `Top_Search_Queries`, the system falls back to:
1. Page content analysis
2. Generic SEO best practices
3. Page type heuristics

**Note:** Recommendations will be less targeted but still useful.

---

## Cost Impact

Adding search query data **does NOT increase token costs**:
- Same number of API calls
- Slightly longer prompt (~200 extra tokens)
- Marginal cost: +$0.0005 per URL
- **Massive value increase** from better recommendations

---

## Troubleshooting

### Q: Does the tool automatically fetch search data from Google Search Console?
A: **No.** There is NO automatic API integration. You must manually export data from GSC/Ahrefs/etc. and add it to your CSV file. API integration is a planned future enhancement.

### Q: Where do I get search query data?
A: **Manually export** from:
- Google Search Console (Performance → filter by URL → Export)
- SEMrush/Ahrefs (Organic Keywords report → Export)
- Internal site search analytics
- Customer support questions

### Q: How many queries should I add?
A: 5-10 top queries per URL is ideal

### Q: What if I don't have search data?
A: System works without it, but recommendations will be based on general SEO best practices instead of your actual user search behavior

### Q: Should I include brand queries?
A: Focus on non-branded, problem-solving queries (e.g., "pdf converter free") rather than branded ones (e.g., "Adobe PDF converter") for better optimization insights

### Q: How often should I update the search query data?
A: Refresh quarterly for dynamic content, annually for stable evergreen content

---

## See Also

- [Page Type Classification](PAGE_TYPE_CLASSIFICATION.md)
- [Intelligent Scoring](FEATURE_INTELLIGENT_SCORING.md)
- [Multilingual Support](MULTILINGUAL_SUPPORT.md)


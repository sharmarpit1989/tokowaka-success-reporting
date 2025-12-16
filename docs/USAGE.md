# Usage Guide

## Quick Start Workflow

### Step 1: Content Analysis

1. Navigate to **Content Analysis** page
2. Click **Upload CSV/Excel** and select your URL file
   - File should have a column named `url`, `urls`, `link`, or `links`
   - Can contain up to thousands of URLs
3. Click **Start Analysis**
4. Wait for analysis to complete (progress bar will show status)
5. View results showing content gain for each URL

**What you'll get:**
- Content gain ratio (how much more content appears with JavaScript)
- Word counts (with JS vs without JS)
- Recommendations for pre-rendering

### Step 2: Citation Tracking

1. Navigate to **Citation Performance** page
2. Click **Upload Excel Files** and select brand presence files
   - Files should follow format: `brandpresence-{platform}-w{week}-{year}.xlsx`
   - Must have columns: `Prompt`, `Answer`, `Sources`
   - Can upload multiple weeks/platforms at once
3. Data will be processed automatically
4. View citation rates and trends

**What you'll get:**
- Citation rates by week and platform
- Top cited URLs
- Unique prompts that mentioned your brand
- Comparison across AI platforms

### Step 3: Find Opportunities

1. Navigate to **Opportunities** page
2. Review automatically detected opportunities:
   - **Untracked Citations**: URLs being cited but not in your tracking list
   - **High Traffic, Low Citation**: Popular pages with low AI visibility
   - **High Content Gain**: Pages perfect for pre-rendering
3. Export opportunities list
4. Prioritize optimization work

## Detailed Features

### URL Management

#### Uploading URLs

**Supported formats:**
- CSV files (`.csv`)
- Excel files (`.xlsx`, `.xls`)

**File structure:**
```csv
url
https://www.example.com/page1
https://www.example.com/page2
https://www.example.com/page3
```

**Tips:**
- Remove duplicates before uploading
- Ensure URLs include `http://` or `https://`
- One URL per row
- Column name must be: `url`, `urls`, `link`, or `links` (case-insensitive)

#### Fetching from Spacecat

Click **Fetch from Spacecat** to automatically get top pages:

1. Enter domain name (e.g., `adobe.com`)
2. (Optional) Set filters:
   - Source: ahrefs, semrush, etc.
   - Geo: global, us, jp, etc.
   - Limit: number of results
3. Click **Fetch**
4. URLs will be loaded with traffic data

### Content Analysis

#### How It Works

The analysis runs your URLs through a headless browser (Puppeteer):

1. **First Pass**: Loads page without JavaScript
2. **Second Pass**: Loads page with JavaScript enabled
3. **Comparison**: Calculates content difference
4. **Recommendation**: Suggests if pre-rendering would help

#### Understanding Results

**Content Gain Ratio:**
- `< 2x`: Little benefit from pre-rendering
- `2x - 5x`: Moderate benefit, consider pre-rendering
- `5x - 10x`: High benefit, strongly recommend pre-rendering
- `> 10x`: Critical - page is invisible to AI without JavaScript!

**Example Result:**
```json
{
  "url": "https://www.example.com/products",
  "withoutJS": 150,      // words visible without JS
  "withJS": 1500,        // words visible with JS
  "contentGain": 10,     // 10x more content with JS
  "recommendation": "Pre-render this page"
}
```

### Citation Performance

#### Upload Brand Presence Data

**File naming convention:**
```
brandpresence-{platform}-w{week}-{year}.xlsx
```

**Examples:**
- `brandpresence-chatgpt-w44-2024.xlsx`
- `brandpresence-copilot-w45-2024.xlsx`
- `brandpresence-gemini-w46-2024.xlsx`

**Required columns:**
- `Prompt`: The question asked to AI
- `Answer`: AI's response
- `Sources`: Semicolon-separated URLs cited (e.g., `url1; url2; url3`)

**Optional columns:**
- `Execution Date`: When prompt was run
- Any other metadata you want to preserve

#### Understanding Citation Metrics

**Citation Rate:**
- Percentage of prompts where your URL was cited
- Formula: `(Citations / Total Prompts) * 100`
- Example: 15 citations out of 100 prompts = 15% citation rate

**Selected URL Citations:**
- How often your tracked URLs appear
- These are the URLs you specifically care about

**Domain Citations:**
- Any URL from your domain (tracked or not)
- Shows overall brand presence

**Other Domain URLs:**
- URLs from your domain NOT in your tracking list
- Reveals pages getting AI attention that you might not know about

### Projects

#### Creating a Project

1. Click **New Project**
2. Enter details:
   - **Name**: Descriptive name (e.g., "Q4 Adobe Campaign")
   - **Domain**: Primary domain
   - **Description**: Optional notes
3. Add URLs or import from analysis
4. Save project

#### Using Projects

**Benefits:**
- Keep different campaigns separate
- Compare performance across time periods
- Share configurations with team
- Quick switching between analyses

**Project Contents:**
- URL collection
- Filter preferences
- Analysis results (linked)
- Citation data (linked)
- Custom notes

### Filters

Apply filters to focus on specific data:

**Domain Filter:**
- Select specific domain(s)
- Useful when analyzing multiple brands

**Traffic Filter:**
- Top 10, 50, 100, 500, etc.
- Based on Spacecat traffic data

**Content Gain Filter:**
- Show only URLs with 2x, 5x, 10x+ gain
- Focus on high-impact optimization opportunities

**Date Range:**
- Select specific weeks or date ranges
- Compare performance over time

**Platform Filter:**
- ChatGPT, Copilot, Gemini, Perplexity
- See which platforms cite you most

### Exporting Data

#### Export Options

**Excel Export:**
- Click **Export to Excel** on any page
- Downloads formatted `.xlsx` file
- Includes all filtered data
- Ready for sharing or further analysis

**CSV Export:**
- Lightweight format for data processing
- Compatible with all spreadsheet tools

**What's included:**
- All visible data based on current filters
- Calculated metrics (rates, ratios, etc.)
- Metadata (domains, dates, platforms)

## Best Practices

### For Content Analysis

1. **Start Small**: Test with 10-20 URLs first
2. **Use Spacecat Data**: Focus on high-traffic pages
3. **Re-analyze Periodically**: Pages change, re-check every quarter
4. **Prioritize High Gain**: Pages with 5x+ content gain first

### For Citation Tracking

1. **Consistent URL Lists**: Use the same URLs across weeks for trend analysis
2. **Upload Weekly**: Track trends by uploading data every week
3. **Compare Platforms**: Different AIs behave differently
4. **Track Untracked**: Regularly check "Other Domain URLs" for surprises

### For Projects

1. **One Project Per Campaign**: Keep analyses separate and organized
2. **Descriptive Names**: Use dates and campaign names
3. **Regular Updates**: Update projects with new data weekly
4. **Document Findings**: Use description field for notes

## Common Workflows

### Workflow 1: New Campaign Setup

1. Create new project: "Campaign XYZ - Nov 2024"
2. Upload target URLs (20-50 URLs)
3. Run content analysis
4. Identify high-gain pages (5x+)
5. Set up tracking for those URLs
6. Upload weekly brand presence data
7. Monitor citation rates
8. Export reports for stakeholders

### Workflow 2: Ongoing Monitoring

1. Weekly: Upload new brand presence data
2. Check citation rates trend
3. Look for new "Other Domain URLs" being cited
4. Monthly: Re-run content analysis on key pages
5. Quarterly: Full analysis of top 100 pages

### Workflow 3: Optimization Discovery

1. Run content analysis on top 500 pages (Spacecat)
2. Filter for content gain > 5x
3. Cross-reference with citation data
4. Identify "high traffic + high gain + low citation"
5. These are your optimization priorities!

## Keyboard Shortcuts

- `Ctrl+U`: Upload file (when upload button is focused)
- `Ctrl+E`: Export data (when on results page)
- `Ctrl+/`: Search (when search box exists)
- `Esc`: Close modal/dialog

## Tips & Tricks

### Performance

- **Large analyses**: Split into batches of 100-200 URLs
- **Slow uploads**: Compress files before uploading
- **Memory**: Close other browser tabs during analysis

### Data Quality

- **Clean URLs**: Remove tracking parameters before uploading
- **Consistent Format**: Always use https:// prefix
- **Remove Duplicates**: Use Excel's "Remove Duplicates" feature first

### Analysis

- **Compare Weeks**: Export citation data for consecutive weeks
- **Platform Patterns**: Some AIs prefer certain content types
- **Content Types**: Blog posts often have different patterns than product pages

## Troubleshooting

### "No URLs found in file"

**Cause**: Column name not recognized

**Fix**: Rename column to `url`, `urls`, `link`, or `links`

### "Analysis stuck at 50%"

**Cause**: Some URLs might be timing out

**Fix**: Reduce concurrency in backend `.env`: `PUPPETEER_CONCURRENCY=3`

### "Citation rates all 0%"

**Cause**: URL format mismatch

**Fix**: Ensure URLs in tracking list exactly match format in Sources column (with/without www, trailing slash, etc.)

### "Spacecat fetch failed"

**Cause**: Invalid API key or domain not found

**Fix**: Check `.env` for correct `SPACECAT_API_KEY` and verify domain exists in Spacecat

## Need Help?

- Check [SETUP.md](./SETUP.md) for installation issues
- Check [API.md](./API.md) for technical details
- Contact development team for support

---

**Happy Analyzing! 📊**


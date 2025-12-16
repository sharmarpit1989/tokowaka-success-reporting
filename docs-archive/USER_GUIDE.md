# User Guide - AI Visibility Dashboard

## Overview

This guide explains how to use every feature of the AI Visibility Dashboard.

## Table of Contents

- [Content Analysis](#content-analysis)
- [Citation Tracking](#citation-tracking)
- [Unified Dashboard](#unified-dashboard)
- [Filtering & Search](#filtering--search)
- [Exporting Reports](#exporting-reports)
- [Project Management](#project-management)

---

## Content Analysis

**Purpose**: Analyze how much content is visible to AI agents with/without JavaScript.

### Step 1: Upload URLs

**Three ways to add URLs:**

#### Option A: Upload File
1. Click **"Upload URLs"** button
2. Drag & drop a CSV or Excel file
3. File format: One URL per row

**Example CSV:**
```csv
url
https://example.com/page1
https://example.com/page2
https://example.com/page3
```

**Example Excel:**
| URL |
|-----|
| https://example.com/page1 |
| https://example.com/page2 |

#### Option B: Fetch from Spacecat
1. Click **"Fetch from Spacecat"**
2. Enter domain name (e.g., `adobe.com`)
3. Select number of top pages (10, 50, 100)
4. Click **"Fetch"**

#### Option C: Manual Entry
1. Click **"Add URLs Manually"**
2. Paste URLs (one per line)
3. Click **"Add to List"**

### Step 2: Run Analysis

1. Review your URL list
2. Click **"Run Analysis"**
3. Monitor progress bar
4. Wait for completion (typically 3-5 seconds per URL)

### Step 3: View Results

Results show for each URL:
- **LLM Presence Score** (0-100): How visible content is to AI
- **Content w/o JS**: Content size without JavaScript
- **Content w/ JS**: Content size with JavaScript rendered
- **Content Gain**: Percentage increase with JS
- **AI Recommendations**: Specific optimization suggestions

### Understanding Scores

| Score | Meaning | Action Needed |
|-------|---------|---------------|
| 0-30 | Poor | **Urgent**: Enable pre-rendering |
| 31-60 | Fair | **Important**: Improve content structure |
| 61-80 | Good | **Nice-to-have**: Minor optimizations |
| 81-100 | Excellent | No action needed |

### AI Recommendations

The system provides specific recommendations like:
- "Enable server-side rendering or pre-rendering"
- "Optimize meta descriptions for AI platforms"
- "Add structured data markup"
- "Improve content accessibility"

---

## Citation Tracking

**Purpose**: Monitor how often AI platforms cite your URLs.

### Step 1: Upload Brand Presence Data

1. Go to **"Citation Performance"** tab
2. Click **"Upload Brand Presence"**
3. Select your Excel file from reporting automation
4. Upload will process automatically

**Expected format**: Brand presence Excel from the reporting automation tool (standard format with columns for URL, platform, week, citations).

### Step 2: View Citation Metrics

Dashboard shows:
- **Citation Rate**: Percentage of URLs being cited
- **Citations by Platform**: ChatGPT, Gemini, Copilot, Perplexity
- **Trending URLs**: Most cited URLs this week
- **Weekly Trends**: Citation patterns over time

### Step 3: Filter Citations

**Filter by:**
- **Platform**: Select specific AI platforms
- **Week**: Choose date range
- **Domain**: Filter by domain
- **Citation Count**: Minimum citations threshold

### Understanding Citation Data

**Good citation rate**: >20% for most sites
**Excellent citation rate**: >40%

**Red flags:**
- Citation rate dropping week-over-week
- High-traffic pages with zero citations
- Platform-specific drops (might indicate algorithm changes)

---

## Unified Dashboard

**Purpose**: See content analysis + citation tracking in one view.

### Creating a Unified Project

1. Go to **"Unified Dashboard"** tab
2. Click **"Create New Project"**
3. Enter project name
4. Upload URL list
5. Upload citation data
6. Run content analysis
7. View combined metrics

### Unified Metrics

For each URL, you see:
- Traffic data (if Spacecat connected)
- Content gain (from analysis)
- Citation rate (from brand presence)
- LLM presence score
- AI recommendations

### Opportunity Detection

The system automatically highlights:

**🔴 High Priority Opportunities**
- High traffic + Low citations
- High content gain potential + Not optimized
- Cited URLs not in your tracking list

**🟡 Medium Priority**
- Medium traffic + Medium citations
- Some content gain potential

**🟢 Performing Well**
- High citations + Optimized content
- Low/zero content gain needed

---

## Filtering & Search

### Available Filters

#### Domain Filter
- Multi-select dropdown
- Shows all domains from your URL list
- Can select multiple domains at once

#### Traffic Filter (Requires Spacecat)
- Top 10, 50, 100, 500, 1000 pages
- Based on Spacecat traffic data
- Filters out low-traffic URLs

#### Content Gain Filter
- 2x+ gain (200%+)
- 5x+ gain (500%+)
- 10x+ gain (1000%+)
- Highlights JavaScript-heavy pages

#### Date Range Filter
- Last 7 days
- Last 30 days
- Custom range
- Applies to citation data

#### Platform Filter
- ChatGPT
- Google Gemini
- Microsoft Copilot
- Perplexity AI
- Select multiple platforms

### Search

Use the search box to find:
- Specific URLs
- Domain names
- Path patterns

**Search tips:**
- Search is case-insensitive
- Searches across URL, domain, and path
- Use partial matches (e.g., "blog" finds all blog URLs)

---

## Exporting Reports

### Export Options

#### Excel Export
1. Click **"Export to Excel"**
2. Select data to include:
   - Content analysis results
   - Citation data
   - Combined metrics
3. Click **"Download"**
4. File downloads automatically

**Excel includes:**
- All visible data (respects current filters)
- Formatted tables
- Summary statistics
- Charts (if applicable)

#### PDF Export (Coming Soon)
- Executive summary format
- Charts and visualizations
- Print-ready format

### What Gets Exported

**Columns included:**
- URL
- Domain
- Traffic (if available)
- Content w/o JS
- Content w/ JS
- Content Gain %
- LLM Score
- Citation Rate
- Citations by Platform
- AI Recommendations

---

## Project Management

### Creating Projects

1. Go to **"Projects"** tab
2. Click **"New Project"**
3. Enter project details:
   - Name
   - Description (optional)
   - Domain
4. Click **"Create"**

### Saving URL Collections

Once you've uploaded URLs and run analysis:
1. Click **"Save Project"**
2. Enter project name
3. Project saves:
   - URL list
   - Analysis results
   - Applied filters
   - Citation data

### Loading Projects

1. Go to **"Projects"** tab
2. Click on a saved project
3. Dashboard loads with all saved data
4. Can re-run analysis or update data

### Duplicating Projects

1. Open a project
2. Click **"Duplicate Project"**
3. Edit as needed
4. Useful for monthly tracking

### Deleting Projects

1. Go to **"Projects"** tab
2. Click **"Delete"** next to project name
3. Confirm deletion
4. All associated data is removed

---

## Best Practices

### For Content Analysis

1. **Start small**: Test with 10-20 URLs first
2. **Use filters**: Focus on high-traffic pages
3. **Re-run monthly**: Track improvements over time
4. **Act on recommendations**: Implement AI suggestions
5. **Monitor scores**: Aim for 60+ LLM scores

### For Citation Tracking

1. **Upload weekly**: Keep data fresh
2. **Track trends**: Watch week-over-week changes
3. **Compare platforms**: Different AI platforms behave differently
4. **Investigate drops**: Sudden drops might indicate issues
5. **Cross-reference**: Check if cited URLs are in your top pages

### For Unified Analysis

1. **Create focused projects**: One project per campaign/domain
2. **Use opportunity detection**: Prioritize high-impact pages
3. **Export regularly**: Share reports with stakeholders
4. **Monitor opportunities**: Check for new untracked cited URLs
5. **Iterate**: Re-analyze after making optimizations

---

## Tips & Tricks

### Speed Up Analysis

- Increase browser pool size: Set `PUPPETEER_POOL_SIZE=3` in `.env`
- Analyze in batches: Split large URL lists
- Use filters: Analyze top pages first

### Improve Accuracy

- Use full URLs (not just domains)
- Include protocol (https://)
- Remove duplicate URLs before upload
- Check URLs are accessible (not behind login)

### Organize Your Work

- Name projects clearly (e.g., "Adobe.com Q1 2025")
- Use consistent naming conventions
- Archive old projects
- Export historical data before deleting

### Collaborate with Team

- Export Excel reports for sharing
- Use unified dashboard for presentations
- Save projects for recurring analysis
- Document findings in project descriptions

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + U` | Upload file |
| `Ctrl/Cmd + R` | Run analysis |
| `Ctrl/Cmd + E` | Export to Excel |
| `Ctrl/Cmd + F` | Focus search |
| `Ctrl/Cmd + N` | New project |
| `Esc` | Close modal |

---

## Troubleshooting Common Issues

### "Analysis failed"
- Check URLs are valid and accessible
- Verify browser pool is running (check `/api/health`)
- Check logs at `logs/error.log`

### "Upload failed"
- Verify file format (CSV or Excel)
- Check URL column exists
- File size under 10MB
- No special characters in filenames

### "No citation data"
- Verify brand presence file format
- Check date range isn't too narrow
- Ensure URLs match between files

### "Slow performance"
- Increase browser pool size
- Reduce concurrent analyses
- Clear cache (restart server)
- Check system resources

---

## Advanced Features

### Custom Filters

Combine multiple filters for precise analysis:
- Example: "Top 100 pages + 5x content gain + ChatGPT citations"
- Filters are cumulative (AND logic)

### Bulk Actions

- Select multiple URLs
- Run analysis on selected only
- Export selection
- Delete selection

### API Access

For programmatic access, use the REST API:
- Documentation: [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
- Health check: `GET /api/health`
- Run analysis: `POST /api/analysis/run`

---

## Getting Help

**Common questions**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
**Technical details**: [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
**Project history**: [PROJECT_HISTORY.md](PROJECT_HISTORY.md)
**Setup issues**: [GETTING_STARTED.md](GETTING_STARTED.md)

**Detailed archive**: Check [docs-archive/](docs-archive/) for specific topics:
- Browser pool configuration
- Performance optimization
- Citation upload debugging
- Data persistence
- And 40+ more detailed guides

---

**Happy analyzing! 📊**


# RUM Integration - Quick Reference Card

## 🎯 Common Commands

```bash
# Basic domain analysis (auto-fetches everything)
node main-rum.js --domain www.example.com

# Find optimization opportunities (fast, no full analysis)
node main-rum.js --domain www.example.com --mode opportunities

# High-traffic pages only (10K+ views)
node main-rum.js --domain www.example.com --min-traffic 10000

# Last 7 days only
node main-rum.js --domain www.example.com --days 7

# Top 20 pages only
node main-rum.js --domain www.example.com --max-urls 20

# With AI insights
node main-rum.js --domain www.example.com --aikey YOUR_KEY

# Combine options
node main-rum.js --domain www.example.com --days 7 --min-traffic 5000 --max-urls 20
```

## 🔑 Environment Setup

**Windows PowerShell:**
```powershell
$env:RUM_ADMIN_KEY = "your-rum-admin-key"
$env:AZURE_OPENAI_KEY = "your-openai-key"  # Optional
```

**Windows CMD:**
```cmd
set RUM_ADMIN_KEY=your-rum-admin-key
set AZURE_OPENAI_KEY=your-openai-key
```

**Linux/Mac:**
```bash
export RUM_ADMIN_KEY=your-rum-admin-key
export AZURE_OPENAI_KEY=your-openai-key
```

## 📊 What You Get

### RUM Metrics (Automatic)
- ✅ Pageviews (total traffic)
- ✅ Organic traffic (SEO)
- ✅ Paid traffic (ads)
- ✅ Owned traffic (direct/email)
- ✅ Engagement % (user interaction)
- ✅ Bounce rate (leave %)
- ✅ Core Web Vitals (LCP, CLS, INP, TTFB)
- ✅ Device breakdown (desktop/mobile)

### LLM Metrics (Your Analysis)
- ✅ LLM Presence Score (overall)
- ✅ Freshness Score
- ✅ Answerability Score
- ✅ Query Alignment Score
- ✅ Authority Score
- ✅ Structure Score
- ✅ Snippet Quality Score

## 🎯 Decision Tree

```
Do you have a RUM admin key?
│
├─ YES → Use RUM mode
│   │
│   ├─ Want quick opportunities? 
│   │   → node main-rum.js --domain X --mode opportunities
│   │
│   └─ Want full analysis?
│       → node main-rum.js --domain X
│
└─ NO → Use CSV mode
    → node main.js --csv your-file.csv
```

## 🚦 Workflow Examples

### Weekly Content Audit (Monday morning)
```bash
node main-rum.js --domain www.example.com --days 7 --max-urls 20
```

### Find Quick Wins (Friday afternoon)
```bash
node main-rum.js --domain www.example.com --mode opportunities
```

### Deep Dive Analysis (quarterly)
```bash
node main-rum.js --domain www.example.com --days 90 --aikey YOUR_KEY
```

### Campaign Landing Page Check
```bash
node main-rum.js --domain www.example.com --days 14 --min-traffic 5000
```

## 🎨 Output Format

### Console Output
```
📊 ANALYSIS SUMMARY
═══════════════════════════════════════════════════════

1. 🟢 https://www.example.com/product
   LLM Score: 85.2% Excellent LLM presence
   Traffic: 50,000 views (70.0% organic)
   Engagement: 65.0%, Bounce: 35.0%
   Page Type: Product Page (95% confidence)
   Core Web Vitals: LCP=2099ms, CLS=0.011

2. 🟡 https://www.example.com/blog
   LLM Score: 72.5% Good LLM presence
   Traffic: 25,000 views (80.0% organic)
   Engagement: 58.0%, Bounce: 42.0%
   Page Type: Blog Post (92% confidence)
   Core Web Vitals: LCP=2500ms, CLS=0.05
```

### JSON File
```
output/www_example_com/rum-analysis-2024-12-04T10-30-00.json
```

## ⚡ Performance Tips

1. **Start Small**: Use `--max-urls 10` for first run
2. **Filter Traffic**: Use `--min-traffic 5000` for high-impact pages
3. **Use Opportunities Mode**: Quick scan before full analysis
4. **Schedule Weekly**: Automate with cron/Task Scheduler
5. **Compare Trends**: Run monthly, track improvements

## 🔍 Troubleshooting

| Error | Solution |
|-------|----------|
| "RUM_ADMIN_KEY not set" | Set environment variable |
| "No RUM data found" | Check domain has RUM tracking |
| "RUM API Client not installed" | Run `npm install` |
| "Rate limit exceeded" | Add delays, reduce --max-urls |
| "Domain key not found" | Verify domain access permissions |

## 📚 Documentation Links

- [5-Minute Setup](SETUP_RUM.md)
- [Full Integration Guide](docs/guides/RUM_API_INTEGRATION.md)
- [Complete Summary](RUM_INTEGRATION_SUMMARY.md)
- [Quick Start](docs/guides/QUICKSTART.md)

## 🎯 Priority Algorithm

Pages are ranked by this formula:

```
Priority Score = 
  (log10(pageviews) × 100 × 0.5) +     # Traffic volume
  (organic_ratio × 100 × 0.3) +         # SEO quality
  ((100 - engagement) × 0.2)            # Improvement potential
```

Higher score = analyzed first!

## 💡 Pro Tips

1. **Combine with Opportunities**: Run opportunities mode first, then analyze top issues
2. **Track Over Time**: Save results weekly, compare trends
3. **Segment by Page Type**: Filter by URL patterns (e.g., `/blog/*`)
4. **Correlate Metrics**: Look for patterns (high traffic + low LLM score = opportunity)
5. **Use AI Mode**: Add `--aikey` for detailed recommendations

## 📞 Quick Help

```bash
# Show full help
node main-rum.js --help

# Show CSV mode help
node main.js --help

# Check installed packages
npm list @adobe/spacecat-shared-rum-api-client
```

---

**Print this and keep it handy!** 📄


# RUM API Integration Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
npm install
```

This will install the new `@adobe/spacecat-shared-rum-api-client` package.

### Step 2: Get Your RUM Admin Key

You'll need a RUM admin key from Adobe. Contact your team lead or check:
- Internal Adobe Slack channels
- Your team's secrets manager
- SpaceCat team documentation

### Step 3: Set Environment Variable

**Windows PowerShell:**
```powershell
$env:RUM_ADMIN_KEY = "your-rum-admin-key-here"
```

**Windows CMD:**
```cmd
set RUM_ADMIN_KEY=your-rum-admin-key-here
```

**Linux/Mac:**
```bash
export RUM_ADMIN_KEY=your-rum-admin-key-here
```

**Optional: Azure OpenAI Key for AI insights:**
```powershell
$env:AZURE_OPENAI_KEY = "your-azure-openai-key"
```

### Step 4: Run Your First Analysis

```bash
# Analyze a domain (no CSV needed!)
node main-rum.js --domain www.aem.live

# Find optimization opportunities
node main-rum.js --domain www.aem.live --mode opportunities

# High-traffic pages only
node main-rum.js --domain www.aem.live --min-traffic 10000 --max-urls 20
```

## 📋 Usage Examples

### Example 1: Basic Domain Analysis
```bash
node main-rum.js --domain www.example.com
```

**What it does:**
- Fetches last 30 days of RUM data
- Gets pageviews, organic traffic, engagement
- Analyzes top 50 pages by priority
- Generates comprehensive report

### Example 2: Quick Weekly Check
```bash
node main-rum.js --domain www.example.com --days 7 --max-urls 20
```

**What it does:**
- Analyzes last 7 days only
- Focuses on top 20 pages
- Perfect for weekly reviews

### Example 3: High-Traffic Pages Only
```bash
node main-rum.js --domain www.example.com --min-traffic 10000
```

**What it does:**
- Only analyzes pages with 10K+ views
- Focuses optimization efforts on high-impact pages

### Example 4: Find Opportunities (No Analysis)
```bash
node main-rum.js --domain www.example.com --mode opportunities
```

**What it does:**
- Finds high-organic, low-CTR pages
- Finds high-paid-traffic, high-bounce pages
- Quick opportunity scan (no full analysis)

### Example 5: Full Analysis with AI
```bash
node main-rum.js --domain www.example.com --aikey YOUR_KEY --days 30
```

**What it does:**
- Full 30-day analysis
- AI-powered insights
- Detailed recommendations

## 🎯 What You Get

### Instead of Manual CSV:
```csv
URL,Traffic
https://example.com/page1,50000
https://example.com/page2,25000
```

### You Get Automatic Rich Data:
```
📊 Top 2 URLs by Priority:

1. https://example.com/page1
   Views: 50,000, Organic: 35,000 (70.0%)
   Engagement: 65.0%, Priority: 892.5

2. https://example.com/page2
   Views: 25,000, Organic: 20,000 (80.0%)
   Engagement: 72.0%, Priority: 856.3
```

### Plus Full Analysis Results:
```
1. 🟢 https://example.com/page1
   LLM Score: 85.2% Excellent LLM presence
   Traffic: 50,000 views (70.0% organic)
   Engagement: 65.0%, Bounce: 35.0%
   Page Type: Product Page (95% confidence)
   Core Web Vitals: LCP=2099ms, CLS=0.011
```

## 📊 Output Files

Results are saved to:
```
output/www_example_com/rum-analysis-2024-12-04T10-30-00.json
```

Format:
```json
{
  "domain": "www.example.com",
  "analysisDate": "2024-12-04T10:30:00.000Z",
  "daysAnalyzed": 30,
  "totalUrlsFound": 150,
  "urlsAnalyzed": 50,
  "results": [
    {
      "url": "https://www.example.com/page1",
      "rumMetrics": {
        "pageviews": 50000,
        "organicTraffic": 35000,
        "organicRatio": "70.0%",
        "engagement": "65.0%",
        "bounceRate": "35.0%",
        "priorityScore": "892.5",
        "coreWebVitals": {
          "lcp": 2099.7,
          "cls": 0.011,
          "inp": 8,
          "ttfb": 548
        }
      },
      "llmPresence": {
        "overallScore": 0.852,
        "freshness": 0.89,
        "answerability": 0.92,
        "queryAlignment": 0.78,
        "authority": 0.95,
        "structure": 0.88,
        "snippetQuality": 0.85
      },
      "pageType": {
        "primaryType": "Product Page",
        "confidence": 0.95
      }
    }
  ]
}
```

## 🔧 Troubleshooting

### Error: "RUM_ADMIN_KEY environment variable not set"
**Solution:** Set the RUM_ADMIN_KEY environment variable (see Step 3 above)

### Error: "No RUM data found for this domain"
**Possible causes:**
1. Domain doesn't have RUM tracking installed
2. Domain name is incorrect (check spelling)
3. No data for the selected time period

**Solution:** 
- Verify domain has RUM tracking
- Try a different date range: `--days 60`
- Check domain spelling

### Error: "RUM API Client not installed"
**Solution:** 
```bash
npm install @adobe/spacecat-shared-rum-api-client
```

### Error: Rate limit exceeded
**Solution:** 
- Add delays between requests
- Reduce `--max-urls` count
- Analyze fewer pages at a time

## 🆚 RUM Mode vs CSV Mode

| Feature | CSV Mode | RUM Mode |
|---------|----------|----------|
| **Data Source** | Manual CSV export | Automatic from RUM API |
| **Traffic Data** | Basic pageviews | Pageviews + organic + paid + owned |
| **Performance Metrics** | None | Core Web Vitals (LCP, CLS, INP, TTFB) |
| **Engagement** | None | Bounce rate, engagement % |
| **Device Breakdown** | None | Desktop vs Mobile |
| **Setup Time** | 30+ minutes | 5 minutes |
| **Freshness** | Outdated when exported | Real-time (1-2 hour delay) |
| **Best For** | External sites, one-time analysis | Adobe sites, ongoing monitoring |

## 🎓 Learning Resources

- [Full RUM Integration Guide](docs/guides/RUM_API_INTEGRATION.md)
- [RUM API Client Docs](https://github.com/adobe/spacecat-shared/blob/main/packages/spacecat-shared-rum-api-client/README.md)
- [Quick Start Guide](docs/guides/QUICKSTART.md)

## 🚦 Next Steps

1. ✅ Set up RUM_ADMIN_KEY
2. ✅ Run your first analysis
3. 📊 Review the results
4. 🎯 Use "opportunities" mode to find quick wins
5. 🔄 Schedule weekly analyses
6. 📈 Track LLM presence improvements over time

## 💡 Pro Tips

1. **Start Small:** Use `--max-urls 10` for your first run
2. **Filter High-Traffic:** Use `--min-traffic 5000` to focus on important pages
3. **Find Quick Wins:** Run `--mode opportunities` first to see where to focus
4. **Compare Over Time:** Run weekly and compare results
5. **Correlate Metrics:** Look for patterns between LLM scores and bounce rates

---

**Need Help?** Check the [troubleshooting section](docs/troubleshooting/) or open an issue.


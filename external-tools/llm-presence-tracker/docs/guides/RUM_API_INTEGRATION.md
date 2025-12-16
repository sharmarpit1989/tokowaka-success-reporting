# RUM API Integration Guide

## Overview

Integrate Adobe's Real User Monitoring (RUM) API with the LLM Presence Tracker to automatically fetch real traffic data, performance metrics, and user engagement statistics for your analyzed pages.

## Why Integrate RUM API?

### Before Integration (Manual CSV)
```csv
URL,Traffic
https://example.com/product,50000
https://example.com/blog,25000
```

### After Integration (Automatic Rich Data)
```javascript
{
  url: "https://example.com/product",
  traffic: {
    pageviews: 50000,
    organic: 35000,
    paid: 10000,
    owned: 5000
  },
  coreWebVitals: {
    lcp: 2099.7,
    cls: 0.011,
    inp: 8,
    ttfb: 548
  },
  engagement: {
    bounceRate: 0.35,
    engagementPercentage: 65
  },
  deviceBreakdown: {
    desktop: { pageviews: 35000, lcp: 2000 },
    mobile: { pageviews: 15000, lcp: 2500 }
  }
}
```

## Benefits

1. **No More Manual CSVs** - Automatically fetch all URL data
2. **Rich Context** - Combine LLM presence scores with real performance
3. **Prioritization** - Focus on high-traffic pages with poor LLM scores
4. **Correlation Analysis** - See how LLM presence affects bounce rates
5. **Device-Specific Insights** - Analyze mobile vs desktop differently

## Installation

```bash
npm install @adobe/spacecat-shared-rum-api-client
```

## Configuration

You'll need a RUM admin key. Set it as an environment variable:

```bash
# Windows PowerShell
$env:RUM_ADMIN_KEY="your-rum-admin-key-here"

# Windows CMD
set RUM_ADMIN_KEY=your-rum-admin-key-here

# Linux/Mac
export RUM_ADMIN_KEY=your-rum-admin-key-here
```

## Usage Examples

### 1. Basic Integration - Fetch Traffic Data

```javascript
import RUMAPIClient from '@adobe/spacecat-shared-rum-api-client';

// Initialize RUM client
const rumClient = RUMAPIClient.createFrom({ env: process.env });

// Fetch Core Web Vitals for a domain
const opts = {
  domain: 'www.example.com',
  interval: 30, // Last 30 days
  granularity: 'daily'
};

const cwvData = await rumClient.query('cwv', opts);

// cwvData contains pageviews, organic traffic, and performance metrics
console.log(cwvData);
```

### 2. Enhanced Analysis - Combine RUM + LLM Scores

```javascript
// Fetch all URLs with traffic data from RUM
const rumData = await rumClient.query('cwv', {
  domain: 'www.example.com',
  interval: 30
});

// Analyze each URL with LLM presence tracker
for (const pageData of rumData) {
  if (pageData.type === 'url') {
    const llmScore = await analyzeLLMPresence(pageData.url);
    
    // Correlate traffic with LLM presence
    const result = {
      url: pageData.url,
      traffic: pageData.pageviews,
      organicTraffic: pageData.organic,
      llmPresenceScore: llmScore.overall,
      priority: calculatePriority(pageData, llmScore)
    };
    
    console.log(result);
  }
}
```

### 3. Find High-Traffic, Low-LLM-Presence Pages

```javascript
// Get engagement metrics
const engagement = await rumClient.query('engagement', {
  domain: 'www.example.com',
  interval: 30
});

// Find pages that need LLM optimization
const opportunityPages = engagement
  .filter(page => page.totalTraffic > 10000) // High traffic
  .filter(page => page.engagementPercentage < 40) // Low engagement
  .sort((a, b) => b.totalTraffic - a.totalTraffic)
  .slice(0, 20); // Top 20 opportunities

// Analyze these pages with LLM presence tracker
for (const page of opportunityPages) {
  console.log(`\nAnalyzing high-opportunity page: ${page.url}`);
  console.log(`Traffic: ${page.totalTraffic}, Engagement: ${page.engagementPercentage}%`);
  
  const llmScore = await analyzeLLMPresence(page.url);
  console.log(`LLM Presence Score: ${llmScore.overall}`);
}
```

## Available RUM Queries

| Query | What It Does | Use Case |
|-------|-------------|----------|
| `cwv` | Core Web Vitals (LCP, CLS, INP, TTFB) + traffic | Get performance + traffic data |
| `404` | 404 errors and their sources | Find broken pages that LLMs might encounter |
| `engagement` | User engagement & bounce rates | Correlate LLM presence with user behavior |
| `high-organic-low-ctr` | Pages with high organic traffic but low CTR | Find SEO opportunities |
| `high-inorganic-high-bounce-rate` | Paid traffic with poor retention | Optimize landing pages |
| `form-vitals` | Form views/submissions/engagement | Analyze conversion pages |

## Integration Patterns

### Pattern 1: Automated Daily Analysis

```javascript
// Fetch yesterday's top pages
const rumData = await rumClient.query('cwv', {
  domain: 'www.example.com',
  startTime: '2024-12-03T00:00:00Z',
  endTime: '2024-12-03T23:59:59Z'
});

// Auto-generate CSV from RUM data
const csvRows = rumData
  .filter(d => d.type === 'url')
  .map(d => ({
    URL: d.url,
    Traffic: d.pageviews,
    Organic: d.organic,
    BounceRate: '', // Can be enriched from engagement query
    Category: '', // Auto-detect from URL pattern
  }));

// Save and analyze
await saveToCsv(csvRows, 'auto-generated-urls.csv');
await analyzeLLMPresence('auto-generated-urls.csv');
```

### Pattern 2: Priority-Based Analysis

```javascript
// Combine multiple RUM queries for smart prioritization
const [cwvData, engagementData] = await Promise.all([
  rumClient.query('cwv', { domain: 'www.example.com', interval: 30 }),
  rumClient.query('engagement', { domain: 'www.example.com', interval: 30 })
]);

// Create priority score
const prioritizedUrls = cwvData
  .filter(d => d.type === 'url')
  .map(cwv => {
    const engagement = engagementData.find(e => e.url === cwv.url);
    
    return {
      url: cwv.url,
      traffic: cwv.pageviews,
      organic: cwv.organic,
      engagement: engagement?.engagementPercentage || 0,
      priority: calculatePriorityScore(cwv, engagement)
    };
  })
  .sort((a, b) => b.priority - a.priority)
  .slice(0, 50); // Top 50 priority pages

// Analyze only high-priority pages
await analyzeLLMPresence(prioritizedUrls);
```

### Pattern 3: Correlation Analysis

```javascript
// Analyze correlation between LLM presence and real metrics
const urlsToAnalyze = await getRumUrls('www.example.com');

const results = [];
for (const url of urlsToAnalyze) {
  const rumMetrics = await getRumMetrics(url);
  const llmScore = await analyzeLLMPresence(url);
  
  results.push({
    url,
    traffic: rumMetrics.pageviews,
    bounceRate: rumMetrics.bounceRate,
    llmPresenceScore: llmScore.overall,
    freshnessScore: llmScore.freshness,
    answerabilityScore: llmScore.answerability
  });
}

// Calculate correlations
const correlation = calculateCorrelation(
  results.map(r => r.llmPresenceScore),
  results.map(r => r.bounceRate)
);

console.log(`LLM Presence vs Bounce Rate Correlation: ${correlation}`);
```

## Command Line Integration

Create a new script `main-rum.js` that uses RUM API:

```bash
# Analyze domain using RUM data (no CSV needed!)
node main-rum.js --domain www.example.com --days 30

# Analyze only high-traffic pages
node main-rum.js --domain www.example.com --min-traffic 10000

# Find optimization opportunities
node main-rum.js --domain www.example.com --mode opportunities
```

## Error Handling

```javascript
try {
  const rumData = await rumClient.query('cwv', opts);
  
  if (!rumData || rumData.length === 0) {
    logger.warning('No RUM data found for domain');
    // Fall back to CSV mode
  }
} catch (error) {
  if (error.message.includes('domain key')) {
    logger.error('Invalid domain or missing permissions');
  } else if (error.message.includes('rate limit')) {
    logger.error('RUM API rate limit exceeded, retry later');
  } else {
    logger.error(`RUM API error: ${error.message}`);
  }
}
```

## Best Practices

1. **Cache RUM Data** - RUM queries can be slow, cache results locally
2. **Use Date Ranges** - Specify `startTime` and `endTime` for predictable results
3. **Filter by Traffic** - Don't analyze low-traffic pages (waste of API calls)
4. **Combine Queries** - Use multiple RUM queries for richer context
5. **Respect Rate Limits** - Add delays between requests if analyzing many URLs

## Performance Considerations

- **RUM Query Speed**: ~2-5 seconds per domain
- **Recommended Batch Size**: 50-100 URLs at a time
- **Data Freshness**: RUM data is typically 1-2 hours delayed
- **Cost**: Free within Adobe, but consider API rate limits

## Roadmap

Future enhancements:
- [ ] Automatic domain detection from URL patterns
- [ ] Multi-domain analysis support
- [ ] RUM data caching layer
- [ ] Historical trend analysis (compare week-over-week)
- [ ] Slack/email alerts for LLM presence drops

## Troubleshooting

### "Domain key not found"
**Solution**: Ensure your domain is registered in RUM system and you have access

### "No data returned"
**Solution**: Check date range, domain might not have RUM tracking installed

### "Rate limit exceeded"
**Solution**: Add delays between requests or reduce batch size

## See Also

- [RUM API Client Documentation](https://github.com/adobe/spacecat-shared/blob/main/packages/spacecat-shared-rum-api-client/README.md)
- [Quick Start Guide](QUICKSTART.md)
- [Data-Driven Recommendations](DATA_DRIVEN_RECOMMENDATIONS.md)


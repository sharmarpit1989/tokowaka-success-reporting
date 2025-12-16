# Rate Limiting & Resource Protection

## 🎯 Overview

Comprehensive rate limiting system to prevent overloading:
- ✅ Customer websites (avoid excessive scraping)
- ✅ Azure OpenAI API (prevent 429 errors)
- ✅ Backend server (manage resource usage)

## 🚨 The Problem

**Without rate limiting:**
- Batch analyzing 20 URLs → 20 simultaneous browser instances
- Azure API calls → potential 429 rate limit errors
- Customer website → DDoS-like traffic spike
- Server crash → memory exhaustion

**With rate limiting:**
- Controlled, sequential processing
- Intelligent delays between requests
- Automatic throttling on errors
- User-configurable safety margins

---

## ✨ Features

### 1. **Service-Specific Rate Limiters**

Three independent rate limiters for different services:

**Azure OpenAI:**
- 10 requests per minute max
- 3-second minimum delay between requests
- Auto-throttle on 429 errors

**Website Scraping:**
- 5 requests per minute max
- 5-second minimum delay between requests
- Protects customer sites from overload

**General API:**
- 20 requests per minute max
- 1-second minimum delay between requests
- For internal operations

### 2. **User-Configurable Batch Delays**

**Settings Panel:**
- Adjustable delay: 2-30 seconds
- Real-time estimated completion time
- Recommended presets:
  - 2-5s: Fast (small batches)
  - 5-10s: Recommended (medium batches)
  - 10-30s: Safe (large batches)

### 3. **Automatic Rate Limit Handling**

- Detects 429 errors automatically
- Throttles for 60 seconds (or based on `Retry-After` header)
- Resumes automatically after cooldown
- User notified of pauses

### 4. **Progress Tracking**

- "Analyzed 5/20. Next URL in 5s..."
- Per-URL progress indicators
- Success/failure counts
- Completion notifications

---

## 📊 Rate Limiter Architecture

### Backend (`backend/utils/rateLimiter.js`)

```javascript
class RateLimiter {
  - maxRequestsPerMinute: 10
  - minDelayBetweenRequests: 2000ms
  - requestHistory: [] // Timestamps
  - isThrottling: false
  
  Methods:
  - canMakeRequest() → boolean
  - waitForSlot() → Promise<void>
  - recordRequest() → void
  - throttle(durationMs) → void
  - getStatus() → object
}
```

### Service Integration

**In `hybridContentAnalyzer.js`:**

```javascript
async function analyzeSingleUrl(browser, url, aiKey) {
  // 1. Acquire slot for website scraping
  await acquireSlot('websiteScraping');
  
  // 2. Perform analysis
  const llmResult = await llmTracker.analyzeUrl(...);
  
  // 3. Acquire slot for Azure API
  await acquireSlot('azureOpenAI');
  
  // 4. Call Azure OpenAI
  const response = await fetch(...);
  
  // 5. Handle rate limit errors
  if (!response.ok) {
    handleRateLimitError('azureOpenAI', error);
  }
}
```

---

## 🎨 User Interface

### Batch Settings Panel

```
┌──────────────────────────────────────────────────┐
│ ⚙️ Batch Analysis Settings                    × │
│ Configure delay to avoid rate limits             │
├──────────────────────────────────────────────────┤
│ Delay Between URLs: 5s                           │
│ [████████░░░░░░░░░░░░░░░░] 2s ←→ 30s            │
│                                                   │
│ 💡 Recommendations:                              │
│ • 2-5s: Fast, good for small batches             │
│ • 5-10s: ✅ Recommended (10-20 URLs)             │
│ • 10-30s: Very safe (20+ URLs)                   │
│                                                   │
│ ℹ️ Estimated time: 2 minutes for 20 URLs        │
└──────────────────────────────────────────────────┘
```

### Progress Notifications

```
ℹ️ Starting analysis for 10 URLs with 5s delay between each...

ℹ️ Analyzed 3/10. Next URL in 5s...

ℹ️ Analyzed 7/10. Next URL in 5s...

⚠️ Rate limit hit. Pausing for 30 seconds...

✅ Completed! 10 URLs analyzed successfully.
```

---

## 🔧 Configuration

### Backend Rate Limits

Edit `backend/utils/rateLimiter.js`:

```javascript
// Azure OpenAI
azureOpenAI: new RateLimiter({
  maxRequestsPerMinute: 10,  // ← Adjust based on your tier
  minDelayBetweenRequests: 3000
}),

// Website Scraping
websiteScraping: new RateLimiter({
  maxRequestsPerMinute: 5,   // ← Conservative default
  minDelayBetweenRequests: 5000
}),
```

### Azure OpenAI Rate Limits by Tier

| Tier | TPM | RPM | Recommended Setting |
|------|-----|-----|---------------------|
| Free | 20K | 3 | `maxRequestsPerMinute: 3` |
| Standard | 60K | 10 | `maxRequestsPerMinute: 10` |
| Premium | 120K | 20 | `maxRequestsPerMinute: 20` |

**TPM** = Tokens Per Minute  
**RPM** = Requests Per Minute

### Frontend Delay Defaults

Edit `frontend/src/pages/AIVisibility.jsx`:

```javascript
const [batchDelay, setBatchDelay] = useState(5) // 5 seconds default
```

---

## 📈 How It Works

### Request Flow with Rate Limiting

```
User clicks "Analyze 10 URLs"
  ↓
For each URL:
  ↓
  ┌─────────────────────────────────────┐
  │ 1. Check websiteScraping limiter    │
  │    - Can make request?              │
  │    - If no: wait until slot free    │
  │    - Record request                 │
  └─────────────────────────────────────┘
  ↓
  ┌─────────────────────────────────────┐
  │ 2. Scrape website with Puppeteer   │
  │    - Browser pool manages instances │
  │    - Extract HTML/text              │
  └─────────────────────────────────────┘
  ↓
  ┌─────────────────────────────────────┐
  │ 3. Check azureOpenAI limiter        │
  │    - Can make request?              │
  │    - If no: wait until slot free    │
  │    - Record request                 │
  └─────────────────────────────────────┘
  ↓
  ┌─────────────────────────────────────┐
  │ 4. Call Azure OpenAI API            │
  │    - Generate prompts               │
  │    - Get AI recommendations         │
  │    - If 429: auto-throttle          │
  └─────────────────────────────────────┘
  ↓
  ┌─────────────────────────────────────┐
  │ 5. User-configured delay            │
  │    - Wait batchDelay seconds        │
  │    - Show progress notification     │
  └─────────────────────────────────────┘
  ↓
Next URL
```

---

## 💡 Best Practices

### For Small Batches (1-5 URLs)

```
Delay: 2-3 seconds
Why: Minimal impact, fast completion
Time: ~10-15 seconds total
```

### For Medium Batches (5-15 URLs)

```
Delay: 5-7 seconds ✅ Recommended
Why: Good balance of speed and safety
Time: ~1-2 minutes total
```

### For Large Batches (15-50 URLs)

```
Delay: 10-15 seconds
Why: Ensures no rate limits hit
Time: ~3-12 minutes total
Tip: Run during lunch break!
```

### For Very Large Batches (50+ URLs)

```
Delay: 15-30 seconds
Why: Maximum safety, run overnight
Time: 12-25 minutes
Tip: Consider splitting into multiple sessions
```

---

## 🚨 Error Handling

### Rate Limit Hit (429 Error)

**What Happens:**
1. Error detected automatically
2. Limiter enters throttle mode
3. Waits 60 seconds (or `Retry-After` value)
4. Shows notification: "Rate limit hit. Pausing for 30 seconds..."
5. Resumes automatically
6. Continues with remaining URLs

**User sees:**
```
ℹ️ Analyzed 5/20. Next URL in 5s...
⚠️ Rate limit hit. Pausing for 30 seconds...
ℹ️ Resuming... Analyzed 6/20. Next URL in 5s...
```

### Network Errors

**What Happens:**
1. Individual URL fails
2. Error logged
3. Continues with next URL
4. Final report shows: "18 succeeded, 2 failed"

### Browser Timeout

**What Happens:**
1. Page load timeout (30s default)
2. Falls back to LLM scores only
3. Still saves analysis data
4. Continues batch

---

## 📊 Monitoring

### Rate Limit Status API

**Endpoint:** `GET /api/unified/rate-limit-status`

**Response:**
```json
{
  "azureOpenAI": {
    "requestsInLastMinute": 3,
    "maxRequestsPerMinute": 10,
    "utilizationPercent": "30.0",
    "isThrottling": false,
    "canMakeRequest": true,
    "timeSinceLastRequest": 5234,
    "nextAvailableIn": 0
  },
  "websiteScraping": {
    "requestsInLastMinute": 2,
    "maxRequestsPerMinute": 5,
    "utilizationPercent": "40.0",
    "isThrottling": false,
    "canMakeRequest": true,
    "timeSinceLastRequest": 8123,
    "nextAvailableIn": 0
  }
}
```

### Logs

Backend logs show rate limiting in action:

```
[RateLimiter] Rate limit slot acquired for website scraping
[RateLimiter] Rate limit slot acquired for Azure OpenAI
[RateLimiter] Rate limit reached. Waiting 2340ms before next request
[RateLimiter] Manual throttle activated for 60000ms
[RateLimiter] Throttling period ended
```

---

## 🎯 Real-World Examples

### Example 1: Analyzing 20 URLs

**Settings:**
- Selected URLs: 20
- Delay: 5 seconds
- Estimated time: 2 minutes

**Timeline:**
```
0:00 - Start analysis
0:05 - URL 1 complete
0:10 - URL 2 complete
0:15 - URL 3 complete
...
1:35 - URL 19 complete
1:40 - URL 20 complete
✅ All done!
```

**Server Load:**
- Max concurrent browsers: 2 (from pool)
- Max API calls/min: 5 (well under limit)
- No rate limit errors
- No website overload

### Example 2: Hit Rate Limit

**Scenario:** User sets 2-second delay (too aggressive)

**Timeline:**
```
0:00 - Start analysis (10 URLs)
0:02 - URL 1 complete
0:04 - URL 2 complete
0:06 - URL 3 complete
0:08 - URL 4 complete
0:10 - URL 5 complete
0:12 - URL 6 → 429 Error!
       ⚠️ Rate limit hit. Pausing for 60 seconds...
1:12 - Resuming...
1:14 - URL 6 complete (retry)
1:16 - URL 7 complete
...
```

**User notified:**
- Clear error message
- Automatic pause
- Automatic resume
- No manual intervention needed

---

## 🔮 Future Enhancements

1. **Dynamic Rate Adjustment**
   - Monitor success rates
   - Auto-adjust delay if errors occur
   - Learn optimal delays per domain

2. **Priority Queue**
   - High-priority URLs analyzed first
   - Low-priority URLs during off-peak
   - User-defined priorities

3. **Scheduled Batches**
   - Schedule large batches for off-hours
   - Email notification when complete
   - Cron-style recurring analysis

4. **Rate Limit Dashboard**
   - Real-time utilization graphs
   - Historical trends
   - Predictive capacity planning

---

## 📝 Configuration Checklist

### Initial Setup

- [ ] Check your Azure OpenAI tier (Free/Standard/Premium)
- [ ] Set appropriate `maxRequestsPerMinute` in `rateLimiter.js`
- [ ] Test with 3-5 URLs first
- [ ] Monitor backend logs for rate limit warnings
- [ ] Adjust delays based on results

### Before Large Batches

- [ ] Select URLs (10-20 recommended per batch)
- [ ] Open batch settings
- [ ] Set delay: 5-10s for 10-20 URLs
- [ ] Check estimated time
- [ ] Click "Analyze"
- [ ] Monitor progress notifications
- [ ] Don't close browser until complete

### If Rate Limits Hit

- [ ] Note the error in logs
- [ ] Increase batch delay (e.g., 5s → 10s)
- [ ] Reduce URLs per batch (e.g., 20 → 10)
- [ ] Wait for throttle period to end
- [ ] Retry with safer settings

---

## 🆘 Troubleshooting

### "Rate limit hit" appears frequently

**Solution:**
- Increase `batchDelay` from 5s to 10s or more
- Reduce URLs per batch (10-15 max)
- Check Azure OpenAI tier limits
- Consider upgrading Azure tier

### Analysis is too slow

**Solution:**
- Decrease `batchDelay` from 10s to 5s
- Analyze fewer URLs per batch, more frequently
- Split large batches into smaller ones
- Run during off-peak hours

### Browser crashes

**Solution:**
- Not a rate limit issue (browser pool problem)
- Reduce `PUPPETEER_POOL_SIZE` in backend config
- Increase server memory
- Analyze fewer URLs simultaneously

---

**Status:** ✅ Implemented and Active  
**Version:** 1.0  
**Date:** December 2024  
**Impact:** Prevents 429 errors, protects customer sites, ensures stable batch operations


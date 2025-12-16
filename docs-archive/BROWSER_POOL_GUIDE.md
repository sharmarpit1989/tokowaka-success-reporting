# Browser Pool Configuration Guide

## 🤔 Why Are 2 Browsers Launching at Startup?

When you start the backend server, you see this **twice**:

```
Puppeteer old Headless deprecation warning: ...
```

This is **intentional and expected behavior** ✅

---

## 🎯 What is the Browser Pool?

The AI Visibility Dashboard uses a **Browser Pool** system that pre-launches Puppeteer browser instances at startup for better performance.

### Without Browser Pool ❌

```
User clicks "Analyze This URL"
  ↓
🕐 Launch browser (3-4 seconds)
  ↓
🕐 Analyze content (10-20 seconds)
  ↓
🕐 Close browser (1 second)
  ↓
Total: 14-25 seconds
```

### With Browser Pool ✅

```
Server starts
  ↓
🚀 Pre-launch 2 browsers (startup overhead)

Then when user clicks "Analyze This URL"
  ↓
⚡ Grab browser from pool (instant)
  ↓
🕐 Analyze content (10-20 seconds)
  ↓
⚡ Return browser to pool (instant)
  ↓
Total: 10-20 seconds (3-5 seconds faster!)
```

---

## 📊 Default Configuration

**Location:** `backend/utils/config.js`

```javascript
puppeteer: {
  poolSize: 2,  // ← 2 browsers pre-launched at startup
  concurrency: 3,
  timeout: 30000,
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
}
```

### What Each Setting Means

| Setting | Default | Purpose |
|---------|---------|---------|
| `poolSize` | **2** | Number of browsers pre-launched at startup |
| `concurrency` | 3 | Max concurrent analyses |
| `timeout` | 30000 | Analysis timeout (30 seconds) |
| `headless` | `'new'` | Run in new headless mode |

---

## ⚙️ How to Change Pool Size

### Option 1: Single Browser (Minimal Memory) 🪶

```bash
# In backend/.env
PUPPETEER_POOL_SIZE=1
```

**When to use:**
- ✅ Low-memory environments (< 4GB RAM)
- ✅ Development on laptops
- ✅ Single-user scenarios
- ❌ Not for concurrent analyses

**Startup logs:**
```
[browser-pool] info: Initializing browser pool with 1 browsers
[browser-pool] debug: Browser 1/1 created
[browser-pool] info: Browser pool initialized with 1 browsers
```

### Option 2: Default (2 Browsers) ⚖️

```bash
# In backend/.env
PUPPETEER_POOL_SIZE=2   # OR just leave it unset (default)
```

**When to use:**
- ✅ Balanced performance and memory
- ✅ Most production scenarios
- ✅ 2-3 concurrent users
- ✅ **Recommended default** 👍

**Startup logs:**
```
[browser-pool] info: Initializing browser pool with 2 browsers
[browser-pool] debug: Browser 1/2 created
[browser-pool] debug: Browser 2/2 created
[browser-pool] info: Browser pool initialized with 2 browsers
```

### Option 3: High Concurrency (5+ Browsers) 🚀

```bash
# In backend/.env
PUPPETEER_POOL_SIZE=5
```

**When to use:**
- ✅ High-memory servers (16GB+ RAM)
- ✅ Multiple concurrent users
- ✅ Batch URL processing
- ❌ Not for development laptops

**Startup logs:**
```
[browser-pool] info: Initializing browser pool with 5 browsers
[browser-pool] debug: Browser 1/5 created
[browser-pool] debug: Browser 2/5 created
[browser-pool] debug: Browser 3/5 created
[browser-pool] debug: Browser 4/5 created
[browser-pool] debug: Browser 5/5 created
[browser-pool] info: Browser pool initialized with 5 browsers
```

---

## 🔧 Configuration Example

### Full `.env` Configuration

```bash
# Backend Configuration
PORT=3000
NODE_ENV=development

# Browser Pool Settings
PUPPETEER_POOL_SIZE=2           # Number of pre-launched browsers
PUPPETEER_CONCURRENCY=3         # Max concurrent analyses
ANALYSIS_TIMEOUT=30000          # 30 seconds per URL
PUPPETEER_HEADLESS=true         # Run headless (set to 'false' to see browser)

# Azure OpenAI (for prompts generation)
AZURE_OPENAI_KEY=your-key-here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_COMPLETION_DEPLOYMENT=gpt-4o
```

---

## 💾 Memory Usage

### Approximate RAM Usage per Browser

| Browser State | Memory Usage |
|--------------|--------------|
| Idle browser | ~100-150 MB |
| Active analysis | ~200-400 MB |
| Peak (complex page) | ~500-800 MB |

### Total Memory for Different Pool Sizes

| Pool Size | Idle | Active | Recommended RAM |
|-----------|------|--------|-----------------|
| 1 browser | 150 MB | 400 MB | 2GB+ |
| 2 browsers | 300 MB | 800 MB | 4GB+ |
| 5 browsers | 750 MB | 2 GB | 8GB+ |

**Note:** These are in addition to Node.js (~100MB) and your OS requirements.

---

## 🚫 Disabling Pre-launch (Not Recommended)

If you absolutely want to disable pre-launch (not recommended for performance):

**This requires code changes** - the current implementation always initializes the pool. However, setting `PUPPETEER_POOL_SIZE=1` will minimize the overhead to just one browser.

---

## ✅ Deprecation Warning Fixed

**Before:**
```
Puppeteer old Headless deprecation warning:
  In the near future `headless: true` will default to the new Headless mode
  for Chrome instead of the old Headless implementation.
```

**After (Fixed):**
```javascript
// backend/utils/browserPool.js
const browser = await puppeteer.launch({
  headless: config.puppeteer.headless === false ? false : 'new',  // ← Now uses 'new' mode
  args: config.puppeteer.args
});
```

**No more warnings!** ✅

---

## 📈 Performance Comparison

### Single URL Analysis

| Configuration | First Analysis | Subsequent Analyses |
|--------------|----------------|---------------------|
| No pool (launch each time) | 14-25s | 14-25s |
| Pool size: 1 | 10-20s | 10-20s |
| Pool size: 2 | 10-20s | 10-20s |

**Speed improvement:** ~20-30% faster ⚡

### Concurrent Analysis (2 URLs at once)

| Configuration | Time to Complete |
|--------------|------------------|
| No pool | 28-50s (sequential) |
| Pool size: 1 | 28-50s (sequential) |
| Pool size: 2 | 14-25s (parallel) ⚡ |

**Speed improvement:** ~50% faster for concurrent requests! 🚀

---

## 🔍 Monitoring the Pool

### Check Pool Status via API

```bash
GET http://localhost:3000/api/health
```

**Response:**
```json
{
  "status": "ok",
  "uptime": 123.45,
  "timestamp": "2025-01-08T12:00:00.000Z",
  "browserPool": {
    "poolSize": 2,
    "totalBrowsers": 2,
    "available": 2,
    "inUse": 0,
    "initialized": true
  }
}
```

### Backend Logs

Watch for these log messages:

```bash
# Startup
[browser-pool] info: Initializing browser pool with 2 browsers
[browser-pool] debug: Browser 1/2 created
[browser-pool] debug: Browser 2/2 created
[browser-pool] info: Browser pool initialized with 2 browsers

# During analysis
[browser-pool] debug: Browser acquired. Available: 1, In use: 1
[browser-pool] debug: Browser released. Available: 2, In use: 0

# Shutdown
[browser-pool] info: Shutting down browser pool
[browser-pool] info: Browser pool shut down
```

---

## 🐛 Troubleshooting

### "Browser pool not initialized"

**Cause:** Pool failed to initialize at startup

**Solution:**
1. Check backend logs for errors
2. Ensure sufficient memory available
3. Try `PUPPETEER_POOL_SIZE=1`

### "All browsers in use, waiting..."

**Cause:** All pooled browsers are currently analyzing URLs

**What happens:** Request waits in queue until browser becomes available

**Solution:**
- ✅ Wait (usually < 30 seconds)
- ✅ Increase `PUPPETEER_POOL_SIZE` for more concurrent analyses

### Memory Issues

**Symptoms:**
- System becomes slow
- "Out of memory" errors
- Browsers crashing

**Solutions:**
1. **Reduce pool size:**
   ```bash
   PUPPETEER_POOL_SIZE=1
   ```

2. **Reduce analysis timeout:**
   ```bash
   ANALYSIS_TIMEOUT=15000  # 15 seconds
   ```

3. **Close other applications**

4. **Upgrade RAM** (if running production)

---

## 📝 Summary

### Quick Answers

**Q: Why are 2 browsers launching at startup?**  
A: This is the browser pool optimization for faster analysis. It's intentional and improves performance by 20-50%.

**Q: How do I change it to 1 browser?**  
A: Add `PUPPETEER_POOL_SIZE=1` to `backend/.env`

**Q: Does this use more memory?**  
A: Yes, ~300MB idle (2 browsers × 150MB), but analysis is much faster.

**Q: Can I disable it completely?**  
A: Set `PUPPETEER_POOL_SIZE=1` to minimize overhead. Full disable requires code changes.

**Q: How do I know if it's working?**  
A: Check `http://localhost:3000/api/health` or watch backend logs for "Browser pool initialized"

---

## 🎯 Recommended Settings

### Development (Local Laptop)
```bash
PUPPETEER_POOL_SIZE=1    # Minimal memory
ANALYSIS_TIMEOUT=30000
```

### Production (Small Server, 4-8GB RAM)
```bash
PUPPETEER_POOL_SIZE=2    # Default, balanced
ANALYSIS_TIMEOUT=30000
```

### Production (Large Server, 16GB+ RAM)
```bash
PUPPETEER_POOL_SIZE=5    # High concurrency
ANALYSIS_TIMEOUT=60000   # More time for complex pages
```

---

**The browser pool is a performance optimization that makes your dashboard faster and more responsive!** 🚀


# Troubleshooting Guide

**Quick solutions to common problems**

## Table of Contents

- [Setup & Installation Issues](#setup--installation-issues)
- [Server Startup Problems](#server-startup-problems)
- [Performance Issues](#performance-issues)
- [Analysis Failures](#analysis-failures)
- [Upload Problems](#upload-problems)
- [Browser/Puppeteer Issues](#browserpuppeteer-issues)
- [Known Bugs & Fixes](#known-bugs--fixes)
- [Error Messages Explained](#error-messages-explained)

---

## Setup & Installation Issues

### "Cannot find module" errors

**Solution:**
```bash
# Remove and reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### "Node.js version mismatch"

**Solution:**
```bash
# Check your version
node --version

# Need 18.0.0 or higher
# Download from: https://nodejs.org/
```

### ".env file not found"

**Solution:**
```bash
# Copy the example file
copy backend\config\env.example.txt backend\.env

# Edit with your keys
notepad backend\.env
```

---

## Server Startup Problems

### "Port 3000 already in use"

**Symptoms**: Error `EADDRINUSE` when starting backend

**Solution:**

**Windows:**
```powershell
# Find the process
netstat -ano | findstr :3000

# Kill it (replace <PID> with actual number)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Alternative**: Change the port in `backend/.env`:
```env
PORT=3001
```

### "Frontend won't connect to backend"

**Symptoms**: API errors, CORS errors, network failures in browser

**Checklist:**
1. ✅ Backend running on port 3000?
2. ✅ Frontend running on port 5173?
3. ✅ Check CORS settings in `backend/server.js`
4. ✅ Check browser console for errors

**Solution:**
```env
# In backend/.env, add:
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### "Azure OpenAI errors on startup"

**Symptoms**: Warning about Azure OpenAI connection

**Solution:**
```env
# Verify these in backend/.env:
AZURE_OPENAI_KEY=your-actual-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4

# No quotes around values!
# Endpoint must include https:// and trailing slash
```

**Note**: Azure OpenAI is optional. System works without it, but AI recommendations won't be available.

---

## Performance Issues

### System is slow/sluggish

**Common causes:**

#### 1. Browser pool too small

**Symptoms**: Analysis takes 6+ seconds per URL

**Solution:**
```env
# In backend/.env
PUPPETEER_POOL_SIZE=3  # Increase from default of 2
```

**Trade-off**: More browsers = more memory usage

#### 2. Too many concurrent analyses

**Symptoms**: System freezes during analysis

**Solution:**
```env
# In backend/.env
PUPPETEER_CONCURRENCY=2  # Reduce from default of 3
```

#### 3. Cache not working

**Symptoms**: Dashboard requests take 30+ seconds every time

**Solution:**
```bash
# Check health endpoint
curl http://localhost:3000/api/health

# Look for cache hits/misses
# If all misses, cache might not be working
# Restart the server
```

**Already fixed**: Dashboard cache increased from 10 seconds to 5 minutes.

#### 4. Memory leak

**Symptoms**: System gets slower over time, high memory usage

**Solution:**
```bash
# Restart the server
# This clears memory and browser pool

# Long-term: Reduce pool size
PUPPETEER_POOL_SIZE=1
```

### Dashboard API extremely slow (30-150 seconds)

**This was a major bug - FIXED**

**Root cause**: O(n²) nested loops processing citation data

**Fix applied**: Optimized to O(n) with hash map lookups

**If still slow:**
1. Check citation file size (should be under 10MB)
2. Reduce URL count in project
3. Check `logs/error.log` for errors

---

## Analysis Failures

### "net::ERR_HTTP2_PROTOCOL_ERROR" - HTTP/2 Protocol Error

**Symptoms**: Analysis fails with "ERR_HTTP2_PROTOCOL_ERROR at https://..." error message

**What this means**: The website is either blocking automated browser access or having HTTP/2 connection issues.

**Common causes:**
1. 🚫 Website has bot detection / anti-automation protection
2. 🔒 Server-side HTTP/2 configuration issues
3. 🌐 Network/SSL handshake problems
4. ⏱️ Intermittent connection issues

**Solutions:**

**Quick Fix (Retry):**
The system now automatically retries with different connection settings. Simply try analyzing the URL again - it may work on the second attempt.

**If problem persists:**

1. **Check if URL is publicly accessible:**
   ```bash
   # Try accessing in your browser first
   # If it loads fine, the issue is likely bot detection
   ```

2. **Try a different page from the same domain:**
   ```bash
   # Some pages have stricter protection than others
   # Try analyzing a simpler page first (e.g., blog post vs. login page)
   ```

3. **Check backend logs for retry attempts:**
   ```bash
   # Backend will log multiple retry attempts
   # Look for: "Navigation attempt X failed" and "Navigation successful on final retry"
   ```

4. **Temporary vs. Persistent:**
   - If error occurs once then works: Temporary network issue ✅
   - If error occurs every time: Site blocking automation ❌

**Workaround:** Focus on analyzing pages that don't have aggressive bot protection (blog posts, help docs, FAQs usually work better than login pages, pricing pages).

---

### "Azure OpenAI API error: 401" - Authentication Error

**Symptoms**: Analysis completes but AI recommendations show "401" error or are empty

**What this means**: Azure OpenAI API key is invalid, expired, or not configured

**Solution:**

1. **Check if API key is set:**
   ```bash
   # In backend/.env file
   AZURE_OPENAI_KEY=your-key-here
   AZURE_OPENAI_ENDPOINT=your-endpoint-here
   ```

2. **Verify API key is valid:**
   - Log into Azure Portal
   - Check OpenAI resource
   - Regenerate key if expired
   - Update `.env` file with new key

3. **Restart backend server:**
   ```bash
   cd backend
   npm start
   ```

**Note:** The analysis will still provide LLM presence scores even without Azure OpenAI. You'll just miss out on the AI-generated recommendations and prompts.

---

### "Analysis failed" error

**Symptoms**: Analysis runs but returns error

**Checklist:**
1. ✅ Are URLs valid and accessible?
2. ✅ URLs include protocol (https://)?
3. ✅ URLs not behind login/paywall?
4. ✅ Browser pool running? (check `/api/health`)

**Solution:**
```bash
# Check browser pool status
curl http://localhost:3000/api/health | grep browserPool

# Should show: "available": 2

# If 0 available, restart server
```

### Analysis gets stuck / never completes

**Symptoms**: Progress bar stops, no results

**Common causes:**
1. URL timeout (page takes too long to load)
2. Browser crash
3. Memory exhaustion

**Solution:**
```env
# Increase timeout (default: 30s)
ANALYSIS_TIMEOUT=60000  # 60 seconds

# Reduce concurrency
PUPPETEER_CONCURRENCY=1

# Check logs
tail -f logs/error.log
```

### "Session with given id not found"

**This is a known bug - FIXED**

**Root cause**: Race condition in browser pool when closing pages

**Symptoms**: Random analysis failures under load

**Fix applied**: Proper page lifecycle management in browser pool

**If still occurring:**
1. Restart server
2. Reduce pool size to 1
3. Check [docs-archive/QA_BUGS_FOUND_RUNTIME.md](docs-archive/QA_BUGS_FOUND_RUNTIME.md) for details

### Zero citations returned

**This was a major bug - FIXED**

**Root cause**: Field name mismatch (`url` vs `URL`) in citation upload

**Fix applied**: Support both `url` and `URL` column names

**If still seeing zeros:**
1. Check Excel column names (should be "URL" or "url")
2. Verify date format in Excel
3. Check week format (should be "2024-W01")

---

## Upload Problems

### "Upload failed" error

**Symptoms**: File upload returns error

**Checklist:**
1. ✅ File is CSV or Excel (.xlsx)?
2. ✅ File size under 10MB?
3. ✅ File has URL column?
4. ✅ URLs are valid format?

**Solution for CSV:**
```csv
url
https://example.com/page1
https://example.com/page2
```

**Solution for Excel:**
```
Column A header: "URL" or "url"
Row 2+: One URL per row
```

### Citation upload succeeds but shows zero results

**See "Zero citations returned" above**

**Quick fix:**
1. Check column name is "URL" (capital) in Excel
2. Re-upload file
3. Verify date/week columns exist

### File upload timeout

**Symptoms**: Upload takes forever or times out

**Causes:**
1. File too large
2. Too many URLs
3. Network issue

**Solution:**
```bash
# Split file into smaller chunks
# Max recommended: 1000 URLs per file

# For large files, increase timeout:
# In backend/routes/citations.js
upload.timeout = 120000; // 2 minutes
```

---

## Browser/Puppeteer Issues

### "Browser launch failed"

**Symptoms**: Error on startup about Chromium/Chrome

**Windows Solution:**
```bash
# Usually just missing dependencies
# Puppeteer includes Chromium, should work out of box

# If not, install Chrome:
# https://www.google.com/chrome/
```

**Linux Solution:**
```bash
# Install Chromium dependencies
sudo apt-get update
sudo apt-get install -y \
  chromium-browser \
  libgbm-dev \
  libnss3 \
  libatk-bridge2.0-0 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2
```

**Mac Solution:**
```bash
# Install Chromium
brew install chromium

# Or use system Chrome
# Puppeteer will find it automatically
```

### Browser crashes during analysis

**Symptoms**: Analysis stops partway, error about browser disconnected

**Solutions:**

**Short-term:**
```env
# Reduce pool size
PUPPETEER_POOL_SIZE=1

# Reduce concurrency
PUPPETEER_CONCURRENCY=1
```

**Long-term:**
```javascript
// Check for memory leaks
// Monitor memory usage in health endpoint
// Restart server periodically if memory grows
```

### "Page closed" errors

**This was a bug - FIXED**

**Root cause**: Pages being closed twice (by service and by pool)

**Fix applied**: Services no longer close pages manually

**If still occurring**: Update to latest code version

---

## Known Bugs & Fixes

### 🐛 Bug #1: Browser Pool Race Condition

**Status**: FIXED ✅

**Symptoms**:
- "Session with given id not found" errors
- Random analysis failures
- 40% failure rate under load

**Root cause**: Pages closed while still in use

**Fix**: Proper page tracking and lifecycle management

**Details**: [docs-archive/QA_BUGS_FOUND_RUNTIME.md](docs-archive/QA_BUGS_FOUND_RUNTIME.md)

### 🐛 Bug #2: Citation Upload Field Mismatch

**Status**: FIXED ✅

**Symptoms**:
- All citation rates show 0%
- Upload succeeds but no data

**Root cause**: Code expected lowercase `url`, Excel had uppercase `URL`

**Fix**: Support both `url` and `URL` column names

**Details**: [docs-archive/ZERO_CITATIONS_BUG_FIX.md](docs-archive/ZERO_CITATIONS_BUG_FIX.md)

### 🐛 Bug #3: Dashboard Performance Crisis

**Status**: FIXED ✅

**Symptoms**:
- Dashboard API takes 30-150 seconds
- System unusable
- Frontend freezes

**Root causes**:
1. O(n²) nested loops (7.5M operations)
2. Cache TTL too short (10 seconds)

**Fixes applied**:
1. Optimized to O(n) with hash maps
2. Increased cache to 5 minutes

**Details**: [docs-archive/PERFORMANCE_CRISIS_FIX.md](docs-archive/PERFORMANCE_CRISIS_FIX.md)

### 🐛 Bug #4: Frontend Cache Not Clearing

**Status**: FIXED ✅

**Symptoms**:
- Stale data showing
- Updates not visible
- Need hard refresh

**Root cause**: Service worker caching aggressively

**Fix**: Proper cache headers and Vite configuration

**Details**: [docs-archive/FRONTEND_CACHE_FIX.md](docs-archive/FRONTEND_CACHE_FIX.md)

---

## Error Messages Explained

### "ValidationError: Invalid URL format"

**Meaning**: URL doesn't match expected format

**Fix**:
```javascript
// URLs must include protocol
✅ https://example.com
❌ example.com
❌ www.example.com

// No spaces or special characters
✅ https://example.com/page-name
❌ https://example.com/page name
```

### "RateLimitError: Too many requests"

**Meaning**: You've exceeded the rate limit (default: 100 requests per 15 minutes)

**Fix**:
```env
# Increase limit in backend/.env
RATE_LIMIT_MAX_REQUESTS=200
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes in ms
```

### "AnalysisError: Timeout exceeded"

**Meaning**: Page took too long to load (default: 30 seconds)

**Fix**:
```env
# Increase timeout
ANALYSIS_TIMEOUT=60000  # 60 seconds
```

### "BrowserPoolError: No browsers available"

**Meaning**: All browsers in pool are busy

**Fix**:
```env
# Increase pool size
PUPPETEER_POOL_SIZE=3

# Or reduce concurrency
PUPPETEER_CONCURRENCY=2
```

### "CacheError: Cache miss"

**Meaning**: Requested data not in cache (informational, not an error)

**Fix**: No action needed. This is normal on first request.

### "NotFoundError: Project not found"

**Meaning**: Project ID doesn't exist

**Fix**:
- Verify project ID is correct
- Check `data/projects/` folder
- Project might have been deleted

---

## Performance Tuning Guide

### For Small Deployments (1-5 users)

```env
PUPPETEER_POOL_SIZE=2
PUPPETEER_CONCURRENCY=3
CACHE_TTL=300
LOG_LEVEL=info
```

### For Medium Deployments (5-20 users)

```env
PUPPETEER_POOL_SIZE=4
PUPPETEER_CONCURRENCY=5
CACHE_TTL=600
LOG_LEVEL=warn
```

### For Large Deployments (20+ users)

```env
PUPPETEER_POOL_SIZE=8
PUPPETEER_CONCURRENCY=10
CACHE_TTL=900
LOG_LEVEL=error

# Consider:
# - Adding Redis for caching
# - Moving to database (not JSON files)
# - Load balancing multiple instances
```

### For Low-Memory Systems

```env
PUPPETEER_POOL_SIZE=1
PUPPETEER_CONCURRENCY=1
CACHE_TTL=120
```

---

## Debugging Tips

### Check System Health

```bash
# Full health check
curl http://localhost:3000/api/health

# Pretty print with jq
curl http://localhost:3000/api/health | jq
```

### View Logs

```bash
# All logs
tail -f logs/combined.log

# Errors only
tail -f logs/error.log

# Last 100 lines
tail -100 logs/combined.log

# Filter by service
grep "hybrid-analyzer" logs/combined.log

# Filter by level
grep "ERROR" logs/combined.log
```

### Enable Debug Logging

```env
# In backend/.env
LOG_LEVEL=debug
```

Then restart and check logs.

### Test Individual Components

```bash
# Test backend health
curl http://localhost:3000/api/health

# Test frontend
curl http://localhost:5173

# Test browser pool
curl http://localhost:3000/api/health | jq .browserPool

# Test cache
curl http://localhost:3000/api/health | jq .cache
```

---

## When to Restart vs Reconfigure

### Restart Server When:
- Changing environment variables
- Memory usage high
- Browser pool issues
- Cache problems
- After code updates

### Reconfigure Without Restart:
- Frontend code changes (auto-reloads)
- Can't reconfigure without restart (need to restart for config changes)

### Full Reset (Nuclear Option):
```bash
# Stop all servers
# Delete generated data
rm -rf data/results/*
rm -rf data/uploads/*
rm -rf logs/*

# Reinstall dependencies
cd backend && rm -rf node_modules && npm install
cd frontend && rm -rf node_modules && npm install

# Start fresh
start.bat
```

---

## Getting More Help

### Check Detailed Documentation

All 40+ detailed docs are archived in [docs-archive/](docs-archive/):

- **Browser issues**: `BROWSER_POOL_GUIDE.md`, `BROWSER_STARTUP_FIX.md`
- **Performance**: `OPTIMIZATION_SUMMARY.md`, `PERFORMANCE_TIPS.md`
- **Uploads**: `CITATION_UPLOAD_MULTER_FIX.md`, `DEBUG_CITATION_UPLOAD.md`
- **Bugs**: `QA_BUGS_FOUND_RUNTIME.md`
- **And 30+ more...**

### Check Related Guides

- **Setup issues**: [GETTING_STARTED.md](GETTING_STARTED.md)
- **How to use**: [USER_GUIDE.md](USER_GUIDE.md)
- **Development**: [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
- **Project history**: [PROJECT_HISTORY.md](PROJECT_HISTORY.md)

---

## Quick Reference Table

| Symptom | Likely Cause | Quick Fix |
|---------|--------------|-----------|
| Port in use | Server already running | Kill process on port 3000 |
| Can't find module | Missing dependencies | `npm install` |
| Slow analysis | Pool too small | Increase `PUPPETEER_POOL_SIZE` |
| High memory | Pool too large | Reduce `PUPPETEER_POOL_SIZE` |
| Upload fails | Wrong format | Check CSV/Excel format |
| Zero citations | Field mismatch | Already fixed, update code |
| Browser crash | Out of memory | Reduce pool/concurrency |
| Analysis stuck | Timeout too short | Increase `ANALYSIS_TIMEOUT` |
| Rate limited | Too many requests | Increase rate limit |
| Stale data | Cache issue | Restart server |

---

**Still stuck? Check the detailed documentation in [docs-archive/](docs-archive/) or the QA audit reports for comprehensive troubleshooting.**


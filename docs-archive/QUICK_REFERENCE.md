# Quick Reference Guide

## 🚀 Getting Started

### Installation
```bash
# Windows
INSTALL_OPTIMIZATIONS.bat

# Linux/Mac
cd backend && npm install && cd ../frontend && npm install
```

### Starting the Application
```bash
# Windows
START.bat

# Linux/Mac
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

### Access Points
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/api/health

## 📊 Key Features

### Content Analysis
1. Upload CSV/Excel with URLs
2. Click "Run Analysis"
3. Monitor progress in real-time
4. View results with LLM presence scores

### Citation Tracking
1. Upload brand presence Excel files
2. View citation rates by platform
3. Track trends over time
4. Export reports

### Unified Dashboard
1. Create project from URL file
2. Upload brand presence data
3. Run content analysis
4. View combined metrics

## 🔧 Configuration

### Essential Environment Variables
```env
# Required
AZURE_OPENAI_KEY=your-key        # For AI recommendations
SPACECAT_API_KEY=your-key        # For traffic data (optional)

# Performance (defaults are good)
PUPPETEER_POOL_SIZE=2            # Browser instances
CACHE_TTL=300                    # Cache duration (seconds)
LOG_LEVEL=info                   # debug|info|warn|error

# Security (defaults are good)
RATE_LIMIT_MAX_REQUESTS=100      # Per 15 minutes
```

## 🛠️ Common Tasks

### Viewing Logs
```bash
# Real-time
tail -f logs/combined.log

# Errors only
tail -f logs/error.log

# Windows PowerShell
Get-Content logs/combined.log -Wait
```

### Checking System Health
```bash
# curl
curl http://localhost:3000/api/health

# Browser
# Visit http://localhost:3000/api/health
```

### Clearing Cache
```javascript
// In backend code
const { clearAll } = require('./utils/cache');
clearAll();

// Or restart the server
```

### Adjusting Browser Pool Size
```env
# .env file
PUPPETEER_POOL_SIZE=3  # Increase for more parallelism
```

## 🐛 Troubleshooting

### Server won't start
1. Check if port 3000 is available
2. Verify `.env` file exists in backend/
3. Check logs: `logs/error.log`

### Analysis is slow
1. Increase browser pool: `PUPPETEER_POOL_SIZE=3`
2. Reduce timeout: `ANALYSIS_TIMEOUT=20000`
3. Check browser pool status at `/api/health`

### Out of memory
1. Reduce pool size: `PUPPETEER_POOL_SIZE=1`
2. Reduce concurrency: `PUPPETEER_CONCURRENCY=2`
3. Close unused pages in browsers

### Cache issues
1. Clear cache via health endpoint
2. Reduce cache size: `CACHE_MAX_KEYS=500`
3. Reduce TTL: `CACHE_TTL=120`

### Rate limiting errors
1. Increase limit: `RATE_LIMIT_MAX_REQUESTS=200`
2. Increase window: `RATE_LIMIT_WINDOW_MS=1800000` (30 min)

## 📝 API Quick Reference

### Content Analysis
```javascript
// Upload URLs
POST /api/analysis/run
Body: { urls: ['https://...'], options: {} }

// Check status
GET /api/analysis/status/:jobId

// Get results
GET /api/analysis/results/:jobId
```

### Citations
```javascript
// Upload brand presence
POST /api/citations/upload
Body: FormData with files

// Get rates
GET /api/citations/rates?platform=chatgpt&week=2024-W01
```

### Unified Analysis
```javascript
// Create project
POST /api/unified/create-from-file
Body: FormData with file and domain

// Get dashboard
GET /api/unified/:projectId/dashboard
```

## 🔍 Monitoring

### Check Browser Pool
```bash
curl http://localhost:3000/api/health | jq .browserPool
```

### Check Cache Stats
```bash
curl http://localhost:3000/api/health | jq .cache
```

### View Active Logs
```bash
# All logs
tail -f logs/combined.log

# Filter by service
tail -f logs/combined.log | grep "hybrid-analyzer"

# Filter by level
tail -f logs/combined.log | grep "ERROR"
```

## 🎯 Performance Tips

### For Analysis Jobs
1. Use browser pooling (automatic)
2. Process URLs in batches
3. Monitor memory usage
4. Use appropriate timeouts

### For API Calls
1. Cache is automatic
2. Use pagination for large datasets
3. Implement client-side debouncing
4. Use service layer (frontend)

### For Large Deployments
1. Increase pool size: `PUPPETEER_POOL_SIZE=5`
2. Use Redis for caching (future)
3. Enable database (future)
4. Use CDN for assets

## 🔒 Security Best Practices

1. **Never commit `.env` files**
2. **Use strong API keys**
3. **Enable rate limiting in production**
4. **Keep dependencies updated:**
   ```bash
   npm audit
   npm audit fix
   ```
5. **Use HTTPS in production**
6. **Set proper CORS origins:**
   ```env
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

## 📚 Documentation Links

- [Full Optimization Details](OPTIMIZATION_SUMMARY.md)
- [Environment Variables](ENVIRONMENT_VARIABLES.md)
- [Deployment Guide](DEPLOYMENT_READY.md)
- [Project Summary](PROJECT_SUMMARY.md)
- [Main README](README.md)

## 🆘 Support

### Common Issues
1. **Port already in use:** Change `PORT=3001` in `.env`
2. **ECONNREFUSED:** Backend not running
3. **404 errors:** Check API endpoint paths
4. **Timeout errors:** Increase `ANALYSIS_TIMEOUT`
5. **Memory leaks:** Restart server, check browser pool

### Debug Mode
```env
# Enable debug logging
LOG_LEVEL=debug

# Check logs
tail -f logs/combined.log
```

### Performance Monitoring
```javascript
// Check health endpoint regularly
setInterval(async () => {
  const health = await fetch('/api/health').then(r => r.json());
  console.log('Browser pool:', health.browserPool);
  console.log('Cache:', health.cache);
}, 5000);
```

## ✅ Checklist

### Before Running
- [ ] Dependencies installed
- [ ] `.env` file configured
- [ ] Ports 3000 and 5173 available
- [ ] Azure OpenAI key set (optional)

### After Starting
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Health check returns OK
- [ ] Browser pool initialized
- [ ] Logs directory created

### For Production
- [ ] `NODE_ENV=production`
- [ ] Strong API keys
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Logs monitored
- [ ] Backups configured

## 🎉 Quick Wins

1. **40-50% faster analysis** - Automatic via browser pooling
2. **60-80% less bandwidth** - Automatic via compression
3. **Better debugging** - Check `logs/combined.log`
4. **System monitoring** - Visit `/api/health`
5. **Secure by default** - Helmet + rate limiting active

---

**Need more details?** See [OPTIMIZATION_SUMMARY.md](OPTIMIZATION_SUMMARY.md)


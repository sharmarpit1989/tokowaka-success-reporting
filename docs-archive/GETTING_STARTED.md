# Getting Started with AI Visibility Dashboard

**Time to first run: 5 minutes**

## What This Tool Does

This dashboard helps you:
- **Analyze Content**: See how much content AI agents can see (with/without JavaScript)
- **Track Citations**: Monitor how often AI platforms cite your URLs
- **Find Opportunities**: Discover high-traffic pages that need optimization

## Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org/))
- **Azure OpenAI API Key** ([Get it here](https://azure.microsoft.com/products/cognitive-services/openai-service))

## Quick Setup (5 Minutes)

### 1. Install Dependencies

**Windows:**
```bash
cd backend
npm install
cd ../frontend
npm install
```

**This installs everything you need in one go.**

### 2. Configure API Keys

```bash
# Copy the example environment file
copy backend\config\env.example.txt backend\.env

# Edit it with your keys
notepad backend\.env
```

**Required settings:**
```env
# Required for AI recommendations
AZURE_OPENAI_KEY=your-key-here
AZURE_OPENAI_ENDPOINT=your-endpoint-here

# Optional - for traffic data
SPACECAT_API_KEY=your-key-here
```

### 3. Start the Dashboard

**Windows:**
```bash
start.bat
```

**Mac/Linux:**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

### 4. Open the Dashboard

Wait 10 seconds for startup, then visit:
- **Dashboard**: http://localhost:5173
- **Health Check**: http://localhost:3000/api/health

**That's it! You're ready to go.** 🎉

---

## First Steps: What To Do Now

### Try the Content Analysis

1. Go to **"Content Analysis"** tab
2. Click **"Upload URLs"**
3. Drag & drop a CSV/Excel file with URLs (one per line)
4. Click **"Run Analysis"**
5. Watch the progress bar
6. View results showing AI visibility scores

**Example CSV format:**
```
url
https://example.com/page1
https://example.com/page2
```

### Try Citation Tracking

1. Go to **"Citation Performance"** tab
2. Click **"Upload Brand Presence Data"**
3. Upload your brand presence Excel file
4. View citation rates by platform (ChatGPT, Gemini, etc.)
5. See trending citations over time

### Explore Opportunities

1. Go to **"Opportunities"** tab
2. See URLs being cited but not tracked
3. Find high-traffic pages with low citations
4. Prioritize optimization work

---

## Configuration Options

### Performance Tuning

```env
# Increase parallelism (default: 2)
PUPPETEER_POOL_SIZE=3

# Adjust cache duration (default: 300 seconds)
CACHE_TTL=600

# Enable debug logging
LOG_LEVEL=debug
```

### Security Settings

```env
# Rate limiting (default: 100 requests per 15 min)
RATE_LIMIT_MAX_REQUESTS=200

# CORS origins (production only)
ALLOWED_ORIGINS=https://yourdomain.com
```

---

## What's Running?

### Backend (Port 3000)
- Express API server
- Puppeteer browser pool (2 instances by default)
- Content analyzer
- Citation processor

### Frontend (Port 5173)
- React application
- Vite dev server
- Hot reload enabled

### Check System Health

Visit: http://localhost:3000/api/health

You should see:
```json
{
  "status": "ok",
  "browserPool": { "available": 2, "inUse": 0 },
  "cache": { "hits": 0, "misses": 0 },
  "integrations": { "spacecat": true, "azureOpenAI": true }
}
```

---

## Common Startup Issues

### "Port 3000 already in use"

```bash
# Windows - Kill the process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### "Cannot find module"

```bash
# Reinstall dependencies
cd backend && npm install
cd frontend && npm install
```

### "Azure OpenAI error"

Check your `.env` file:
- Is `AZURE_OPENAI_KEY` set?
- Is `AZURE_OPENAI_ENDPOINT` correct?
- Are there quotes around the values? (Remove them)

### "Browser launch failed"

```bash
# Install Chromium dependencies (Linux)
sudo apt-get install -y chromium-browser

# Mac - Install Chromium
brew install chromium
```

---

## Next Steps

✅ **You're all set up!** Now learn how to use the dashboard:

1. Read **[USER_GUIDE.md](USER_GUIDE.md)** - How to use all features
2. Check **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and fixes
3. See **[PROJECT_HISTORY.md](PROJECT_HISTORY.md)** - How this project evolved

---

## Quick Reference

| Task | Command |
|------|---------|
| Start dashboard | `start.bat` (Windows) or manual terminals |
| View logs | `logs/combined.log` |
| Check health | http://localhost:3000/api/health |
| Stop servers | `Ctrl+C` in each terminal |
| Clear cache | Restart servers |
| Update dependencies | `npm install` in backend + frontend |

---

## Need Help?

- **Common Issues**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **How-To Guides**: [USER_GUIDE.md](USER_GUIDE.md)
- **Technical Details**: [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
- **Detailed Archive**: [docs-archive/](docs-archive/) folder

**Enjoy your AI Visibility Dashboard!** 🚀

